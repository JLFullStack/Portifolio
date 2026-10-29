// Worker do portfólio no Cloudflare. A landing (/, /en, /midia/*) é servida direto dos
// arquivos estáticos, sem passar por aqui (run_worker_first no wrangler.jsonc lista só
// as rotas abaixo). Este Worker cuida da área restrita:
//
//   /auth/*         login, sessão, convites e troca de senha e e-mail (auth.js)
//   /contato        formulário de contato da landing, sem login (contato.js)
//   /api/*          dados do painel e do depoente, imagens e publicação (api.js)
//   /admin/*        páginas do painel: só o administrador
//   /depoimento/*   página do depoente: qualquer pessoa logada
//
// Métodos que alteram dados só são aceitos da própria origem (o cookie já é SameSite=Lax).
// Toda resposta daqui sai com os cabeçalhos de segurança (o public/_headers só vale para
// os arquivos estáticos que não passam pelo Worker).
import { tratarApi } from "./api.js";
import { tratarAuth, usuarioDaSessao } from "./auth.js";
import { tratarContato } from "./contato.js";
import { ErroHttp, json } from "./http.js";

const PAGINAS_ADMIN = /^\/admin(\/|$)/;
const PAGINAS_DEPOENTE = /^\/depoimento(\/|$)/;

// Mesma política do public/_headers: tudo da própria origem, sem ser embutido em outro site.
// connect-src 'self' impede que um script injetado envie dados a outro endereço.
const CABECALHOS_SEGURANCA = {
    "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob:; font-src 'self'; connect-src 'self' blob:; frame-src 'self'; object-src 'none'; " +
        "base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "same-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "cross-origin-opener-policy": "same-origin",
    // Respostas da área restrita (JSON, fotos do painel, PDF) não podem ser lidas por outro site.
    "cross-origin-resource-policy": "same-origin"
};

export default {
    async fetch(request, env) {
        const resposta = await tratar(request, env);
        const protegida = new Response(resposta.body, resposta);

        for (const [nome, valor] of Object.entries(CABECALHOS_SEGURANCA)) protegida.headers.set(nome, valor);
        return protegida;
    }
};

async function tratar(request, env) {
    const url = new URL(request.url);

    try {
        if (!["GET", "HEAD"].includes(request.method) && !mesmaOrigem(request, url)) {
            return json(403, { mensagem: "Origem não permitida." });
        }

        if (url.pathname === "/contato") return await tratarContato(request, env);

        const usuario = await usuarioDaSessao(request, env);

        if (url.pathname.startsWith("/auth/")) return await tratarAuth(request, url, env, usuario);
        if (url.pathname.startsWith("/api/")) return await tratarApi(request, url, env, usuario);

        const admin = PAGINAS_ADMIN.test(url.pathname);
        if (admin || PAGINAS_DEPOENTE.test(url.pathname)) {
            if (!usuario) return redirecionar(url, `/login?next=${encodeURIComponent(url.pathname)}`);
            if (admin && usuario.papel !== "admin") return redirecionar(url, "/depoimento");

            return await paginaPrivada(request, env);
        }

        return env.ASSETS.fetch(request);
    } catch (erro) {
        if (erro instanceof ErroHttp) return json(erro.status, { mensagem: erro.message });

        // Só o erro vai para o log, nunca o corpo do pedido (pode ter senha ou dados pessoais).
        console.error(erro);
        return json(500, { mensagem: "Erro interno. Tente de novo." });
    }
}

/** O pedido veio de uma página deste site? Origin ausente, "null" ou de outro host é recusado. */
function mesmaOrigem(request, url) {
    try {
        return new URL(request.headers.get("origin")).host === url.host;
    } catch {
        return false;
    }
}

function redirecionar(url, destino) {
    return new Response(null, { status: 302, headers: { location: new URL(destino, url).toString(), "cache-control": "no-store" } });
}

/** Página da área restrita: sem cache compartilhado e fora dos buscadores. */
async function paginaPrivada(request, env) {
    const resposta = await env.ASSETS.fetch(request);
    const privada = new Response(resposta.body, resposta);

    privada.headers.set("cache-control", "private, no-store");
    privada.headers.set("x-robots-tag", "noindex, nofollow");
    return privada;
}
