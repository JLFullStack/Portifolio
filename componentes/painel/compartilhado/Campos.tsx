"use client";

import { useCallback, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { ErroApi } from "@/lib/api";
import { Icone } from "@/componentes/icones/Icone";

/** Rótulo + controle + dica, empilhados. */
export function Campo({ rotulo, dica, children }: { rotulo: string; dica?: ReactNode; children: ReactNode }) {
    return (
        <label className="campo">
            <span>{rotulo}</span>
            {children}
            {dica && <small>{dica}</small>}
        </label>
    );
}

export function Entrada(props: InputHTMLAttributes<HTMLInputElement>) {
    return <input className="entrada" {...props} />;
}

export function AreaTexto(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea className="entrada" {...props} />;
}

export type Bilingue = { pt: string; en: string };

/**
 * Campo nos dois idiomas, PT e EN lado a lado. `original` destaca o idioma em que o
 * texto foi escrito (depoimentos). Campo vazio num idioma faz a landing usar o outro.
 */
export function CampoBilingue({ rotulo, valor, aoMudar, area = false, linhas = 4, original, dica, maximo }: {
    rotulo: string;
    valor: Bilingue;
    aoMudar: (valor: Bilingue) => void;
    area?: boolean;
    linhas?: number;
    original?: "pt" | "en";
    dica?: ReactNode;
    maximo?: number;
}) {
    return (
        <fieldset className="campo">
            <legend>{rotulo}</legend>
            <div className="bilingue">
                {(["pt", "en"] as const).map(idioma => (
                    <label key={idioma} className={original === idioma ? "original" : undefined}>
                        <span className="idioma">{idioma === "pt" ? "PT" : "EN"}</span>
                        {area ? (
                            <AreaTexto rows={linhas} value={valor[idioma]} maxLength={maximo} lang={idioma === "pt" ? "pt-BR" : "en"}
                                       onChange={e => aoMudar({ ...valor, [idioma]: e.target.value })} />
                        ) : (
                            <Entrada value={valor[idioma]} maxLength={maximo} lang={idioma === "pt" ? "pt-BR" : "en"}
                                     onChange={e => aoMudar({ ...valor, [idioma]: e.target.value })} />
                        )}
                    </label>
                ))}
            </div>
            {dica && <small>{dica}</small>}
        </fieldset>
    );
}

export type EstadoAviso = { tipo: "sucesso" | "erro" | "info"; texto: string } | null;

const ICONE_AVISO = { sucesso: "fal:check-circle", erro: "fal:exclamation-circle", info: "fal:info-circle" } as const;

export function Aviso({ aviso }: { aviso: EstadoAviso }) {
    if (!aviso) return null;

    return (
        <p className={`aviso aviso-${aviso.tipo}`} role={aviso.tipo === "erro" ? "alert" : "status"}>
            <Icone nome={ICONE_AVISO[aviso.tipo]} />
            <span>{aviso.texto}</span>
        </p>
    );
}

/**
 * Executa uma ação assíncrona (salvar, excluir...) controlando o "executando" e a
 * mensagem de resultado. `sucesso` é o texto mostrado quando dá certo.
 */
export function useAcao() {
    const [executando, setExecutando] = useState(false);
    const [aviso, setAviso] = useState<EstadoAviso>(null);

    const executar = useCallback(async (acao: () => Promise<unknown>, sucesso?: string) => {
        setExecutando(true);
        setAviso(null);

        try {
            await acao();
            if (sucesso) setAviso({ tipo: "sucesso", texto: sucesso });
            return true;
        } catch (erro) {
            const texto = erro instanceof ErroApi || erro instanceof Error ? erro.message : "Algo deu errado. Tente de novo.";
            setAviso({ tipo: "erro", texto });
            return false;
        } finally {
            setExecutando(false);
        }
    }, []);

    return { executando, aviso, setAviso, executar };
}
