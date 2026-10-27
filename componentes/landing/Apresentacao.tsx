import type { CSSProperties } from "react";
import { src, srcset, texto } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";
import type { PropsSecao } from "./Landing";

/**
 * Seção 2 do mockup: Hero. À esquerda a saudação, o nome, o cargo, a apresentação
 * e os botões; à direita a foto sobre um disco em gradiente, com uma órbita
 * tracejada e as tecnologias principais flutuando em volta. Ao fundo, a aurora,
 * a grade de pontos, a palavra gigante contornada e três curvas finas em SVG inline
 * que se desenham na abertura. Embaixo, a faixa contínua com todas as tecnologias.
 *
 * Tudo o que se mexe aqui é CSS (transform e opacity): nada de JavaScript nem
 * de reflow, e a foto (o LCP) nunca começa invisível.
 */
export function Apresentacao({ conteudo, idioma, d }: PropsSecao) {
    const { perfil, habilidades } = conteudo;
    const tecnologias = habilidades.flatMap(grupo => grupo.itens.map(item => texto(item, idioma)));
    // Uma tecnologia de cada grupo, para as etiquetas que flutuam em volta da foto.
    const destaques = habilidades.slice(0, 4).map(grupo => grupo.itens[0]).filter(Boolean).map(item => texto(item, idioma));

    return (
        <section id="apresentacao" className="secao secao--abertura hero" aria-label={d.secaoApresentacao}>
            <div className="hero-aurora" aria-hidden="true" />
            <span className="hero-fundo" aria-hidden="true">{d.heroFundo}</span>

            <svg className="hero-curvas" viewBox="0 0 1898 1000" preserveAspectRatio="xMaxYMid slice"
                 aria-hidden="true" focusable="false">
                <defs>
                    <linearGradient id="hero-curvas-gradiente" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="var(--cor-acento-solido)" />
                        <stop offset="1" stopColor="var(--cor-violeta)" />
                    </linearGradient>
                </defs>
                <g fill="none" stroke="url(#hero-curvas-gradiente)" strokeWidth="2" pathLength="1">
                    <path pathLength="1" d="M814 0 C 828 70, 872 106, 952 162 C 1062 238, 1152 302, 1192 402 C 1226 492, 1200 562, 1232 642 C 1282 762, 1452 852, 1898 942" />
                    <path pathLength="1" d="M870 0 C 884 70, 928 106, 1008 162 C 1118 238, 1202 306, 1230 406 C 1258 496, 1236 572, 1270 652 C 1322 772, 1502 862, 1898 892" />
                    <path pathLength="1" d="M926 0 C 940 70, 984 106, 1064 162 C 1174 238, 1248 312, 1266 412 C 1288 502, 1270 580, 1302 662 C 1358 782, 1562 872, 1898 988" />
                </g>
            </svg>

            <div className="conteudo hero-grade">
                <div className="hero-texto">
                    <p className="hero-saudacao entrada" style={{ "--atraso": 0 } as CSSProperties}>
                        <span className="hero-aceno" aria-hidden="true">👋</span>
                        {texto(perfil.saudacao, idioma)}
                    </p>
                    <h1 className="hero-nome entrada" style={{ "--atraso": 1 } as CSSProperties}>
                        <span className="texto-gradiente">{perfil.nomeCurto}</span>
                    </h1>
                    <p className="hero-profissao entrada" style={{ "--atraso": 2 } as CSSProperties}>
                        {texto(perfil.profissao, idioma)}
                    </p>
                    <p className="hero-descricao entrada" style={{ "--atraso": 3 } as CSSProperties}>
                        {texto(perfil.descricaoHero, idioma)}
                    </p>
                    <div className="hero-acoes entrada" style={{ "--atraso": 4 } as CSSProperties}>
                        <a className="btn-acento" href={perfil.curriculo} target="_blank" rel="noopener noreferrer">
                            <Icone nome="fal:download" />
                            {d.baixarCv}
                        </a>
                        <a className="btn-contorno" href="#contato">
                            {d.heroContato}
                            <Icone nome="fal:arrow-right" />
                        </a>
                    </div>
                </div>

                {/* Primeira dobra e maior elemento do carregamento (LCP): sem lazy e com
                    prioridade alta. sizes segue o CSS: até 26rem no desktop, 16rem no celular. */}
                <div className="hero-foto">
                    <span className="hero-disco" aria-hidden="true" />
                    <span className="hero-orbita" aria-hidden="true" />
                    <img src={src(perfil.fotoHero)}
                         srcSet={srcset(perfil.fotoHero)}
                         sizes="(max-width: 767px) 16rem, 26rem"
                         width={perfil.fotoHero.largura} height={perfil.fotoHero.altura}
                         alt={d.fotoHeroAlt}
                         fetchPriority="high" decoding="async" />
                    <ul className="hero-etiquetas" aria-hidden="true">
                        {destaques.map((tecnologia, i) => (
                            <li key={tecnologia} className="hero-etiqueta" style={{ "--indice": i } as CSSProperties}>
                                {tecnologia}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Faixa contínua (letreiro): a lista vai duas vezes para o laço não ter emenda.
                A cópia é só visual; o leitor de tela já tem as habilidades na seção própria. */}
            {tecnologias.length > 0 && (
                <div className="letreiro" aria-hidden="true">
                    <div className="letreiro-trilho">
                        {[0, 1].map(copia => (
                            <ul key={copia} className="letreiro-lista">
                                {tecnologias.map((tecnologia, i) => <li key={i}>{tecnologia}</li>)}
                            </ul>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
