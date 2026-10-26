"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import type { SecaoNavegacao } from "./Cabecalho";

type Rotulos = { abrir: string; fechar: string; titulo: string; navegacao: string };

/**
 * Botão do menu e o menu lateral com as âncoras das seções, num <dialog> nativo:
 * showModal() escurece o fundo, prende o foco no menu e fecha com Esc. Clicar
 * fora do painel ou num link também fecha.
 */
export function MenuNavegacao({ secoes, rotulos, iconeAbrir, iconeFechar }: {
    secoes: SecaoNavegacao[];
    rotulos: Rotulos;
    iconeAbrir: ReactNode;
    iconeFechar: ReactNode;
}) {
    const menu = useRef<HTMLDialogElement>(null);

    const fechar = () => menu.current?.close();

    // O clique no fundo escurecido chega ao próprio <dialog>, fora do painel.
    const clicarNoFundo = (evento: MouseEvent<HTMLDialogElement>) => {
        if (evento.target === menu.current) fechar();
    };

    return (
        <>
            <button className="botao-icone" type="button"
                    aria-controls="menu-navegacao" aria-haspopup="dialog" aria-label={rotulos.abrir}
                    onClick={() => menu.current?.showModal()}>
                {iconeAbrir}
            </button>

            <dialog className="menu-navegacao" id="menu-navegacao" ref={menu}
                    aria-label={rotulos.navegacao} onClick={clicarNoFundo}>
                <div className="menu-cabecalho">
                    <span className="menu-titulo">{rotulos.titulo}</span>
                    <button className="botao-icone" type="button" aria-label={rotulos.fechar} onClick={fechar}>
                        {iconeFechar}
                    </button>
                </div>

                <nav className="menu-corpo" aria-label={rotulos.navegacao}>
                    <ul className="lista-navegacao">
                        {secoes.map(secao => (
                            <li key={secao.ancora}>
                                <a className="link-navegacao" href={`#${secao.ancora}`} onClick={fechar}>{secao.rotulo}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </dialog>
        </>
    );
}
