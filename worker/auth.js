// Login, sessões e convites (/auth/*). O Worker é a fronteira de segurança: toda
// regra de acesso fica aqui e em api.js, nunca no navegador.
//
// Senhas: PBKDF2-SHA256 com sal aleatório (100 mil iterações, o máximo do Workers).
// Sessões e convites: o navegador recebe um token aleatório; o banco guarda só o SHA-256.
import { ErroHttp, campoTexto, dataSql, json, lerCookie, lerJson } from "./http.js";

const ITERACOES = 100_000;
const COOKIE = "__Host-sessao";
const DURACAO_SESSAO = 30 * 24 * 3600;      // 30 dias
const DURACAO_CONVITE = 7 * 24 * 3600;      // 7 dias
const LIMITE_TENTATIVAS = 10;               // falhas por IP...
const JANELA_TENTATIVAS = 15 * 60;          // ...em 15 minutos
const SENHA_MINIMA = 10;

const codificador = new TextEncoder();
const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
const deHex = texto => Uint8Array.from(texto.match(/../g), par => parseInt(par, 16));

export async function sha256(texto) {
    return hex(await crypto.subtle.digest("SHA-256", codificador.encode(texto)));
}

/** Token aleatório de 32 bytes, em base64url. */
export function tokenAleatorio() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function derivarSenha(senha, salHex) {
    const chave = await crypto.subtle.importKey("raw", codificador.encode(senha), "PBKDF2", false, ["deriveBits"]);
    return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: deHex(salHex), iterations: ITERACOES }, chave, 256);
}

async function gerarHashSenha(senha) {
    const sal = hex(crypto.getRandomValues(new Uint8Array(16)));
    return { hash: hex(await derivarSenha(senha, sal)), sal };
}

async function senhaConfere(senha, usuario) {
    // Sem usuário ou sem senha, deriva mesmo assim: o tempo de resposta não revela se o e-mail existe.
    const sal = usuario?.senha_sal || "00".repeat(16);
    const calculado = await derivarSenha(senha, sal);

    if (!usuario?.senha_hash) return false;

    return crypto.subtle.timingSafeEqual(calculado, deHex(usuario.senha_hash).buffer);
}

function validarSenha(senha) {
    if (typeof senha !== "string" || senha.length < SENHA_MINIMA || senha.length > 200) {
        throw new ErroHttp(400, `A senha precisa ter de ${SENHA_MINIMA} a 200 caracteres.`);
    }
}

const publico = usuario => ({ id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel });

