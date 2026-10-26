// API do painel (/api/*). Administrador: todo o conteúdo, depoimentos, pessoas e publicação.
// Depoente: só o próprio depoimento e o upload da própria foto.
import { ICONES } from "../componentes/icones/dados.ts";
import { criarConvite } from "./auth.js";
import { ErroHttp, campoInteiro, campoTexto, campoUrl, json, lerJson } from "./http.js";
import { infoImagens, receberImagem, servirImagem } from "./imagens.js";
import { pedirPublicacao } from "./publicar.js";

const ID_IMAGEM = /^[0-9a-f]{16}$/;

/** Campos editáveis de cada coleção: tipo "texto", "url", "icone", "bool" ou "grupo". */
const COLECOES = {
    redes_sociais: { nome: "texto", url: "url", icone: "icone" },
    projetos: { titulo_pt: "texto", titulo_en: "texto", descricao_pt: "texto", descricao_en: "texto", url: "url", publicado: "bool" },
    grupos_habilidades: { titulo_pt: "texto", titulo_en: "texto" },
    habilidades: { grupo_id: "grupo", nome_pt: "texto", nome_en: "texto" },
    certificacoes: { sigla: "texto", descricao_pt: "texto", descricao_en: "texto" },
    formacoes: { periodo_pt: "texto", periodo_en: "texto", titulo_pt: "texto", titulo_en: "texto", instituicao_pt: "texto", instituicao_en: "texto" },
    experiencias: {
        periodo_pt: "texto", periodo_en: "texto", cargo_pt: "texto", cargo_en: "texto", empresa_pt: "texto", empresa_en: "texto",
        endereco_pt: "texto", endereco_en: "texto", descricao_pt: "texto", descricao_en: "texto"
    }
};

/** Campos obrigatórios por coleção (o resto aceita vazio). */
const OBRIGATORIOS = { redes_sociais: ["nome", "url", "icone"], habilidades: ["nome_pt"], certificacoes: ["sigla"] };

const PERFIL = {
    nome_curto: "texto", nome_completo: "texto", nascimento: "data", email: "texto", telefone: "texto",
    whatsapp: "url", linkedin: "url", curriculo: "url",
    saudacao_pt: "texto", saudacao_en: "texto", profissao_pt: "texto", profissao_en: "texto",
    descricao_hero_pt: "texto", descricao_hero_en: "texto", biografia_pt: "texto", biografia_en: "texto",
    endereco_pt: "texto", endereco_en: "texto", chamada_convite_pt: "texto", chamada_convite_en: "texto",
    chamada_citacao_pt: "texto", chamada_citacao_en: "texto", chamada_autor: "texto",
    foto_hero: "imagem", foto_biografia: "imagem"
};

function exigir(usuario, papel) {
    if (!usuario) throw new ErroHttp(401, "Entre novamente.");
    if (papel && usuario.papel !== papel) throw new ErroHttp(403, "Sem permissão.");
}

async function exigirImagem(env, id) {
    if (typeof id !== "string" || !ID_IMAGEM.test(id)) throw new ErroHttp(400, "Imagem inválida.");
    if (!(await env.DB.prepare("SELECT 1 FROM imagens WHERE id = ?").bind(id).first())) throw new ErroHttp(400, "Imagem não encontrada.");
    return id;
}

/** Valida os campos enviados conforme o tipo e devolve { coluna: valor } (só os presentes). */
async function validarCampos(env, dados, campos, obrigatorios = []) {
    const valores = {};

    for (const [campo, tipo] of Object.entries(campos)) {
        if (!(campo in dados)) {
            if (obrigatorios.includes(campo)) throw new ErroHttp(400, `Preencha o campo "${campo}".`);
            continue;
        }

        const obrigatorio = obrigatorios.includes(campo);

        if (tipo === "texto") valores[campo] = campoTexto(dados, campo, { obrigatorio });
        else if (tipo === "url") valores[campo] = campoUrl(dados, campo, { obrigatorio });
        else if (tipo === "bool") valores[campo] = dados[campo] ? 1 : 0;
        else if (tipo === "grupo") valores[campo] = campoInteiro(dados, campo);
        else if (tipo === "imagem") valores[campo] = await exigirImagem(env, dados[campo]);
        else if (tipo === "icone") {
            if (!Object.hasOwn(ICONES, dados[campo])) throw new ErroHttp(400, "Ícone desconhecido.");
            valores[campo] = dados[campo];
        } else if (tipo === "data") {
            const data = campoTexto(dados, campo, { obrigatorio: true });
            if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new ErroHttp(400, "Data no formato AAAA-MM-DD.");
            valores[campo] = data;
        }
    }

    return valores;
}

