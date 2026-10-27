// Cliente da API do Worker (/api/*, /auth/*), usado pelas páginas da área restrita.
// Erros viram ErroApi com a mensagem pronta para mostrar; 401 leva de volta ao login.

export class ErroApi extends Error {
    status: number;

    constructor(status: number, mensagem: string) {
        super(mensagem);
        this.status = status;
    }
}

/**
 * Chama a API. `corpo`: objeto (vai em JSON), FormData, ou um arquivo (Blob/File),
 * enviado como está, com o tipo dele (o currículo em PDF).
 */
export async function api<T = unknown>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
    const formulario = corpo instanceof FormData;
    const arquivo = corpo instanceof Blob;
    let resposta: Response;

    try {
        resposta = await fetch(caminho, {
            method: metodo,
            headers: corpo === undefined || formulario ? undefined : { "content-type": arquivo ? corpo.type : "application/json" },
            body: corpo === undefined ? undefined : formulario || arquivo ? corpo : JSON.stringify(corpo),
            credentials: "same-origin"
        });
    } catch {
        throw new ErroApi(0, "Sem conexão com o servidor. Confira a internet e tente de novo.");
    }

    const dados = await resposta.json().catch(() => ({}));

    // No `npm run dev` só existe a landing: /auth e /api são do Worker (npm run preview).
    if (resposta.status === 404 && process.env.NODE_ENV === "development") {
        throw new ErroApi(404, "No npm run dev não há Worker. Rode npm run preview e abra http://127.0.0.1:8787/login.");
    }

    if (!resposta.ok) {
        // Sessão expirada no meio do uso do painel: volta ao login e retorna depois.
        if (resposta.status === 401 && caminho.startsWith("/api/")) {
            location.href = `/login?next=${encodeURIComponent(location.pathname)}`;
        }
        throw new ErroApi(resposta.status, (dados as { mensagem?: string }).mensagem ?? `Erro ${resposta.status}.`);
    }

    return dados as T;
}

export type Usuario = { id: number; nome: string; email: string; papel: "admin" | "depoente" };

/** Para onde mandar a pessoa depois do login: o `next` pedido (se for deste site) ou a área do papel. */
export function destinoDepoisDoLogin(usuario: Usuario, proximo: string | null): string {
    if (proximo && proximo.startsWith("/") && !proximo.startsWith("//")) {
        if (usuario.papel === "admin" || !proximo.startsWith("/admin")) return proximo;
    }
    return usuario.papel === "admin" ? "/admin" : "/depoimento";
}
