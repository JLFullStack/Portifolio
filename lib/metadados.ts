import type { Metadata, Viewport } from "next";
import { DICIONARIOS, LOCALE, ROTA } from "@/dicionarios";
import type { Idioma } from "@/lib/conteudo";

export const URL_SITE = "https://lucasaraujo.dev.br";

/** Ícones do site: o monograma "LA" em SVG, o .ico de reserva e o da tela inicial do iOS (npm run favicon). */
export const ICONES: Metadata["icons"] = {
    icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/icone.svg", type: "image/svg+xml" }
    ],
    apple: "/apple-touch-icon.png"
};

/** Título, descrição e as versões da landing em cada idioma (hreflang), para buscadores e redes. */
export function metadadosLanding(idioma: Idioma): Metadata {
    const d = DICIONARIOS[idioma];

    return {
        metadataBase: new URL(URL_SITE),
        title: d.paginaTitulo,
        description: d.paginaDescricao,
        icons: ICONES,
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
