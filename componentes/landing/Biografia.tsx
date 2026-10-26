import type { CSSProperties } from "react";
import { LOCALE } from "@/dicionarios";
import { src, srcset, texto } from "@/lib/conteudo";
import { idade } from "@/lib/datas";
import { LinkSocial, TituloSecao } from "./Comuns";
import { Idade } from "./Idade";
import type { PropsSecao } from "./Landing";

/**
 * Seção 3 do mockup: Biografia. À esquerda a foto circular com anel ciano e as
 * redes sociais no arco inferior (o ângulo de cada uma sai do --indice, no CSS);
 * à direita os parágrafos e os dados em duas colunas.
 */
export function Biografia({ conteudo, idioma, d }: PropsSecao) {
    const { perfil, redes } = conteudo;
    const nascimento = new Intl.DateTimeFormat(LOCALE[idioma], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
        .format(new Date(`${perfil.nascimento}T00:00:00Z`));

    return (
        <section id="biografia" className="secao">
            <div className="conteudo bio-grade">
                <div className="bio-retrato">
                    <div className="bio-anel">
                        <img className="bio-foto"
                             src={src(perfil.fotoBiografia)}
                             srcSet={srcset(perfil.fotoBiografia)}
                             sizes="(max-width: 767px) 15rem, 22rem"
                             width={perfil.fotoBiografia.largura} height={perfil.fotoBiografia.altura}
                             alt={d.bioFotoAlt}
                             loading="lazy" decoding="async" />

                        <ul className="bio-redes">
                            {redes.map((rede, indice) => (
                                <li key={rede.nome} className="bio-rede" style={{ "--indice": indice } as CSSProperties}>
                                    <LinkSocial rede={rede} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bio-texto">
                    <TituloSecao texto={d.secaoBiografia} />

                    {perfil.biografia.map((paragrafo, i) => (
                        <p key={i} className="bio-paragrafo">{texto(paragrafo, idioma)}</p>
                    ))}

                    <dl className="bio-dados">
                        <div className="bio-dado">
                            <dt>{d.bioNome}</dt>
                            <dd>{perfil.nomeCompleto}</dd>
                        </div>
                        <div className="bio-dado">
                            <dt>{d.bioNascimento}</dt>
                            <dd>{nascimento}</dd>
                        </div>
                        <div className="bio-dado">
                            <dt>{d.bioIdade}</dt>
                            <dd>
                                <Idade nascimento={perfil.nascimento}
                                       noBuild={idade(perfil.nascimento, new Date())}
                                       formato={d.anos} />
                            </dd>
                        </div>
                        <div className="bio-dado">
                            <dt>{d.bioEndereco}</dt>
                            <dd>{texto(perfil.endereco, idioma)}</dd>
                        </div>
                        <div className="bio-dado">
                            <dt>{d.bioTelefone}</dt>
                            <dd><a href={`tel:${perfil.telefone.replace(/[^\d+]/g, "")}`}>{perfil.telefone}</a></dd>
                        </div>
                        <div className="bio-dado">
                            <dt>{d.bioEmail}</dt>
                            <dd><a href={`mailto:${perfil.email}`}>{perfil.email}</a></dd>
                        </div>
                    </dl>
                </div>
            </div>
        </section>
    );
}
