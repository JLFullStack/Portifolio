"use client";

import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import type { SecaoNavegacao } from "./Cabecalho";
import { useSecaoAtiva } from "./secaoAtiva";

type Rotulos = { abrir: string; fechar: string; titulo: string; navegacao: string };

/**
 * Botão do menu e o menu lateral com as âncoras das seções, num <dialog> nativo:
 * showModal() escurece o fundo, prende o foco no menu e fecha com Esc. Clicar
 * fora do painel ou num link também fecha.
 *
 * Cada seção tem número, ícone e uma seta que aparece no hover; a seção que está
 * na tela fica destacada. Os itens entram em sequência (--indice, no CSS). No
 * rodapé, `rodape` traz o que o servidor montou: botões, redes e o selo.
 */
export function MenuNavegacao({ secoes, rotulos, marca, iconeAbrir, iconeFechar, iconeSeta, rodape }: {
    secoes: SecaoNavegacao[];
    rotulos: Rotulos;
    marca: ReactNode;
    iconeAbrir: ReactNode;
    iconeFechar: ReactNode;
    iconeSeta: ReactNode;
    rodape: ReactNode;
}) {
    const menu = useRef<HTMLDialogElement>(null);
    const ativa = useSecaoAtiva(secoes.map(secao => secao.ancora));

    const fechar = () => menu.current?.close();

    // O clique no fundo escurecido chega ao próprio <dialog>, fora do painel.
    // Clique em link do rodapé (CV, contato) também fecha.
    const clicar = (evento: MouseEvent<HTMLDialogElement>) => {
        if (evento.target === menu.current || (evento.target as Element).closest(".menu-rodape a")) fechar();
    };

    return (
        <>
            <button className="botao-icone botao-menu" type="button"
                    aria-controls="menu-navegacao" aria-haspopup="dialog" aria-label={rotulos.abrir}
                    onClick={() => menu.current?.showModal()}>
                {iconeAbrir}
            </button>

            <dialog className="menu-navegacao" id="menu-navegacao" ref={menu}
                    aria-label={rotulos.navegacao} onClick={clicar}>
                <div className="menu-cabecalho">
                    <div className="menu-marca">
                        {marca}
                        <span className="menu-titulo">{rotulos.titulo}</span>
                    </div>
                    <button className="botao-icone menu-fechar" type="button" aria-label={rotulos.fechar} onClick={fechar}>
                        {iconeFechar}
                    </button>
                </div>

                <nav className="menu-corpo" aria-label={rotulos.navegacao}>
                    <ol className="lista-navegacao">
                        {secoes.map((secao, indice) => (
                            <li key={secao.ancora} style={{ "--indice": indice } as CSSProperties}>
                                <a className="link-navegacao" href={`#${secao.ancora}`} onClick={fechar}
                                   aria-current={secao.ancora === ativa ? "location" : undefined}>
                                    <span className="link-navegacao-numero" aria-hidden="true">{String(indice + 1).padStart(2, "0")}</span>
                                    <span className="link-navegacao-icone" aria-hidden="true">{secao.icone}</span>
                                    <span className="link-navegacao-rotulo">{secao.rotulo}</span>
                                    <span className="link-navegacao-seta" aria-hidden="true">{iconeSeta}</span>
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>

                <div className="menu-rodape" style={{ "--indice": secoes.length } as CSSProperties}>{rodape}</div>
            </dialog>
        </>
    );
}
