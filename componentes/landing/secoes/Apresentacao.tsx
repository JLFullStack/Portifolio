import type { CSSProperties } from "react";
import { src, srcset, texto } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";
import type { PropsSecao } from "@/componentes/landing/Landing";

/**
 * Seção 2: Hero. À esquerda o selo de disponível (quando ligado no painel), a saudação,
 * o nome, o cargo, a apresentação e os botões; à direita o retrato grande, ocupando a
 * altura da primeira dobra e se dissolvendo no fundo. Atrás dele, a aurora e a grade de
 * pontos. Embaixo, a faixa contínua com todas as tecnologias.
 *
 * O painel define o tamanho da foto, o esmaecimento de cada lado, a luz do lado direito e
 * a opacidade em cada tema (variáveis de CSS). A luz é uma segunda cópia da mesma imagem,
 * clareada ou escurecida e visível só à direita: mesmo arquivo, sem novo download, e
 * escondida (sem custo de pintura) enquanto o ajuste estiver em zero.
 *
 * Tudo o que se mexe aqui é CSS (transform e opacity): nada de JavaScript nem
 * de reflow, e a foto (o LCP) nunca começa invisível.
 */
export function Apresentacao({ conteudo, idioma, d }: PropsSecao) {
    const { perfil, habilidades } = conteudo;
    const tecnologias = habilidades.flatMap(grupo => grupo.itens.map(item => texto(item, idioma)));
    // Sem currículo (link nem PDF) no painel, o Download CV não aparece.
    const curriculo = texto(perfil.curriculo, idioma);
    const aparenciaFoto = {
        "--tamanho-foto": perfil.heroTamanho / 100,
        "--esmaecer-foto": perfil.heroEsmaecer / 100,
        "--esmaecer-direita-foto": perfil.heroEsmaecerDireita / 100,
        "--luz-direita-foto": perfil.heroLuzDireita / 100,
        "--opacidade-foto-escuro": perfil.heroOpacidade.escuro / 100,
        "--opacidade-foto-claro": perfil.heroOpacidade.claro / 100
    } as CSSProperties;

    return (
        <section id="apresentacao" className="secao secao--abertura hero" style={aparenciaFoto} aria-label={d.secaoApresentacao}>
            <div className="hero-aurora" aria-hidden="true" />

            <div className="hero-palco">
                {/* Primeira dobra e maior elemento do carregamento (LCP): sem lazy e com
                    prioridade alta. sizes segue o CSS, no maior tamanho: a largura da janela até
                    991px, depois 4/5 da altura da dobra. A moldura sai só do CSS: qualquer foto
                    do painel ocupa o mesmo espaço, sem CLS. */}
                <div className="hero-foto">
                    <div className="hero-foto-imagens">
                        <img src={src(perfil.fotoHero)}
                             srcSet={srcset(perfil.fotoHero)}
                             sizes="(max-width: 991px) 100vw, 78vh"
                             width={perfil.fotoHero.largura} height={perfil.fotoHero.altura}
                             alt={d.fotoHeroAlt}
                             fetchPriority="high" decoding="async" />
                        <img className="hero-foto-luz" src={src(perfil.fotoHero)}
                             srcSet={srcset(perfil.fotoHero)}
                             sizes="(max-width: 991px) 100vw, 78vh"
                             width={perfil.fotoHero.largura} height={perfil.fotoHero.altura}
                             alt="" hidden={perfil.heroLuzDireita === 0} decoding="async" />
                    </div>
                </div>

                <div className="conteudo hero-texto">
                    {perfil.disponivel && (
                        <p className="selo-disponivel entrada" style={{ "--atraso": 0 } as CSSProperties}>{d.heroDisponivel}</p>
                    )}
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
                        {curriculo && (
                            <a className="btn-acento" href={curriculo} target="_blank" rel="noopener noreferrer">
                                <Icone nome="fal:download" />
                                {d.baixarCv}
                            </a>
                        )}
                        <a className="btn-contorno" href="#contato">
                            {d.heroContato}
                            <Icone nome="fal:arrow-right" />
                        </a>
                    </div>
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
