"use client";

import { useEffect, useState } from "react";

/**
 * A âncora da seção que está no meio da tela: uma faixa fina a 40% da altura da
 * janela (rootMargin) cruza sempre uma seção só. Usada pelo menu do topo e pelo
 * menu lateral para destacar onde o visitante está.
 */
export function useSecaoAtiva(ancoras: string[]): string | undefined {
    const [ativa, setAtiva] = useState<string>();
    const chave = ancoras.join(",");

    useEffect(() => {
        const secoes = chave.split(",").map(id => document.getElementById(id)).filter((s): s is HTMLElement => Boolean(s));
        if (!secoes.length || !("IntersectionObserver" in window)) return;

        const observador = new IntersectionObserver(entradas => {
            for (const entrada of entradas) if (entrada.isIntersecting) setAtiva(entrada.target.id);
        }, { rootMargin: "-40% 0px -59% 0px" });

        secoes.forEach(secao => observador.observe(secao));
        return () => observador.disconnect();
    }, [chave]);

    return ativa;
}
