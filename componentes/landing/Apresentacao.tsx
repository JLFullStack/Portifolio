import { src, srcset, texto } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";
import type { PropsSecao } from "./Landing";

/**
 * Seção 2 do mockup: Hero. À esquerda a saudação, o nome, o cargo, a apresentação
 * e o Download CV; à direita a foto. Ao fundo, três curvas finas em SVG inline
 * (escalam sem perder nitidez e herdam a cor do tema).
 */
export function Apresentacao({ conteudo, idioma, d }: PropsSecao) {
    const { perfil } = conteudo;

    return (
        <section id="apresentacao" className="secao secao--abertura hero" aria-label={d.secaoApresentacao}>
            <svg className="hero-curvas" viewBox="0 0 1898 1000" preserveAspectRatio="xMaxYMid slice"
                 aria-hidden="true" focusable="false">
                <g fill="none" stroke="var(--cor-acento-solido)" strokeWidth="2">
                    <path d="M814 0 C 828 70, 872 106, 952 162 C 1062 238, 1152 302, 1192 402 C 1226 492, 1200 562, 1232 642 C 1282 762, 1452 852, 1898 942" />
                    <path d="M870 0 C 884 70, 928 106, 1008 162 C 1118 238, 1202 306, 1230 406 C 1258 496, 1236 572, 1270 652 C 1322 772, 1502 862, 1898 892" />
                    <path d="M926 0 C 940 70, 984 106, 1064 162 C 1174 238, 1248 312, 1266 412 C 1288 502, 1270 580, 1302 662 C 1358 782, 1562 872, 1898 988" />
                </g>
            </svg>

            <div className="conteudo hero-grade">
                <div className="hero-texto">
                    <p className="hero-saudacao">{texto(perfil.saudacao, idioma)}</p>
                    <h1 className="hero-nome">{perfil.nomeCurto}</h1>
                    <p className="hero-profissao">{texto(perfil.profissao, idioma)}</p>
                    <p className="hero-descricao">{texto(perfil.descricaoHero, idioma)}</p>
                    <a className="btn-acento" href={perfil.curriculo} target="_blank" rel="noopener noreferrer">
                        <Icone nome="fal:download" />
                        {d.baixarCv}
                    </a>
                </div>

                {/* Primeira dobra e maior elemento do carregamento (LCP): sem lazy e com
                    prioridade alta. sizes segue o CSS: até 26rem no desktop, 16rem no celular. */}
                <div className="hero-foto">
                    <img src={src(perfil.fotoHero)}
                         srcSet={srcset(perfil.fotoHero)}
                         sizes="(max-width: 767px) 16rem, 26rem"
                         width={perfil.fotoHero.largura} height={perfil.fotoHero.altura}
                         alt={d.fotoHeroAlt}
                         fetchPriority="high" decoding="async" />
                </div>
            </div>
        </section>
    );
}
