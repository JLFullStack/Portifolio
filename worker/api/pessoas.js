// Pessoas com acesso (convidar, novo link, desativar, excluir) e mensagens do formulário de contato.
import { criarConvite } from "../auth.js";
import { ErroHttp, campoEmail, campoTexto, json, lerJson } from "../http.js";

export async function usuariosAdmin(request, env, partes, origem) {
    const [id, acao] = partes;

    if (request.method === "POST" && !id) {
        const dados = await lerJson(request);
        const nome = campoTexto(dados, "nome", { maximo: 120, obrigatorio: true });
        const email = campoEmail(dados, "email");

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

/** Mensagens do formulário de contato: marcar como lida/não lida e excluir. */
export async function mensagensAdmin(request, env, partes) {
    const numero = Number(partes[0]);
    if (!Number.isSafeInteger(numero)) throw new ErroHttp(404, "Mensagem não encontrada.");

    if (request.method === "PUT") {
        const { lida } = await lerJson(request);
        await env.DB.prepare("UPDATE mensagens SET lida = ? WHERE id = ?").bind(lida ? 1 : 0, numero).run();
        return json(200, { ok: true });
    }

    if (request.method === "DELETE") {
        await env.DB.prepare("DELETE FROM mensagens WHERE id = ?").bind(numero).run();
        return json(200, { ok: true });
    }

    throw new ErroHttp(405, "Método não permitido.");
}
