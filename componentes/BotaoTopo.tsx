"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Botão de voltar ao topo: aparece depois de 150px de rolagem, com um anel em
 * gradiente que se fecha conforme a leitura avança. No clique a seta "decola"
 * (classe .decolando) e a página sobe suavemente.
 *
 * O progresso vai direto para a variável --progresso do botão, sem re-renderizar
 * o React a cada evento de rolagem.
 */
export function BotaoTopo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
    const botao = useRef<HTMLButtonElement>(null);
    const [ativo, setAtivo] = useState(false);
    const [decolando, setDecolando] = useState(false);

    useEffect(() => {
        let quadro = 0;

        const atualizar = () => {
            quadro = 0;
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const progresso = total > 0 ? Math.min(1, window.scrollY / total) : 0;

            botao.current?.style.setProperty("--progresso", progresso.toFixed(4));
            setAtivo(window.scrollY > 150);
        };

        const agendar = () => {
            if (!quadro) quadro = requestAnimationFrame(atualizar);
        };

        window.addEventListener("scroll", agendar, { passive: true });
        window.addEventListener("resize", agendar, { passive: true });
        atualizar();

        return () => {
            cancelAnimationFrame(quadro);
            window.removeEventListener("scroll", agendar);
            window.removeEventListener("resize", agendar);
        };
    }, []);

    const subir = () => {
        setDecolando(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.setTimeout(() => setDecolando(false), 900);
    };

    const classes = ["botao-topo", ativo && "ativo", decolando && "decolando"].filter(Boolean).join(" ");

    return (
        <button ref={botao} type="button" className={classes} aria-label={rotulo} tabIndex={ativo ? 0 : -1} onClick={subir}>
            <svg className="botao-topo-anel" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                <defs>
                    <linearGradient id="botao-topo-gradiente" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="var(--cor-acento-solido)" />
                        <stop offset="1" stopColor="var(--cor-violeta)" />
                    </linearGradient>
                </defs>
                <circle className="botao-topo-trilho" cx="24" cy="24" r="22" />
                <circle className="botao-topo-progresso" cx="24" cy="24" r="22" pathLength="1" />
            </svg>
            <span className="botao-topo-seta">{children}</span>
        </button>
    );
}
