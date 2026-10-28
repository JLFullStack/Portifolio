// Imagens no D1 (sem R2, para a publicação ser gratuita).
//
// O navegador já reduz e converte para WebP antes de enviar (componentes/painel/redimensionar.ts):
// chega um multipart com "largura" e "altura" da imagem original e um arquivo por largura
// gerada, "arquivo-<largura>". O id é o hash do conteúdo, então reenviar a mesma imagem
// não duplica nada. Na landing, as imagens viram arquivos estáticos no build
// (scripts/exportar-conteudo.mjs); daqui só o painel as lê.
import { ErroHttp, json } from "./http.js";
import { sha256 } from "./auth.js";

const MAXIMO_ARQUIVO = 1024 * 1024;     // 1 MB por largura (o D1 aceita 2 MB por registro)
const MAXIMO_PEDIDO = 5 * 1024 * 1024;
const MAXIMO_LARGURAS = 4;

const ehWebp = bytes =>
    bytes.length > 12 &&
    String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP";

export async function receberImagem(request, env) {
    if (Number(request.headers.get("content-length") || 0) > MAXIMO_PEDIDO) throw new ErroHttp(413, "Imagem grande demais.");

    let formulario;
    try {
        formulario = await request.formData();
    } catch {
        throw new ErroHttp(400, "Envie a imagem como formulário (multipart).");
    }

    const largura = Number(formulario.get("largura"));
    const altura = Number(formulario.get("altura"));
    if (!Number.isInteger(largura) || !Number.isInteger(altura) || largura < 1 || altura < 1 || largura > 20000 || altura > 20000) {
        throw new ErroHttp(400, "Dimensões da imagem inválidas.");
    }

    const arquivos = [];
    for (const [nome, valor] of formulario.entries()) {
        const encontrado = /^arquivo-(\d{2,4})$/.exec(nome);
        if (!encontrado || typeof valor === "string") continue;

        const bytes = new Uint8Array(await valor.arrayBuffer());
        if (bytes.length > MAXIMO_ARQUIVO) throw new ErroHttp(413, "Cada versão da imagem pode ter até 1 MB.");
        if (!ehWebp(bytes)) throw new ErroHttp(415, "A imagem precisa estar em WebP.");

        arquivos.push({ largura: Number(encontrado[1]), bytes });
    }

    if (!arquivos.length || arquivos.length > MAXIMO_LARGURAS) throw new ErroHttp(400, "Envie de 1 a 4 versões da imagem.");
    arquivos.sort((a, b) => a.largura - b.largura);

    // Hash de todas as versões juntas: muda quando qualquer uma muda.
    const total = new Uint8Array(arquivos.reduce((soma, a) => soma + a.bytes.length, 0));
    let posicao = 0;
    for (const arquivo of arquivos) {
        total.set(arquivo.bytes, posicao);
        posicao += arquivo.bytes.length;
    }
    const digest = await crypto.subtle.digest("SHA-256", total);
    const id = [...new Uint8Array(digest)].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");

    await env.DB.batch([
        env.DB.prepare("INSERT OR IGNORE INTO imagens (id, largura, altura) VALUES (?, ?, ?)").bind(id, largura, altura),
        ...arquivos.map(a => env.DB.prepare("INSERT OR IGNORE INTO imagem_arquivos (imagem_id, largura, dados) VALUES (?, ?, ?)")
            .bind(id, a.largura, a.bytes))
    ]);

    return json(201, { id, largura, altura, larguras: arquivos.map(a => a.largura) });
}

/** GET /api/imagens/<id>/<largura>: a imagem para o painel (só com sessão). */
export async function servirImagem(env, id, largura) {
    const arquivo = await env.DB.prepare("SELECT dados FROM imagem_arquivos WHERE imagem_id = ? AND largura = ?")
        .bind(id, Number(largura)).first();

    if (!arquivo) return json(404, { mensagem: "Imagem não encontrada." });

    return new Response(new Uint8Array(arquivo.dados), {
        headers: { "content-type": "image/webp", "cache-control": "private, max-age=86400, immutable" }
    });
}

/** Larguras disponíveis de várias imagens, para o painel montar as prévias. */
export async function infoImagens(env) {
    const linhas = await env.DB.prepare(
        "SELECT i.id, i.largura, i.altura, group_concat(a.largura) AS larguras FROM imagens i JOIN imagem_arquivos a ON a.imagem_id = i.id GROUP BY i.id"
    ).all();

    return Object.fromEntries(linhas.results.map(l => [l.id, {
        largura: l.largura, altura: l.altura, larguras: String(l.larguras).split(",").map(Number).sort((a, b) => a - b)
    }]));
}

/**
 * Apaga imagens que nada mais usa (perfil, projetos, depoimentos e a versão publicada
 * dos depoimentos), com mais de um dia: uploads recentes podem estar num formulário aberto.
 * Um NOT IN por fonte: o D1 recusa SELECT composto com mais de 5 termos (UNION).
 */
export async function limparImagensSemUso(env) {
    await env.DB.prepare(
        `DELETE FROM imagens
          WHERE criada_em < datetime('now', '-1 day')
            AND id NOT IN (SELECT foto_hero FROM perfil UNION SELECT foto_biografia FROM perfil)
            AND id NOT IN (SELECT imagem_id FROM projeto_imagens)
            AND id NOT IN (SELECT fundo FROM projetos WHERE fundo IS NOT NULL)
            AND id NOT IN (SELECT foto FROM depoimentos WHERE foto IS NOT NULL)
            AND id NOT IN (SELECT json_extract(publicado, '$.foto') FROM depoimentos
                            WHERE json_extract(publicado, '$.foto') IS NOT NULL)`
    ).run();
}
