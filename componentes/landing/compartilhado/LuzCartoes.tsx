"use client";

import { useEffect } from "react";

/**
 * Brilho que segue o ponteiro nos cards com .cartao-luz: um único ouvinte no
 * documento grava a posição do ponteiro em --luz-x e --luz-y do card sob ele, e
 * o CSS desenha o gradiente. Só em telas com mouse (no toque não há "sobre").
 */
export function LuzCartoes() {
    useEffect(() => {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

        const mover = (evento: PointerEvent) => {
            const card = (evento.target as Element | null)?.closest?.<HTMLElement>(".cartao-luz");

            if (!card) return;

            const caixa = card.getBoundingClientRect();
            card.style.setProperty("--luz-x", `${evento.clientX - caixa.left}px`);
            card.style.setProperty("--luz-y", `${evento.clientY - caixa.top}px`);
        };

        document.addEventListener("pointermove", mover, { passive: true });

        return () => document.removeEventListener("pointermove", mover);
    }, []);

    return null;
}
