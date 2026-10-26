"use client";

import { useEffect, useState, type ReactNode } from "react";

const CHAVE_TEMA = "portifolio-tema";

type Tema = "claro" | "escuro";

const temaAtual = (): Tema =>
    document.documentElement.getAttribute("data-tema") === "claro" ? "claro" : "escuro";

/**
 * Alterna o tema claro/escuro e grava a escolha no localStorage. Quem aplica o
 * tema na carga é o script inline de Documento.tsx, antes da primeira pintura.
 *
 * O botão anuncia a AÇÃO: no tema escuro mostra o sol e diz "mudar para o claro".
 * Os dois ícones vêm como children; o CSS mostra o certo pelo data-tema.
 */
export function BotaoTema({ rotuloClaro, rotuloEscuro, children }: {
    rotuloClaro: string;
    rotuloEscuro: string;
    children: ReactNode;
}) {
    // O HTML estático sai com o rótulo do tema padrão (escuro); corrige na montagem.
    const [tema, setTema] = useState<Tema>("escuro");

    useEffect(() => setTema(temaAtual()), []);

    const alternar = () => {
        const novo: Tema = temaAtual() === "claro" ? "escuro" : "claro";

        document.documentElement.setAttribute("data-tema", novo);
        setTema(novo);

        try {
            localStorage.setItem(CHAVE_TEMA, novo);
        } catch {
            // Armazenamento bloqueado: o tema vale só para esta visita.
        }
    };

    const rotulo = tema === "claro" ? rotuloEscuro : rotuloClaro;

    return (
        <button className="botao-icone" type="button" id="btn-tema" aria-label={rotulo} title={rotulo} onClick={alternar}>
            {children}
        </button>
    );
}