const lerTodos = async (env, sql, ...parametros) => (await env.DB.prepare(sql).bind(...parametros).all()).results;

/** Tudo o que o painel do administrador mostra. */
async function painel(env) {
    const [perfil, redes, projetos, projetoImagens, depoimentos, grupos, habilidades, certificacoes, formacoes, experiencias, usuarios, publicacoes, imagens] =
        await Promise.all([
            env.DB.prepare("SELECT * FROM perfil WHERE id = 1").first(),
            lerTodos(env, "SELECT * FROM redes_sociais ORDER BY ordem, id"),
            lerTodos(env, "SELECT * FROM projetos ORDER BY ordem, id"),
            lerTodos(env, "SELECT * FROM projeto_imagens ORDER BY projeto_id, ordem"),
            lerTodos(env, `SELECT d.*, u.email AS email_usuario FROM depoimentos d LEFT JOIN usuarios u ON u.id = d.usuario_id
                            ORDER BY CASE d.situacao WHEN 'pendente' THEN 0 ELSE 1 END, d.ordem, d.id`),
            lerTodos(env, "SELECT * FROM grupos_habilidades ORDER BY ordem, id"),
            lerTodos(env, "SELECT * FROM habilidades ORDER BY grupo_id, ordem, id"),
            lerTodos(env, "SELECT * FROM certificacoes ORDER BY ordem, id"),
            lerTodos(env, "SELECT * FROM formacoes ORDER BY ordem, id"),
            lerTodos(env, "SELECT * FROM experiencias ORDER BY ordem, id"),
            lerTodos(env, `SELECT u.id, u.nome, u.email, u.papel, u.ativo, u.criado_em, u.ultimo_acesso,
                                  (u.senha_hash IS NOT NULL) AS tem_senha,
                                  (SELECT max(expira_em) FROM convites c WHERE c.usuario_id = u.id AND c.usado_em IS NULL) AS convite_expira_em
                             FROM usuarios u ORDER BY u.papel, u.nome`),
            lerTodos(env, `SELECT p.*, u.nome AS usuario FROM publicacoes p LEFT JOIN usuarios u ON u.id = p.usuario_id
                            ORDER BY p.id DESC LIMIT 10`),
            infoImagens(env)
        ]);

    return {
        perfil,
        redes,
        projetos: projetos.map(p => ({ ...p, imagens: projetoImagens.filter(i => i.projeto_id === p.id) })),
        depoimentos: depoimentos.map(d => ({ ...d, publicado: d.publicado ? JSON.parse(d.publicado) : null })),
        grupos: grupos.map(g => ({ ...g, itens: habilidades.filter(h => h.grupo_id === g.id) })),
        certificacoes,
        formacoes,
        experiencias,
        usuarios,
        publicacoes,
        imagens
    };
}

async function proximaOrdem(env, tabela, filtro = "", ...parametros) {
    const { ordem } = await env.DB.prepare(`SELECT coalesce(max(ordem), -1) + 1 AS ordem FROM ${tabela} ${filtro}`).bind(...parametros).first();
    return ordem;
}

/** Reordena: `ids` na ordem nova. Só ids da tabela (e do filtro) são aceitos. */
async function reordenar(env, tabela, ids, coluna = "id") {
    if (!Array.isArray(ids) || ids.length > 500) throw new ErroHttp(400, "Lista inválida.");

    await env.DB.batch(ids.map((id, ordem) => env.DB.prepare(`UPDATE ${tabela} SET ordem = ? WHERE ${coluna} = ?`).bind(ordem, id)));
    return json(200, { ok: true });
}

