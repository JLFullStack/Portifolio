import type { CSSProperties, ReactNode } from "react";
import { LOCALE } from "@/dicionarios";
import { src, srcset, texto } from "@/lib/conteudo";
import { idade } from "@/lib/datas";
import { Icone } from "@/componentes/icones/Icone";
import type { NomeIcone } from "@/componentes/icones/dados";
import { LinkSocial, TituloSecao } from "@/componentes/landing/compartilhado/Comuns";
import { Idade } from "@/componentes/landing/secoes/Idade";
import type { PropsSecao } from "@/componentes/landing/Landing";

/**
 * Seção 3 do mockup: Biografia. À esquerda a foto circular com o anel em
 * gradiente girando e as redes sociais no arco inferior (o ângulo de cada uma
 * sai do --indice, no CSS); à direita os parágrafos, os dados em duas colunas e
 * os números (anos de experiência, tecnologias, formações, certificações),
 * todos calculados do conteúdo no build.
 */
export function Biografia({ conteudo, idioma, d }: PropsSecao) {
    const { perfil, redes } = conteudo;
    const nascimento = perfil.nascimento && new Intl.DateTimeFormat(LOCALE[idioma], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
        .format(new Date(`${perfil.nascimento}T00:00:00Z`));
    const endereco = texto(perfil.endereco, idioma);

    // Início da carreira: o ano do painel (Perfil) ou, sem ele, o mais antigo citado nos períodos das experiências.
    const anosCarreira = conteudo.experiencias
        .flatMap(experiencia => texto(experiencia.periodo, idioma).match(/\d{4}/g) ?? [])
        .map(Number);
    const inicioCarreira = perfil.inicioCarreira ?? (anosCarreira.length ? Math.min(...anosCarreira) : undefined);
    const tecnologias = conteudo.habilidades.reduce((total, grupo) => total + grupo.itens.length, 0);

    const numeros = [
        ...(inicioCarreira ? [{ valor: `${new Date().getFullYear() - inicioCarreira}+`, rotulo: d.numeroExperiencia }] : []),
        ...(tecnologias ? [{ valor: `${tecnologias}`, rotulo: d.numeroTecnologias }] : []),
        ...(conteudo.formacoes.length ? [{ valor: `${conteudo.formacoes.length}`, rotulo: d.numeroFormacoes }] : []),
        ...(conteudo.certificacoes.length ? [{ valor: `${conteudo.certificacoes.length}`, rotulo: d.numeroCertificacoes }] : [])
    ];

    const dado = (icone: NomeIcone, rotulo: string, valor: ReactNode) => (
        <div key={rotulo} className="bio-dado">
            {/* Num <dl>, o <div> só pode ter <dt> e <dd>: o ícone vai dentro do termo. */}
            <dt><span className="bio-dado-icone" aria-hidden="true"><Icone nome={icone} /></span>{rotulo}</dt>
            <dd>{valor}</dd>
        </div>
    );

    // Dado pessoal vazio no painel não aparece (sem nascimento, some também a idade).
    const dados = [
        perfil.nomeCompleto && dado("fal:id-card", d.bioNome, perfil.nomeCompleto),
        nascimento && dado("fal:calendar-alt", d.bioNascimento, nascimento),
        nascimento && dado("fal:birthday-cake", d.bioIdade,
            <Idade nascimento={perfil.nascimento}
                   noBuild={idade(perfil.nascimento, new Date())}
                   formato={d.anos} />),
        endereco && dado("fal:map-marker-alt", d.bioEndereco, endereco),
        perfil.telefone && dado("fal:mobile-alt", d.bioTelefone,
            <a href={`tel:${perfil.telefone.replace(/[^\d+]/g, "")}`}>{perfil.telefone}</a>),
        perfil.email && dado("fal:envelope", d.bioEmail, <a href={`mailto:${perfil.email}`}>{perfil.email}</a>)
    ].filter(Boolean);

    return (
        <section id="biografia" className="secao bio">
            <div className="conteudo bio-grade">
                <div className="bio-retrato revelar">
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

                <div className="bio-texto revelar">
                    <TituloSecao texto={d.secaoBiografia} />

                    {perfil.biografia.map((paragrafo, i) => (
                        <p key={i} className="bio-paragrafo">{texto(paragrafo, idioma)}</p>
                    ))}

                    {dados.length > 0 && <dl className="bio-dados">{dados}</dl>}
                </div>
            </div>

            {numeros.length > 0 && (
                <div className="conteudo">
                    <ul className="bio-numeros">
                        {numeros.map((numero, indice) => (
                            <li key={numero.rotulo} className="bio-numero revelar" style={{ "--indice": indice } as CSSProperties}>
                                <strong className="texto-gradiente">{numero.valor}</strong>
                                <span>{numero.rotulo}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
