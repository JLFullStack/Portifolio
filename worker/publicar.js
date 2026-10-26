// Botão Publicar: registra o pedido em "publicacoes" e dispara o GitHub Actions
// (.github/workflows/publicar.yml) por repository_dispatch. O workflow exporta o D1,
// gera o build, publica e grava no banco se deu certo.
//
// Precisa do segredo GITHUB_TOKEN_PUBLICAR no Worker: token fine-grained do GitHub, só
// deste repositório, com permissão "Contents: Read and write".
import { ErroHttp, json } from "./http.js";
import { limparImagensSemUso } from "./imagens.js";

export async function pedirPublicacao(env, usuario) {
    if (!env.GITHUB_TOKEN_PUBLICAR) {
        throw new ErroHttp(503, "A publicação ainda não foi configurada: falta o segredo GITHUB_TOKEN_PUBLICAR no Worker.");
    }

    const andamento = await env.DB.prepare(
        "SELECT id FROM publicacoes WHERE situacao = 'pedida' AND pedida_em > datetime('now', '-15 minutes')"
    ).first();
    if (andamento) throw new ErroHttp(409, "Já há uma publicação em andamento. Aguarde alguns minutos.");

    await limparImagensSemUso(env);
    const { id } = await env.DB.prepare("INSERT INTO publicacoes (usuario_id) VALUES (?) RETURNING id").bind(usuario.id).first();

    const resposta = await fetch(`https://api.github.com/repos/${env.GITHUB_REPOSITORIO}/dispatches`, {
        method: "POST",
        headers: {
            authorization: `Bearer ${env.GITHUB_TOKEN_PUBLICAR}`,
            accept: "application/vnd.github+json",
            "content-type": "application/json",
            "user-agent": "portifolio-worker",
            "x-github-api-version": "2022-11-28"
        },
        body: JSON.stringify({ event_type: "publicar", client_payload: { publicacao: id } })
    });

    if (!resposta.ok) {
        const detalhe = `GitHub respondeu ${resposta.status}: ${(await resposta.text()).slice(0, 300)}`;
        await env.DB.prepare("UPDATE publicacoes SET situacao = 'falhou', concluida_em = datetime('now'), detalhe = ? WHERE id = ?")
            .bind(detalhe, id).run();
        throw new ErroHttp(502, "O GitHub recusou o pedido de publicação. Confira o token GITHUB_TOKEN_PUBLICAR.");
    }

    return json(202, { id });
}
