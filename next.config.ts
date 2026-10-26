import type { NextConfig } from "next";

const config: NextConfig = {
    // Exportação estática: o build gera HTML pronto em out/, servido pelo Cloudflare
    // sem servidor Node. A landing nunca consulta o banco numa visita.
    output: "export",
    // Sem o otimizador de imagens do Next (precisaria de servidor): as fotos já
    // chegam em WebP nas larguras do srcset (scripts/otimizar-imagens.mjs; R2 a partir da fase 4).
    images: { unoptimized: true },
    poweredByHeader: false,
    experimental: {
        // CSS embutido no <head>: o celular renderiza sem esperar um segundo pedido.
        inlineCss: true,
        // 404 única (out/404.html) para os dois layouts raiz, pt e en.
        globalNotFound: true
    }
};

export default config;
