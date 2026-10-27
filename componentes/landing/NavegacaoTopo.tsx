"use client";

import { useLayoutEffect, useRef } from "react";
import type { SecaoNavegacao } from "./Cabecalho";
import { useSecaoAtiva } from "./secaoAtiva";

/**
 * Os links das seções principais no cabeçalho (só no desktop; no celular fica o menu
 * lateral). Uma pílula em gradiente desliza até o link da seção que está na tela:
 * a posição dela sai do próprio link (--x e --largura), então o CSS só anima transform.
 */
export function NavegacaoTopo({ secoes, rotulo }: { secoes: SecaoNavegacao[]; rotulo: string }) {
    const lista = useRef<HTMLUListElement>(null);
    const ativa = useSecaoAtiva(secoes.map(secao => secao.ancora));

    useLayoutEffect(() => {
        const elemento = lista.current;
        if (!elemento) return;

        const posicionar = () => {
            const link = elemento.querySelector<HTMLElement>(`a[href="#${ativa}"]`);

            elemento.classList.toggle("com-ativo", Boolean(link));
            if (!link) return;

            elemento.style.setProperty("--x", `${link.offsetLeft}px`);
            elemento.style.setProperty("--largura", `${link.offsetWidth}px`);
        };

        posicionar();
        // A largura dos links muda quando a fonte termina de carregar.
        document.fonts?.ready.then(posicionar);
        window.addEventListener("resize", posicionar);

        return () => window.removeEventListener("resize", posicionar);
    }, [ativa]);

    return (
        <nav className="nav-topo" aria-label={rotulo}>
            <ul ref={lista}>
                {secoes.map(secao => (
                    <li key={secao.ancora}>
                        <a href={`#${secao.ancora}`} aria-current={secao.ancora === ativa ? "location" : undefined}>{secao.rotulo}</a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
