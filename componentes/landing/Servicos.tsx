import type { CSSProperties } from "react";
import { texto } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";
import { TituloSecao } from "./Comuns";
import type { PropsSecao } from "./Landing";

/**
 * "O que eu faço": um card por serviço, logo depois da hero, para dizer em segundos
 * o que é entregue. Ícone num ladrilho com halo, número, título, descrição e o
 * atalho para o contato. Os cards entram em sequência (--indice).
 */
export function Servicos({ conteudo, idioma, d }: PropsSecao) {
    return (
        <section id="servicos" className="secao servicos">
            <div className="conteudo">
                <TituloSecao texto={d.secaoServicos} />

                <ul className="servicos-grade">
                    {conteudo.servicos.map((servico, i) => (
                        <li key={i} className="servico-card cartao-luz revelar" style={{ "--indice": i } as CSSProperties}>
                            <span className="servico-numero" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                            <span className="servico-icone" aria-hidden="true"><Icone nome={servico.icone} /></span>
                            <h3 className="servico-titulo">{texto(servico.titulo, idioma)}</h3>
                            <p className="servico-descricao">{texto(servico.descricao, idioma)}</p>
                            <a className="servico-link" href="#contato">
                                {d.servicoContato}
                                <Icone nome="fal:arrow-right" />
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
