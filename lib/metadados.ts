import type { Metadata, Viewport } from "next";
import { DICIONARIOS, LOCALE, ROTA } from "@/dicionarios";
import type { Idioma } from "@/lib/conteudo";

export const URL_SITE = "https://lucasaraujo.dev.br";

/** Título, descrição e as versões da landing em cada idioma (hreflang), para buscadores e redes. */
export function metadadosLanding(idioma: Idioma): Metadata {
    const d = DICIONARIOS[idioma];

    return {
        metadataBase: new URL(URL_SITE),
        title: d.paginaTitulo,
        description: d.paginaDescricao,
        icons: { icon: "/favicon.png" },
        alternates: {
            canonical: ROTA[idioma],
            languages: { [LOCALE.pt]: ROTA.pt, [LOCALE.en]: ROTA.en, "x-default": ROTA.pt }
        },
        openGraph: {
            type: "website",
            url: ROTA[idioma],
            title: d.paginaTitulo,
            description: d.paginaDescricao,
            locale: LOCALE[idioma].replace("-", "_"),
            images: ["/imagens/perfil-biografia-700.webp"]
        }
    };
}

export const viewport: Viewport = {
    themeColor: "#212934"
};
