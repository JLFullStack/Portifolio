import type { CSSProperties } from "react";
import { texto } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";
import type { NomeIcone } from "@/componentes/icones/dados";
import { SeparadorSecao, TituloSecao } from "./Comuns";
import type { PropsSecao } from "./Landing";

// Ícone de cada grupo, escolhido pelo título (em pt ou en). Grupo novo sem par cai no ícone genérico.
const ICONES_GRUPO: [RegExp, NomeIcone][] = [
    [/front/i, "fal:laptop-code"],
    [/back/i, "fal:server"],
    [/banco|dados|database|data/i, "fal:database"],
    [/devops|ops/i, "fal:infinity"],
    [/outr|other/i, "fal:layer-group"]
];

/**
 * Seção 6 do mockup: Habilidades Profissionais. Cards de mesma altura lado a lado
 * (coluna no celular), cada um com o ícone do grupo, o número dele e os itens em
 * etiquetas. Cada card tem a sua cor do gradiente (--indice, no CSS).
 */
export function Habilidades({ conteudo, idioma, d }: PropsSecao) {
    return (
        <section id="habilidades" className="secao">
            <div className="conteudo">
                <SeparadorSecao />
                <TituloSecao texto={d.secaoHabilidades} />

                <ul className="habilidades-grade">
                    {conteudo.habilidades.map((grupo, i) => {
                        const titulo = texto(grupo.titulo, idioma);
                        const icone = ICONES_GRUPO.find(([padrao]) => padrao.test(grupo.titulo.pt) || padrao.test(titulo))?.[1] ?? "fal:code";

                        return (
                            <li key={i} className="habilidades-card cartao-luz revelar" style={{ "--indice": i } as CSSProperties}>
                                <span className="habilidades-numero" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                                <span className="habilidades-icone" aria-hidden="true"><Icone nome={icone} /></span>
                                <h3 className="habilidades-titulo">{titulo}</h3>
                                <ul className="habilidades-itens">
                                    {grupo.itens.map((item, j) => <li key={j}>{texto(item, idioma)}</li>)}
                                </ul>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
