// API do painel (/api/*). Administrador: todo o conteúdo, depoimentos, pessoas e publicação.
// Depoente: só o próprio depoimento (com nome, foto e LinkedIn) e o upload da própria foto.
// O papel é conferido aqui, antes de cada rota; o que cada uma faz fica no arquivo do assunto.
import { ErroHttp, json } from "../http.js";
import { infoImagens, receberImagem, servirImagem } from "../imagens.js";
import { pedirPublicacao } from "../publicar.js";
import { ID_IMAGEM } from "./comum.js";
import { colecao, curriculoAdmin, imagensDoProjeto, salvarPerfil } from "./conteudo.js";
import { depoimentosAdmin, meuDepoimento } from "./depoimentos.js";
import { mensagensAdmin, usuariosAdmin } from "./pessoas.js";

function exigir(usuario, papel) {
    if (!usuario) throw new ErroHttp(401, "Entre novamente.");
    if (papel && usuario.papel !== papel) throw new ErroHttp(403, "Sem permissão.");
}

const lerTodos = async (env, sql, ...parametros) => (await env.DB.prepare(sql).bind(...parametros).all()).results;

/** Tudo o que o painel do administrador mostra. */
async function painel(env) {
    const [perfil, redes, projetos, projetoImagens, servicos, depoimentos, grupos, habilidades, certificacoes, formacoes, experiencias,
        github, usuarios, publicacoes, mensagens, curriculos, imagens] =
        await Promise.all([
            env.DB.prepare("SELECT * FROM perfil WHERE id = 1").first(),
            lerTodos(env, "SELECT * FROM redes_sociais ORDER BY ordem, id"),
            lerTodos(env, "SELECT * FROM projetos ORDER BY ordem, id"),
            lerTodos(env, "SELECT * FROM projeto_imagens ORDER BY projeto_id, ordem"),
            lerTodos(env, "SELECT * FROM servicos ORDER BY ordem, id"),
            lerTodos(env, `SELECT d.*, u.email AS email_usuario FROM depoimentos d LEFT JOIN usuarios u ON u.id = d.usuario_id
                            ORDER BY CASE d.situacao WHEN 'pendente' THEN 0 ELSE 1 END, d.ordem, d.id`),
            lerTodos(env, "SELECT * FROM grupos_habilidades ORDER BY ordem, id"),
            lerTodos(env, "SELECT * FROM habilidades ORDER BY grupo_id, ordem, id"),
            lerTodos(env, "SELECT * FROM certificacoes ORDER BY ordem, id"),
            lerTodos(env, "SELECT * FROM formacoes ORDER BY ordem, id"),
            lerTodos(env, "SELECT * FROM experiencias ORDER BY ordem, id"),
            lerTodos(env, "SELECT * FROM github_repositorios ORDER BY ordem, id"),
            lerTodos(env, `SELECT u.id, u.nome, u.email, u.papel, u.ativo, u.criado_em, u.ultimo_acesso,
                                  (u.senha_hash IS NOT NULL) AS tem_senha,
                                  (SELECT max(expira_em) FROM convites c WHERE c.usuario_id = u.id AND c.usado_em IS NULL) AS convite_expira_em
                             FROM usuarios u ORDER BY u.papel, u.nome`),
            lerTodos(env, `SELECT p.*, u.nome AS usuario FROM publicacoes p LEFT JOIN usuarios u ON u.id = p.usuario_id
                            ORDER BY p.id DESC LIMIT 10`),
            lerTodos(env, "SELECT id, nome, email, interesse, texto, idioma, lida, enviada_em FROM mensagens ORDER BY id DESC LIMIT 200"),
            lerTodos(env, "SELECT nome, tamanho, atualizado_em FROM arquivos WHERE nome LIKE 'curriculo_%'"),
            infoImagens(env)
        ]);

    return {
        perfil,
        redes,
        projetos: projetos.map(p => ({ ...p, imagens: projetoImagens.filter(i => i.projeto_id === p.id) })),
        servicos,
        depoimentos: depoimentos.map(d => ({ ...d, publicado: d.publicado ? JSON.parse(d.publicado) : null })),
        grupos: grupos.map(g => ({ ...g, itens: habilidades.filter(h => h.grupo_id === g.id) })),
        certificacoes,
        formacoes,
        experiencias,
        github,
        usuarios,
        publicacoes,
        mensagens,
        // { pt: { tamanho, atualizado_em } | null, en: ... }
        curriculos: Object.fromEntries(["pt", "en"].map(idioma => [idioma, curriculos.find(c => c.nome === `curriculo_${idioma}`) ?? null])),
        imagens
    };
}

export async function tratarApi(request, url, env, usuario) {
    const [, , recurso, ...partes] = url.pathname.split("/");
    exigir(usuario);

    // Imagens: upload por qualquer pessoa logada (o depoente envia a própria foto); leitura idem.
    if (recurso === "imagens") {
        if (request.method === "POST" && !partes[0]) return receberImagem(request, env);
        if (request.method === "GET" && ID_IMAGEM.test(partes[0] ?? "") && /^\d+$/.test(partes[1] ?? "")) return servirImagem(env, partes[0], partes[1]);
        throw new ErroHttp(404, "Não encontrado.");
    }

    if (recurso === "meu-depoimento") return meuDepoimento(request, env, usuario);

    exigir(usuario, "admin");

    if (recurso === "painel" && request.method === "GET") return json(200, await painel(env));

    if (recurso === "perfil" && request.method === "PUT") return salvarPerfil(request, env);

    if (recurso === "colecoes") return colecao(request, env, partes);
    if (recurso === "projetos" && partes[1] === "imagens") return imagensDoProjeto(request, env, Number(partes[0]), partes.slice(2));
    if (recurso === "depoimentos") return depoimentosAdmin(request, env, partes);
    if (recurso === "usuarios") return usuariosAdmin(request, env, partes, url.origin);
    if (recurso === "mensagens") return mensagensAdmin(request, env, partes);
    if (recurso === "arquivos" && ["curriculo_pt", "curriculo_en"].includes(partes[0]) && !partes[1]) return curriculoAdmin(request, env, partes[0]);

    if (recurso === "publicar" && request.method === "POST") return pedirPublicacao(env, usuario, url);

    throw new ErroHttp(404, "Não encontrado.");
}
