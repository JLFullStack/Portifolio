import { src, srcset, texto } from "@/lib/conteudo";
import { LOCALE } from "@/dicionarios";
import { Icone } from "@/componentes/icones/Icone";
import { TituloSecao } from "./Comuns";
import { ControlesFaixa } from "./ControlesFaixa";
import type { PropsSecao } from "./Landing";

/**
 * Seção 5 do mockup: Depoimentos. Dois cards por vez no desktop (um no celular),
 * numa faixa com scroll-snap: avatar à esquerda, depoimento à direita, nome e profissão
 * (com o botão do LinkedIn, quando a pessoa informou o perfil).
 * Cards com borda em gradiente e aspas grandes ao fundo.
 *
 * O depoimento aparece no idioma da página quando há tradução; sem ela, no
 * idioma em que a pessoa escreveu. Nesse caso o lang do texto avisa o leitor de tela.
 */
export function Depoimentos({ conteudo, idioma, d }: PropsSecao) {
    return (
        <section id="depoimentos" className="secao">
            <div className="conteudo">
                <TituloSecao texto={d.secaoDepoimentos} />

                <ul className="depoimentos-faixa revelar" id="depoimentos-faixa" tabIndex={0} aria-label={d.secaoDepoimentos}>
                    {conteudo.depoimentos.map(depoimento => {
                        const traduzido = Boolean(depoimento.texto[idioma]);
                        const idiomaTexto = traduzido ? idioma : depoimento.idiomaOriginal;

                        return (
                            <li key={depoimento.id} className="depoimento-card cartao-luz">
                                <Icone nome="fas:quote-left" className="depoimento-aspas" />

                                <div className="depoimento-avatar">
                                    {depoimento.foto ? (
                                        <img src={src(depoimento.foto)} srcSet={srcset(depoimento.foto)} sizes="9rem"
                                             width={depoimento.foto.largura} height={depoimento.foto.altura}
                                             alt={d.fotoDepoenteAlt(depoimento.nome)}
                                             loading="lazy" decoding="async" />
                                    ) : (
                                        <Icone nome="fas:user" />
                                    )}
                                </div>

                                <div className="depoimento-corpo">
                                    <blockquote className="depoimento-texto"
                                                lang={idiomaTexto !== idioma ? LOCALE[idiomaTexto] : undefined}>
                                        {texto(depoimento.texto, idioma)}
                                    </blockquote>
                                    <div className="depoimento-rodape">
                                        <p className="depoimento-autor">
                                            <strong>{depoimento.nome}</strong>
                                            <span className="depoimento-cargo">{texto(depoimento.profissao, idioma)}</span>
                                        </p>
                                        {depoimento.linkedin && (
                                            <a className="botao-icone depoimento-linkedin" href={depoimento.linkedin} target="_blank" rel="noopener noreferrer"
                                               aria-label={d.linkedinDepoente(depoimento.nome)} title={d.linkedinDepoente(depoimento.nome)}>
                                                <Icone nome="fab:linkedin-in" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <ControlesFaixa idFaixa="depoimentos-faixa" passo="pagina"
                                rotuloAnterior={d.depoimentoAnterior} rotuloProximo={d.proximoDepoimento}
                                iconeAnterior={<Icone nome="fal:chevron-left" />}
                                iconeProximo={<Icone nome="fal:chevron-right" />} />
            </div>
        </section>
    );
}
