"use client";

import type { ReactNode } from "react";

/**
 * As setas ‹ › de uma faixa de rolagem com scroll-snap (Projetos e Depoimentos).
 * `passo`: "item" rola um card (Projetos); "pagina" rola a largura visível da
 * faixa (Depoimentos: dois cards no desktop, um no celular).
 */
export function ControlesFaixa({ idFaixa, passo, rotuloAnterior, rotuloProximo, iconeAnterior, iconeProximo }: {
    idFaixa: string;
    passo: "item" | "pagina";
    rotuloAnterior: string;
    rotuloProximo: string;
    iconeAnterior: ReactNode;
    iconeProximo: ReactNode;
}) {
    const rolar = (direcao: -1 | 1) => {
        const faixa = document.getElementById(idFaixa);

        if (!faixa) return;

        let distancia = faixa.clientWidth;

        if (passo === "item") {
            const card = faixa.firstElementChild;
            const espaco = parseFloat(getComputedStyle(faixa).columnGap) || 0;

            if (card) distancia = card.getBoundingClientRect().width + espaco;
        }

        faixa.scrollBy({ left: distancia * direcao, behavior: "smooth" });
    };

    return (
        <div className="controles-carrossel">
            <button type="button" className="controle-faixa" aria-controls={idFaixa} aria-label={rotuloAnterior}
                    onClick={() => rolar(-1)}>
                {iconeAnterior}
            </button>
            <button type="button" className="controle-faixa" aria-controls={idFaixa} aria-label={rotuloProximo}
                    onClick={() => rolar(1)}>
                {iconeProximo}
            </button>
        </div>
    );
}
