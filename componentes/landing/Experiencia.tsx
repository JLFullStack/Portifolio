import { texto } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";
import { ItemLinhaTempo, LinhaTempo, SeparadorSecao, TituloSecao } from "./Comuns";
import type { PropsSecao } from "./Landing";

/** Seção 9 do mockup: Experiência. Mesma timeline da Educação, com empresa, endereço, descrição e a stack do cargo. */
export function Experiencia({ conteudo, idioma, d }: PropsSecao) {
    return (
        <section id="experiencia" className="secao">
            <div className="conteudo">
                <SeparadorSecao />
                <TituloSecao texto={d.secaoExperiencia} />

                <LinhaTempo>
                    {conteudo.experiencias.map((experiencia, i) => (
                        <ItemLinhaTempo key={i} periodo={texto(experiencia.periodo, idioma)} titulo={texto(experiencia.cargo, idioma)}
                                       icone={<Icone nome="fal:briefcase" />}>
                            <p>
                                <strong>{d.empresa}</strong> {texto(experiencia.empresa, idioma)}
                            </p>
                            <p>
                                <strong>{d.endereco}</strong> {texto(experiencia.endereco, idioma)}
                            </p>
                            <p className="linha-tempo-descricao">{texto(experiencia.descricao, idioma)}</p>
                            {experiencia.stack.length > 0 && (
                                <ul className="etiquetas" aria-label={d.tecnologias}>
                                    {experiencia.stack.map(tecnologia => <li key={tecnologia}>{tecnologia}</li>)}
                                </ul>
                            )}
                        </ItemLinhaTempo>
                    ))}
                </LinhaTempo>
            </div>
        </section>
    );
}