async function colecao(request, env, partes) {
    const [tabela, id] = partes;
    const campos = COLECOES[tabela];
    if (!campos) throw new ErroHttp(404, "Coleção desconhecida.");

    if (request.method === "POST" && id === "ordem") return reordenar(env, tabela, (await lerJson(request)).ids);

    if (request.method === "POST" && !id) {
        const valores = await validarCampos(env, await lerJson(request), campos, OBRIGATORIOS[tabela]);

        if (tabela === "habilidades") {
            if (!valores.grupo_id || !(await env.DB.prepare("SELECT 1 FROM grupos_habilidades WHERE id = ?").bind(valores.grupo_id).first())) {
                throw new ErroHttp(400, "Grupo inválido.");
            }
            valores.ordem = await proximaOrdem(env, tabela, "WHERE grupo_id = ?", valores.grupo_id);
        } else {
            valores.ordem = await proximaOrdem(env, tabela);
        }

        const colunas = Object.keys(valores);
        const linha = await env.DB.prepare(`INSERT INTO ${tabela} (${colunas.join(", ")}) VALUES (${colunas.map(() => "?").join(", ")}) RETURNING *`)
            .bind(...Object.values(valores)).first();
        return json(201, linha);
    }

    const numero = Number(id);
    if (!Number.isSafeInteger(numero)) throw new ErroHttp(404, "Não encontrado.");

    if (request.method === "PUT") {
        const valores = await validarCampos(env, await lerJson(request), campos);
        delete valores.grupo_id;
        if (!Object.keys(valores).length) throw new ErroHttp(400, "Nada para salvar.");

        for (const obrigatorio of OBRIGATORIOS[tabela] ?? []) {
            if (obrigatorio in valores && !valores[obrigatorio]) throw new ErroHttp(400, `Preencha o campo "${obrigatorio}".`);
        }

        const linha = await env.DB.prepare(`UPDATE ${tabela} SET ${Object.keys(valores).map(c => `${c} = ?`).join(", ")} WHERE id = ? RETURNING *`)
            .bind(...Object.values(valores), numero).first();
        if (!linha) throw new ErroHttp(404, "Não encontrado.");
        return json(200, linha);
    }

    if (request.method === "DELETE") {
        await env.DB.prepare(`DELETE FROM ${tabela} WHERE id = ?`).bind(numero).run();
        return json(200, { ok: true });
    }

    throw new ErroHttp(405, "Método não permitido.");
}

async function imagensDoProjeto(request, env, projetoId, partes) {
    const projeto = await env.DB.prepare("SELECT id FROM projetos WHERE id = ?").bind(projetoId).first();
    if (!projeto) throw new ErroHttp(404, "Projeto não encontrado.");

    if (request.method === "POST" && partes[0] === "ordem") {
        const { ids } = await lerJson(request);
        if (!Array.isArray(ids)) throw new ErroHttp(400, "Lista inválida.");
        await env.DB.batch(ids.map((imagemId, ordem) =>
            env.DB.prepare("UPDATE projeto_imagens SET ordem = ? WHERE projeto_id = ? AND imagem_id = ?").bind(ordem, projetoId, imagemId)));
        return json(200, { ok: true });
    }

    if (request.method === "POST" && !partes[0]) {
        const dados = await lerJson(request);
        const imagem = await exigirImagem(env, dados.imagem_id);
        const ordem = await proximaOrdem(env, "projeto_imagens", "WHERE projeto_id = ?", projetoId);

        await env.DB.prepare("INSERT OR REPLACE INTO projeto_imagens (projeto_id, imagem_id, ordem, alt_pt, alt_en) VALUES (?, ?, ?, ?, ?)")
            .bind(projetoId, imagem, ordem, campoTexto(dados, "alt_pt", { maximo: 300 }), campoTexto(dados, "alt_en", { maximo: 300 })).run();
        return json(201, { ok: true });
    }

    if (request.method === "PUT" && partes[0]) {
        const dados = await lerJson(request);
        await env.DB.prepare("UPDATE projeto_imagens SET alt_pt = ?, alt_en = ? WHERE projeto_id = ? AND imagem_id = ?")
            .bind(campoTexto(dados, "alt_pt", { maximo: 300 }), campoTexto(dados, "alt_en", { maximo: 300 }), projetoId, partes[0]).run();
        return json(200, { ok: true });
    }

    if (request.method === "DELETE" && partes[0]) {
        await env.DB.prepare("DELETE FROM projeto_imagens WHERE projeto_id = ? AND imagem_id = ?").bind(projetoId, partes[0]).run();
        return json(200, { ok: true });
    }

    throw new ErroHttp(405, "Método não permitido.");
}

/** Campos do depoimento que o administrador edita (inclui as traduções). */
async function camposDepoimento(env, dados) {
    const idioma = dados.idioma_original;
    if (!["pt", "en"].includes(idioma)) throw new ErroHttp(400, "Idioma inválido.");

    return {
        nome: campoTexto(dados, "nome", { maximo: 120, obrigatorio: true }),
        idioma_original: idioma,
        texto_pt: campoTexto(dados, "texto_pt", { maximo: 1500 }),
        texto_en: campoTexto(dados, "texto_en", { maximo: 1500 }),
        profissao_pt: campoTexto(dados, "profissao_pt", { maximo: 120 }),
        profissao_en: campoTexto(dados, "profissao_en", { maximo: 120 }),
        foto: dados.foto ? await exigirImagem(env, dados.foto) : null
    };
}

