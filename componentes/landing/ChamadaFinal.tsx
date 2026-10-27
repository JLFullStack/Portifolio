import { texto } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";
import type { PropsSecao } from "./Landing";

/**
 * Seção 10 do mockup: chamada final. Um painel em gradiente com aurora e anéis
 * decorativos: à esquerda o convite e a citação, à direita o CONTATO (WhatsApp).
 * O convite é o h2 da seção.
 */
export function ChamadaFinal({ conteudo, idioma, d }: PropsSecao) {
    const { perfil } = conteudo;

    return (
        <section id="contato" className="secao">
            <div className="conteudo">
                <div className="chamada-card revelar">
                    <span className="chamada-aneis" aria-hidden="true" />

                    <div className="chamada-texto">
                        <h2 className="chamada-convite">{texto(perfil.chamadaConvite, idioma)}</h2>
                        <figure className="chamada-citacao">
                            <blockquote>{texto(perfil.chamadaCitacao, idioma)}</blockquote>
                            <figcaption>{perfil.chamadaAutor}</figcaption>
                        </figure>
                    </div>

                    <a className="btn-claro chamada-botao" href={perfil.whatsapp} target="_blank" rel="noopener noreferrer">
                        <Icone nome="fab:whatsapp" />
                        {d.contato}
                        <Icone nome="fal:arrow-right" className="icone-seta" />
                    </a>
                </div>
            </div>
        </section>
    );
}
