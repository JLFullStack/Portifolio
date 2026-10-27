"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * O <header> fixo. Ganha a classe .rolado (fundo sólido) assim que a página sai
 * do topo, para o conteúdo não passar ilegível por trás dele.
 */
export function CabecalhoFixo({ children }: { children: ReactNode }) {
    const [rolado, setRolado] = useState(false);

    useEffect(() => {
        const atualizar = () => setRolado(window.scrollY > 10);

        window.addEventListener("scroll", atualizar, { passive: true });
        atualizar();

        return () => window.removeEventListener("scroll", atualizar);
    }, []);

    return (
        <header className={rolado ? "cabecalho rolado" : "cabecalho"} id="cabecalho">
            {children}
            {/* Barra de progresso da leitura: preenchida pela rolagem, só com CSS (animation-timeline). */}
            <span className="cabecalho-progresso" aria-hidden="true" />
        </header>
    );
}
