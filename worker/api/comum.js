// Utilidades das rotas da API: imagem existente e ordem dos itens.
import { ErroHttp, json } from "../http.js";

export const ID_IMAGEM = /^[0-9a-f]{16}$/;

export async function exigirImagem(env, id) {
    if (typeof id !== "string" || !ID_IMAGEM.test(id)) throw new ErroHttp(400, "Imagem inválida.");
    if (!(await env.DB.prepare("SELECT 1 FROM imagens WHERE id = ?").bind(id).first())) throw new ErroHttp(400, "Imagem não encontrada.");
    return id;
}

export async function proximaOrdem(env, tabela, filtro = "", ...parametros) {
    const { ordem } = await env.DB.prepare(`SELECT coalesce(max(ordem), -1) + 1 AS ordem FROM ${tabela} ${filtro}`).bind(...parametros).first();
    return ordem;
}

/** Reordena: `ids` na ordem nova. Só ids da tabela (e do filtro) são aceitos. */
export async function reordenar(env, tabela, ids, coluna = "id") {
    if (!Array.isArray(ids) || ids.length > 500) throw new ErroHttp(400, "Lista inválida.");

    await env.DB.batch(ids.map((id, ordem) => env.DB.prepare(`UPDATE ${tabela} SET ordem = ? WHERE ${coluna} = ?`).bind(ordem, id)));
    return json(200, { ok: true });
}
