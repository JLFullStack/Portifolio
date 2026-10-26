"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Botão de voltar ao topo: aparece depois de 150px de rolagem e sobe suavemente. */
export function BotaoTopo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
    const [ativo, setAtivo] = useState(false);

    useEffect(() => {
        const atualizar = () => setAtivo(window.scrollY > 150);

        window.addEventListener("scroll", atualizar, { passive: true });
        atualizar();

        return () => window.removeEventListener("scroll", atualizar);
    }, []);

    return (
        <button type="button" className={ativo ? "botao-topo ativo" : "botao-topo"} aria-label={rotulo}
                tabIndex={ativo ? 0 : -1}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            {children}
        </button>
    );
}