function cookieSessao(token, maxAge) {
    return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

async function abrirSessao(env, usuario) {
    const token = tokenAleatorio();

    await env.DB.batch([
        env.DB.prepare("INSERT INTO sessoes (token_hash, usuario_id, expira_em) VALUES (?, ?, ?)")
            .bind(await sha256(token), usuario.id, dataSql(DURACAO_SESSAO)),
        env.DB.prepare("UPDATE usuarios SET ultimo_acesso = datetime('now') WHERE id = ?").bind(usuario.id),
        env.DB.prepare("DELETE FROM sessoes WHERE expira_em < datetime('now')")
    ]);

    return json(200, { usuario: publico(usuario) }, { "set-cookie": cookieSessao(token, DURACAO_SESSAO) });
}

/** O usuário da sessão do pedido (ativo e com sessão válida), ou null. */
export async function usuarioDaSessao(request, env) {
    const token = lerCookie(request, COOKIE);
    if (!token) return null;

    return await env.DB.prepare(
        `SELECT u.id, u.nome, u.email, u.papel, s.token_hash
           FROM sessoes s JOIN usuarios u ON u.id = s.usuario_id
          WHERE s.token_hash = ? AND s.expira_em > datetime('now') AND u.ativo = 1`
    ).bind(await sha256(token)).first();
}

/** Cria um link de uso único para a pessoa definir a senha. Invalida os anteriores. */
export async function criarConvite(env, usuarioId, origem) {
    const token = tokenAleatorio();

    await env.DB.batch([
        env.DB.prepare("DELETE FROM convites WHERE usuario_id = ? AND usado_em IS NULL").bind(usuarioId),
        env.DB.prepare("INSERT INTO convites (token_hash, usuario_id, expira_em) VALUES (?, ?, ?)")
            .bind(await sha256(token), usuarioId, dataSql(DURACAO_CONVITE))
    ]);

    return { link: `${origem}/convite?token=${token}`, expiraEm: dataSql(DURACAO_CONVITE) };
}

async function conviteValido(env, token) {
    if (typeof token !== "string" || token.length < 20 || token.length > 100) throw new ErroHttp(400, "Link de convite inválido.");

    const convite = await env.DB.prepare(
        `SELECT c.token_hash, u.id, u.nome, u.email, u.papel
           FROM convites c JOIN usuarios u ON u.id = c.usuario_id
          WHERE c.token_hash = ? AND c.usado_em IS NULL AND c.expira_em > datetime('now') AND u.ativo = 1`
    ).bind(await sha256(token)).first();

    if (!convite) throw new ErroHttp(404, "Este link de convite expirou ou já foi usado. Peça um novo.");
    return convite;
}

export async function tratarAuth(request, url, env, usuario) {
    const rota = `${request.method} ${url.pathname}`;

    if (rota === "GET /auth/eu") {
        return usuario ? json(200, { usuario: publico(usuario) }) : json(401, { mensagem: "Sem sessão." });
    }

    if (rota === "POST /auth/entrar") {
        const dados = await lerJson(request);
        const ip = request.headers.get("cf-connecting-ip") || "local";
        const { n } = await env.DB.prepare("SELECT count(*) AS n FROM tentativas_login WHERE ip = ? AND quando > ?")
            .bind(ip, dataSql(-JANELA_TENTATIVAS)).first();

        if (n >= LIMITE_TENTATIVAS) throw new ErroHttp(429, "Muitas tentativas. Aguarde 15 minutos e tente de novo.");

        const email = campoTexto(dados, "email", { maximo: 254 }).toLowerCase();
        const senha = typeof dados.senha === "string" ? dados.senha : "";
        const encontrado = await env.DB.prepare("SELECT * FROM usuarios WHERE email = ? AND ativo = 1").bind(email).first();

        if (!(await senhaConfere(senha, encontrado))) {
            await env.DB.batch([
                env.DB.prepare("INSERT INTO tentativas_login (ip) VALUES (?)").bind(ip),
                env.DB.prepare("DELETE FROM tentativas_login WHERE quando < ?").bind(dataSql(-JANELA_TENTATIVAS))
            ]);
            throw new ErroHttp(401, "E-mail ou senha incorretos.");
        }

        return await abrirSessao(env, encontrado);
    }

    if (rota === "POST /auth/sair") {
        if (usuario) await env.DB.prepare("DELETE FROM sessoes WHERE token_hash = ?").bind(usuario.token_hash).run();
        return json(200, { ok: true }, { "set-cookie": cookieSessao("", 0) });
    }

    if (rota === "GET /auth/convite") {
        const convite = await conviteValido(env, url.searchParams.get("token"));
        return json(200, { nome: convite.nome, email: convite.email });
    }

    if (rota === "POST /auth/convite") {
        const dados = await lerJson(request);
        const convite = await conviteValido(env, dados.token);
        validarSenha(dados.senha);

        const { hash, sal } = await gerarHashSenha(dados.senha);
        await env.DB.batch([
            env.DB.prepare("UPDATE usuarios SET senha_hash = ?, senha_sal = ? WHERE id = ?").bind(hash, sal, convite.id),
            env.DB.prepare("UPDATE convites SET usado_em = datetime('now') WHERE token_hash = ?").bind(convite.token_hash),
            // Senha nova encerra as sessões abertas com a senha anterior.
            env.DB.prepare("DELETE FROM sessoes WHERE usuario_id = ?").bind(convite.id)
        ]);

        return await abrirSessao(env, convite);
    }

    if (rota === "POST /auth/senha") {
        if (!usuario) throw new ErroHttp(401, "Entre novamente.");

        const dados = await lerJson(request);
        const completo = await env.DB.prepare("SELECT * FROM usuarios WHERE id = ?").bind(usuario.id).first();

        if (!(await senhaConfere(typeof dados.atual === "string" ? dados.atual : "", completo))) {
            throw new ErroHttp(400, "A senha atual não confere.");
        }
        validarSenha(dados.nova);

        const { hash, sal } = await gerarHashSenha(dados.nova);
        await env.DB.batch([
            env.DB.prepare("UPDATE usuarios SET senha_hash = ?, senha_sal = ? WHERE id = ?").bind(hash, sal, usuario.id),
            env.DB.prepare("DELETE FROM sessoes WHERE usuario_id = ? AND token_hash <> ?").bind(usuario.id, usuario.token_hash)
        ]);

        return json(200, { ok: true });
    }

    return json(404, { mensagem: "Não encontrado." });
}
