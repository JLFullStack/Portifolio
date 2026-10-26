import { texto } from "@/lib/conteudo";
import { ItemLinhaTempo, LinhaTempo, SeparadorSecao, TituloSecao } from "./Comuns";
import type { PropsSecao } from "./Landing";

/** Seção 8 do mockup: Educação, numa timeline com os cards alternando os lados. */
export function Educacao({ conteudo, idioma, d }: PropsSecao) {
    return (
        <section id="educacao" className="secao">
            <div className="conteudo">
                <SeparadorSecao />
                <TituloSecao texto={d.secaoEducacao} />

                <LinhaTempo>
                    {conteudo.formacoes.map((formacao, i) => (
                        <ItemLinhaTempo key={i} periodo={texto(formacao.periodo, idioma)} titulo={texto(formacao.titulo, idioma)}>
                            <p>
                                <strong>{d.universidade}</strong> {texto(formacao.instituicao, idioma)}
                            </p>
                        </ItemLinhaTempo>
                    ))}
                </LinhaTempo>
            </div>
        </section>
    );
}