async function depoimentosAdmin(request, env, partes) {
    const [id, acao] = partes;

    if (request.method === "POST" && id === "ordem") return reordenar(env, "depoimentos", (await lerJson(request)).ids);

    const numero = Number(id);
    const depoimento = Number.isSafeInteger(numero) && await env.DB.prepare("SELECT * FROM depoimentos WHERE id = ?").bind(numero).first();
    if (!depoimento) throw new ErroHttp(404, "Depoimento não encontrado.");

    if (request.method === "PUT" && !acao) {
        const valores = await camposDepoimento(env, await lerJson(request));
        await env.DB.prepare(`UPDATE depoimentos SET ${Object.keys(valores).map(c => `${c} = ?`).join(", ")} WHERE id = ?`)
            .bind(...Object.values(valores), numero).run();
        return json(200, { ok: true });
    }

    if (request.method === "POST" && acao === "aprovar") {
        const texto = depoimento[`texto_${depoimento.idioma_original}`];
        if (!texto) throw new ErroHttp(400, "O depoimento está sem texto no idioma original.");

        // A versão aprovada é a que vai para a landing, até a próxima aprovação.
        const publicado = JSON.stringify({
            nome: depoimento.nome,
            idiomaOriginal: depoimento.idioma_original,
            texto: { pt: depoimento.texto_pt, en: depoimento.texto_en },
            profissao: { pt: depoimento.profissao_pt, en: depoimento.profissao_en },
            foto: depoimento.foto
        });
        await env.DB.prepare("UPDATE depoimentos SET situacao = 'aprovado', publicado = ?, aprovado_em = datetime('now') WHERE id = ?")
            .bind(publicado, numero).run();
        return json(200, { ok: true });
    }

    if (request.method === "POST" && acao === "recusar") {
        // Recusar a versão nova não tira do ar a versão aprovada antes (se houver): para isso, "ocultar".
        await env.DB.prepare("UPDATE depoimentos SET situacao = 'recusado' WHERE id = ?").bind(numero).run();
        return json(200, { ok: true });
    }

    if (request.method === "POST" && acao === "ocultar") {
        await env.DB.prepare("UPDATE depoimentos SET publicado = NULL, situacao = CASE situacao WHEN 'aprovado' THEN 'recusado' ELSE situacao END WHERE id = ?")
            .bind(numero).run();
        return json(200, { ok: true });
    }

    if (request.method === "DELETE" && !acao) {
        await env.DB.prepare("DELETE FROM depoimentos WHERE id = ?").bind(numero).run();
        return json(200, { ok: true });
    }

    throw new ErroHttp(405, "Método não permitido.");
}

async function usuariosAdmin(request, env, partes, origem) {
    const [id, acao] = partes;

    if (request.method === "POST" && !id) {
        const dados = await lerJson(request);
        const nome = campoTexto(dados, "nome", { maximo: 120, obrigatorio: true });
        const email = campoTexto(dados, "email", { maximo: 254, obrigatorio: true }).toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErroHttp(400, "E-mail inválido.");
        if (await env.DB.prepare("SELECT 1 FROM usuarios WHERE email = ?").bind(email).first()) {
            throw new ErroHttp(409, "Já existe uma pessoa com este e-mail.");
        }

        const usuario = await env.DB.prepare("INSERT INTO usuarios (nome, email, papel) VALUES (?, ?, 'depoente') RETURNING id")
            .bind(nome, email).first();
        return json(201, { id: usuario.id, ...(await criarConvite(env, usuario.id, origem)) });
    }

    const numero = Number(id);
    const usuario = Number.isSafeInteger(numero) && await env.DB.prepare("SELECT * FROM usuarios WHERE id = ?").bind(numero).first();
    if (!usuario) throw new ErroHttp(404, "Pessoa não encontrada.");

    if (request.method === "POST" && acao === "convite") {
        return json(200, await criarConvite(env, numero, origem));
    }

    if (usuario.papel === "admin") throw new ErroHttp(400, "A conta do administrador não pode ser desativada nem excluída.");

    if (request.method === "PUT" && !acao) {
        const { ativo } = await lerJson(request);
        await env.DB.batch([
            env.DB.prepare("UPDATE usuarios SET ativo = ? WHERE id = ?").bind(ativo ? 1 : 0, numero),
            ...(ativo ? [] : [env.DB.prepare("DELETE FROM sessoes WHERE usuario_id = ?").bind(numero)])
        ]);
        return json(200, { ok: true });
    }

    if (request.method === "DELETE" && !acao) {
        // O depoimento fica (pode já estar publicado); só perde o vínculo com a conta.
        await env.DB.batch([
            env.DB.prepare("UPDATE depoimentos SET usuario_id = NULL WHERE usuario_id = ?").bind(numero),
            env.DB.prepare("DELETE FROM usuarios WHERE id = ?").bind(numero)
        ]);
        return json(200, { ok: true });
    }

    throw new ErroHttp(405, "Método não permitido.");
}

