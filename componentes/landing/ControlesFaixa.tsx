"use client";

import type { ReactNode } from "react";

// Folga para "chegou à ponta": o scroll-snap e o arredondamento de subpixel param a
// rolagem a um ou dois pixels do limite exato.
const FOLGA = 4;

/**
 * As setas ‹ › de uma faixa de rolagem com scroll-snap (Projetos e Depoimentos).
 * `passo`: "item" rola um card (Projetos); "pagina" rola a largura visível da
 * faixa (Depoimentos: dois cards no desktop, um no celular).
 *
 * O carrossel é circular: no último item, › volta ao primeiro; no primeiro, ‹ vai
 * ao último. Em Projetos, o respiro no fim da faixa (CSS) deixa o último card
 * chegar à borda esquerda, então o fim da rolagem é ele ativo.
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

        const fim = faixa.scrollWidth - faixa.clientWidth;

        if (direcao === 1 && faixa.scrollLeft >= fim - FOLGA) {
            faixa.scrollTo({ left: 0, behavior: "smooth" });
            return;
        }

        if (direcao === -1 && faixa.scrollLeft <= FOLGA) {
            faixa.scrollTo({ left: fim, behavior: "smooth" });
            return;
        }

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
