"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ItemVitrine = { id: number; info: ReactNode; card: ReactNode };

/**
 * Mantém o texto da esquerda em sincronia com a faixa de cards: o card mais
 * próximo da borda esquerda da faixa é o ativo. Os textos e os cards chegam
 * prontos do servidor; aqui só se alterna a classe .ativo.
 */
export function ProjetosVitrine({ projetos, rotuloVitrine, controles }: {
    projetos: ItemVitrine[];
    rotuloVitrine: string;
    controles: ReactNode;
}) {
    const faixa = useRef<HTMLUListElement>(null);
    const [ativo, setAtivo] = useState(projetos[0]?.id);

    useEffect(() => {
        const elemento = faixa.current;

        if (!elemento) return;

        const atualizar = () => {
            // Distância medida entre as bordas visíveis: offsetLeft seria relativo
            // ao offsetParent, não à faixa.
            const borda = elemento.getBoundingClientRect().left;
            let maisProximo: HTMLElement | undefined;
            let menorDistancia = Infinity;

            for (const card of Array.from(elemento.children) as HTMLElement[]) {
                const distancia = Math.abs(card.getBoundingClientRect().left - borda);

                if (distancia < menorDistancia) {
                    menorDistancia = distancia;
                    maisProximo = card;
                }
            }

            if (maisProximo?.dataset.projeto) setAtivo(Number(maisProximo.dataset.projeto));
        };

        elemento.addEventListener("scroll", atualizar, { passive: true });
        atualizar();

        return () => elemento.removeEventListener("scroll", atualizar);
    }, []);

    return (
        <>
            <div className="projetos-info">
                {projetos.map(projeto => (
                    <article key={projeto.id} className={projeto.id === ativo ? "projeto-info ativo" : "projeto-info"}>
                        {projeto.info}
                    </article>
                ))}
            </div>

            <div className="projetos-vitrine">
                {/* tabIndex torna a faixa rolável pelo teclado (setas). */}
                <ul className="projetos-faixa" id="projetos-faixa" ref={faixa} tabIndex={0} aria-label={rotuloVitrine}>
                    {projetos.map(projeto => (
                        <li key={projeto.id} data-projeto={projeto.id}
                            className={projeto.id === ativo ? "projeto-card ativo" : "projeto-card"}>
                            {projeto.card}
                        </li>
                    ))}
                </ul>

                {controles}
            </div>
        </>
    );
}
