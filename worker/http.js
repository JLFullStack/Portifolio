// Utilitários HTTP do Worker: respostas JSON, erros com status, leitura do corpo e cookies.

/** Erro que vira uma resposta JSON { mensagem } com o status dado. */
export class ErroHttp extends Error {
    constructor(status, mensagem) {
        super(mensagem);
        this.status = status;
    }
}

export function json(status, dados, cabecalhos = {}) {
    return new Response(JSON.stringify(dados), {
        status,
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...cabecalhos }
    });
}

/** Lê o corpo JSON de um pedido, com limite de tamanho. */
export async function lerJson(request, limite = 256 * 1024) {
    if (!(request.headers.get("content-type") || "").includes("application/json")) {
        throw new ErroHttp(415, "Envie os dados em JSON.");
    }

    const texto = await request.text();
    if (texto.length > limite) throw new ErroHttp(413, "Dados grandes demais.");

    try {
        const dados = JSON.parse(texto || "{}");
        if (typeof dados !== "object" || dados === null || Array.isArray(dados)) throw new Error();
        return dados;
    } catch {
        throw new ErroHttp(400, "JSON inválido.");
    }
}

export function lerCookie(request, nome) {
    for (const parte of (request.headers.get("cookie") || "").split(";")) {
        const [chave, ...valor] = parte.trim().split("=");
        if (chave === nome) return valor.join("=");
    }
    return null;
}

/** Data no formato do datetime('now') do SQLite (UTC), deslocada em segundos. */
export function dataSql(deslocamentoSegundos = 0) {
    return new Date(Date.now() + deslocamentoSegundos * 1000).toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Texto de um campo do corpo: precisa ser string (ou ausente/null, que vira "")
 * e respeitar o tamanho máximo. `obrigatorio` recusa texto vazio.
 */
export function campoTexto(dados, nome, { maximo = 5000, obrigatorio = false } = {}) {
    const valor = dados[nome] ?? "";

    if (typeof valor !== "string") throw new ErroHttp(400, `Campo "${nome}" inválido.`);

    const texto = valor.trim();
    if (texto.length > maximo) throw new ErroHttp(400, `Campo "${nome}" passa de ${maximo} caracteres.`);
    if (obrigatorio && !texto) throw new ErroHttp(400, `Preencha o campo "${nome}".`);

    return texto;
}

/** Endereço aceito em links: http(s), e-mail, telefone ou Skype. Vazio é aceito. */
export function campoUrl(dados, nome, opcoes) {
    const url = campoTexto(dados, nome, { maximo: 2000, ...opcoes });

    if (url && !/^(https?:\/\/|mailto:|tel:|skype:)/i.test(url)) {
        throw new ErroHttp(400, `"${nome}" precisa começar com https://, mailto:, tel: ou skype:.`);
    }

    return url;
}

/** E-mail obrigatório, já em minúsculas (como fica no banco). */
export function campoEmail(dados, nome) {
    const email = campoTexto(dados, nome, { maximo: 254, obrigatorio: true }).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErroHttp(400, "E-mail inválido.");
    return email;
}

/** Perfil do LinkedIn: vazio ou um endereço do linkedin.com (o https:// é completado). */
export function campoLinkedin(dados, nome) {
    const texto = campoTexto(dados, nome, { maximo: 300 });
    if (!texto) return "";

    const url = /^https?:\/\//i.test(texto) ? texto.replace(/^http:/i, "https:") : `https://${texto}`;
    if (!/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/\S+$/i.test(url)) {
        throw new ErroHttp(400, "Informe o endereço do perfil no LinkedIn (linkedin.com/in/...).");
    }

    return url;
}

export function campoInteiro(dados, nome) {
    const valor = Number(dados[nome]);
    if (!Number.isSafeInteger(valor)) throw new ErroHttp(400, `Campo "${nome}" inválido.`);
    return valor;
}
