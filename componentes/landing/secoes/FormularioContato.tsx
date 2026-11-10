"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

type Textos = {
    titulo: string;
    nome: string;
    email: string;
    interesse: string;
    mensagem: string;
    enviar: string;
    enviando: string;
    sucesso: string;
    erro: string;
    isca: string;
};

const MAXIMO = 3000;

/**
 * Formulário de contato da chamada final. Envia para POST /contato (worker/contato.js),
 * que grava a mensagem no D1 para o painel. O assunto é escolhido em pílulas.
 *
 * Antispam: o campo "site" fica fora da vista (pessoa não preenche, robô sim) e
 * "inicio" diz ao Worker quando o formulário apareceu.
 */
export function FormularioContato({ idioma, interesses, textos, iconeEnviar, iconeOk }: {
    idioma: "pt" | "en";
    interesses: string[];
    textos: Textos;
    iconeEnviar: ReactNode;
    iconeOk: ReactNode;
}) {
    const inicio = useRef(0);
    const [interesse, setInteresse] = useState(interesses[0] ?? "");
    const [mensagem, setMensagem] = useState("");
    const [estado, setEstado] = useState<"livre" | "enviando" | "enviado" | "erro">("livre");
    const [erro, setErro] = useState("");

    useEffect(() => {
        inicio.current = Date.now();
    }, []);

    const enviar = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        const formulario = evento.currentTarget;
        const campos = new FormData(formulario);

        setEstado("enviando");

        try {
            const resposta = await fetch("/contato", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    nome: campos.get("nome"),
                    email: campos.get("email"),
                    interesse,
                    texto: mensagem,
                    site: campos.get("site"),
                    inicio: inicio.current,
                    idioma
                })
            });

            if (!resposta.ok) {
                const corpo = await resposta.json().catch(() => ({})) as { mensagem?: string };
                throw new Error(corpo.mensagem ?? textos.erro);
            }

            formulario.reset();
            setMensagem("");
            setEstado("enviado");
        } catch (falha) {
            setErro(falha instanceof Error && falha.message ? falha.message : textos.erro);
            setEstado("erro");
        }
    };

    if (estado === "enviado") {
        return (
            <div className="contato-formulario contato-enviado" role="status">
                <span className="contato-enviado-icone" aria-hidden="true">{iconeOk}</span>
                <p>{textos.sucesso}</p>
            </div>
        );
    }

    return (
        <form className="contato-formulario" onSubmit={enviar}>
            <h3 className="contato-titulo">{textos.titulo}</h3>

            <div className="contato-linha">
                <label className="contato-campo">
                    <span>{textos.nome}</span>
                    <input name="nome" required maxLength={120} autoComplete="name" />
                </label>
                <label className="contato-campo">
                    <span>{textos.email}</span>
                    <input name="email" type="email" required maxLength={254} autoComplete="email" />
                </label>
            </div>

            {interesses.length > 0 && (
                <fieldset className="contato-interesses">
                    <legend>{textos.interesse}</legend>
                    <div>
                        {interesses.map(opcao => (
                            <label key={opcao} className={opcao === interesse ? "pilula ativa" : "pilula"}>
                                <input type="radio" name="interesse" value={opcao} checked={opcao === interesse}
                                       onChange={() => setInteresse(opcao)} />
                                {opcao}
                            </label>
                        ))}
                    </div>
                </fieldset>
            )}

            <label className="contato-campo">
                <span>{textos.mensagem}</span>
                <textarea name="texto" required minLength={10} maxLength={MAXIMO} rows={5}
                          value={mensagem} onChange={e => setMensagem(e.target.value)} />
                <small className="contato-contador">{mensagem.length}/{MAXIMO}</small>
            </label>

            {/* Campo-isca: fora da vista e da navegação por teclado. */}
            <label className="contato-isca" aria-hidden="true">
                {textos.isca}
                <input name="site" tabIndex={-1} autoComplete="off" />
            </label>

            <button type="submit" className="btn-acento contato-enviar" disabled={estado === "enviando"}>
                {estado === "enviando" ? textos.enviando : textos.enviar}
                {iconeEnviar}
            </button>

            {estado === "erro" && <p className="contato-erro" role="alert">{erro}</p>}
        </form>
    );
}
