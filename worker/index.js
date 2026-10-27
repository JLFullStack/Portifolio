// Worker do portfólio no Cloudflare. A landing (/, /en, /midia/*) é servida direto dos
// arquivos estáticos, sem passar por aqui (run_worker_first no wrangler.jsonc lista só
// as rotas abaixo). Este Worker cuida da área restrita:
//
//   /auth/*         login, sessão, convites e troca de senha (auth.js)
//   /contato        formulário de contato da landing, sem login (contato.js)
//   /api/*          dados do painel e do depoente, imagens e publicação (api.js)
//   /admin/*        páginas do painel: só o administrador
//   /depoimento/*   página do depoente: qualquer pessoa logada
//
// Métodos que alteram dados só são aceitos da própria origem (o cookie já é SameSite=Lax).
import { tratarApi } from "./api.js";
import { tratarAuth, usuarioDaSessao } from "./auth.js";
import { tratarContato } from "./contato.js";
import { ErroHttp, json } from "./http.js";

const PAGINAS_ADMIN = /^\/admin(\/|$)/;
const PAGINAS_DEPOENTE = /^\/depoimento(\/|$)/;

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        try {
            if (!["GET", "HEAD"].includes(request.method)) {
                const origem = request.headers.get("origin");
                if (!origem || new URL(origem).host !== url.host) return json(403, { mensagem: "Origem não permitida." });
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

            console.error(erro);
            return json(500, { mensagem: "Erro interno. Tente de novo." });
        }
    }
};

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
