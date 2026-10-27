"use client";

import { useEffect } from "react";

/**
 * Revela os elementos com .revelar quando eles já estão de fato na tela: ganham
 * a classe .visivel e o CSS toca a animação de entrada (estilos/animacao.css).
 *
 * Só esconde depois que este componente roda (classe .revelar-ativo no <html>):
 * sem JavaScript, ou com movimento reduzido, a página fica inteira e estática.
 */
export function RevelarAoRolar() {
    useEffect(() => {
        if (!("IntersectionObserver" in window)) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const revelar = (entradas: IntersectionObserverEntry[], observador: IntersectionObserver) => {
            for (const entrada of entradas) {
                if (!entrada.isIntersecting) continue;

                entrada.target.classList.add("visivel");
                observador.unobserve(entrada.target);
            }
        };

        // Dispara quando o topo do elemento passa de 75% da altura da tela: bem à vista,
        // não só despontando na borda de baixo, e sem depender da altura dele (um bloco
        // alto nunca chegaria a 20% visível). Com .revelar-tarde (a vitrine de Projetos,
        // que tem muito respiro acima), só a 60%, mais perto do meio da tela.
        const observador = new IntersectionObserver(revelar, { threshold: 0, rootMargin: "0px 0px -25% 0px" });
        const observadorTarde = new IntersectionObserver(revelar, { threshold: 0, rootMargin: "0px 0px -40% 0px" });

        const elementos = document.querySelectorAll(".revelar");

        // No fim da página, o que ficou no último quarto da tela nunca cruzaria a linha:
        // revela tudo o que faltar.
        const noFim = () => {
            if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 2) return;

            elementos.forEach(elemento => elemento.classList.add("visivel"));
            observador.disconnect();
            observadorTarde.disconnect();
            window.removeEventListener("scroll", noFim);
        };

        document.documentElement.classList.add("revelar-ativo");
        elementos.forEach(elemento => (elemento.classList.contains("revelar-tarde") ? observadorTarde : observador).observe(elemento));
        window.addEventListener("scroll", noFim, { passive: true });

        return () => {
            observador.disconnect();
            observadorTarde.disconnect();
            window.removeEventListener("scroll", noFim);
        };
    }, []);

    return null;
}
