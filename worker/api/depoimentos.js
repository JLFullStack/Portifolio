// Depoimentos: revisão, aprovação e ordem pelo administrador; o depoente edita só o próprio.
import { ErroHttp, campoLinkedin, campoTexto, json, lerJson } from "../http.js";
import { infoImagens } from "../imagens.js";
import { exigirImagem, proximaOrdem, reordenar } from "./comum.js";

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
        linkedin: campoLinkedin(dados, "linkedin"),
        foto: dados.foto ? await exigirImagem(env, dados.foto) : null
    };
}

export async function depoimentosAdmin(request, env, partes) {
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
            linkedin: depoimento.linkedin,
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

/** O depoente vê e edita só o próprio depoimento. Toda edição volta para "pendente". */
export async function meuDepoimento(request, env, usuario) {
    const atual = await env.DB.prepare("SELECT * FROM depoimentos WHERE usuario_id = ?").bind(usuario.id).first();

    if (request.method === "GET") {
        return json(200, {
            usuario: { nome: usuario.nome, email: usuario.email },
            depoimento: atual && {
                nome: atual.nome,
                idioma_original: atual.idioma_original,
                texto: atual[`texto_${atual.idioma_original}`],
                profissao: atual[`profissao_${atual.idioma_original}`],
                linkedin: atual.linkedin,
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
            linkedin: campoLinkedin(dados, "linkedin"),
            foto: dados.foto ? await exigirImagem(env, dados.foto) : null,
            situacao: "pendente",
            enviado_em: new Date().toISOString().slice(0, 19).replace("T", " ")
        };

        const colunas = ["usuario_id", "ordem", ...Object.keys(valores)];
        const gravar = atual
            ? env.DB.prepare(`UPDATE depoimentos SET ${Object.keys(valores).map(c => `${c} = ?`).join(", ")} WHERE id = ?`)
                .bind(...Object.values(valores), atual.id)
            : env.DB.prepare(`INSERT INTO depoimentos (${colunas.join(", ")}) VALUES (${colunas.map(() => "?").join(", ")})`)
                .bind(usuario.id, await proximaOrdem(env, "depoimentos"), ...Object.values(valores));

        // O nome da conta acompanha o do depoimento (é o nome que a pessoa escolheu para si).
        await env.DB.batch([gravar, env.DB.prepare("UPDATE usuarios SET nome = ? WHERE id = ?").bind(valores.nome, usuario.id)]);

        return json(200, { ok: true });
    }

    throw new ErroHttp(405, "Método não permitido.");
}