/** O depoente vê e edita só o próprio depoimento. Toda edição volta para "pendente". */
async function meuDepoimento(request, env, usuario) {
    const atual = await env.DB.prepare("SELECT * FROM depoimentos WHERE usuario_id = ?").bind(usuario.id).first();

    if (request.method === "GET") {
        return json(200, {
            usuario: { nome: usuario.nome, email: usuario.email },
            depoimento: atual && {
                nome: atual.nome,
                idioma_original: atual.idioma_original,
                texto: atual[`texto_${atual.idioma_original}`],
                profissao: atual[`profissao_${atual.idioma_original}`],
                foto: atual.foto,
                situacao: atual.situacao,
                publicado: Boolean(atual.publicado)
            },
            imagem: atual?.foto ? (await infoImagens(env))[atual.foto] ?? null : null
        });
    }

    if (request.method === "PUT") {
        const dados = await lerJson(request);
        const idioma = dados.idioma_original;
        if (!["pt", "en"].includes(idioma)) throw new ErroHttp(400, "Escolha o idioma do depoimento.");

        const outro = idioma === "pt" ? "en" : "pt";
        const valores = {
            nome: campoTexto(dados, "nome", { maximo: 120, obrigatorio: true }),
            idioma_original: idioma,
            [`texto_${idioma}`]: campoTexto(dados, "texto", { maximo: 1500, obrigatorio: true }),
            [`profissao_${idioma}`]: campoTexto(dados, "profissao", { maximo: 120, obrigatorio: true }),
            // A tradução anterior não vale para o texto novo: o administrador traduz de novo ao aprovar.
            [`texto_${outro}`]: "",
            [`profissao_${outro}`]: "",
            foto: dados.foto ? await exigirImagem(env, dados.foto) : null,
            situacao: "pendente",
            enviado_em: new Date().toISOString().slice(0, 19).replace("T", " ")
        };

        if (atual) {
            await env.DB.prepare(`UPDATE depoimentos SET ${Object.keys(valores).map(c => `${c} = ?`).join(", ")} WHERE id = ?`)
                .bind(...Object.values(valores), atual.id).run();
        } else {
            const colunas = ["usuario_id", "ordem", ...Object.keys(valores)];
            await env.DB.prepare(`INSERT INTO depoimentos (${colunas.join(", ")}) VALUES (${colunas.map(() => "?").join(", ")})`)
                .bind(usuario.id, await proximaOrdem(env, "depoimentos"), ...Object.values(valores)).run();
        }

        return json(200, { ok: true });
    }

    throw new ErroHttp(405, "Método não permitido.");
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

    if (recurso === "perfil" && request.method === "PUT") {
        const valores = await validarCampos(env, await lerJson(request), PERFIL);
        if (!Object.keys(valores).length) throw new ErroHttp(400, "Nada para salvar.");

        await env.DB.prepare(`UPDATE perfil SET ${Object.keys(valores).map(c => `${c} = ?`).join(", ")}, atualizado_em = datetime('now') WHERE id = 1`)
            .bind(...Object.values(valores)).run();
        return json(200, { ok: true });
    }

    if (recurso === "colecoes") return colecao(request, env, partes);
    if (recurso === "projetos" && partes[1] === "imagens") return imagensDoProjeto(request, env, Number(partes[0]), partes.slice(2));
    if (recurso === "depoimentos") return depoimentosAdmin(request, env, partes);
    if (recurso === "usuarios") return usuariosAdmin(request, env, partes, url.origin);

    if (recurso === "publicar" && request.method === "POST") return pedirPublicacao(env, usuario);

    throw new ErroHttp(404, "Não encontrado.");
}
