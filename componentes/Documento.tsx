import type { ReactNode } from "react";
import { ernestone, inter } from "@/app/fontes";
import "@/estilos/app.css";
import "@/estilos/animacao.css";
import "@/estilos/responsivo.css";

// Tema: aplica o data-tema ANTES da primeira pintura, senão quem escolheu o tema
// claro vê o escuro piscar a cada carregamento. Inline e antes do conteúdo. Padrão: escuro.
// A área restrita é sempre escura: a escolha vale só para o site, onde fica o botão.
const SCRIPT_TEMA = `(function () {
    var tema = "escuro";
    try {
        if (localStorage.getItem("portifolio-tema") === "claro" && !/^\\/(admin|login|convite|depoimento)(\\/|$)/.test(location.pathname)) tema = "claro";
    } catch (e) { /* localStorage bloqueado: segue no tema padrão */ }
    document.documentElement.setAttribute("data-tema", tema);
})();`;

/**
 * O <html> de todas as páginas: idioma, fontes, estilos globais e o script do tema.
 * Usado pelos layouts raiz de cada idioma (app/(pt) e app/(en)) e pela página 404.
 *
 * suppressHydrationWarning: o script do tema altera o data-tema do <html> antes
 * de o React assumir a página, e isso é esperado.
 */
export function Documento({ lang, children }: { lang: string; children: ReactNode }) {
    return (
        <html lang={lang} data-tema="escuro" className={`${inter.variable} ${ernestone.variable}`} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
            </head>
            <body>{children}</body>
        </html>
    );
}
