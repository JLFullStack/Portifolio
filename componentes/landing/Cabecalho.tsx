import type { ReactNode } from "react";
import type { Dicionario } from "@/dicionarios";
import { LOCALE, ROTA } from "@/dicionarios";
import { texto, type Conteudo, type Idioma } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";
import { BotaoTema } from "./BotaoTema";
import { CabecalhoFixo } from "./CabecalhoFixo";
import { LinkSocial } from "./Comuns";
import { MenuNavegacao } from "./MenuNavegacao";
import { NavegacaoTopo } from "./NavegacaoTopo";

export type SecaoNavegacao = { ancora: string; rotulo: string; icone: ReactNode };

/** Seções que também aparecem no cabeçalho do desktop; o menu lateral tem todas. */
const PRINCIPAIS = ["apresentacao", "servicos", "biografia", "projetos", "habilidades", "experiencia"];

/** Monograma com as iniciais do nome (Lucas Araújo → LA), em gradiente. */
function Monograma({ nome }: { nome: string }) {
    const iniciais = nome.split(/\s+/).filter(Boolean).map(parte => parte[0]).slice(0, 2).join("").toUpperCase();

    return <span className="monograma" aria-hidden="true">{iniciais}</span>;
}

/**
 * Cabeçalho fixo: à esquerda o menu lateral e o monograma (volta ao topo); no meio,
 * no desktop, as seções principais com a pílula da seção atual; à direita o tema, o
 * PT | EN e o "Vamos conversar".
 *
 * O PT | EN são links comuns entre / e /en: cada idioma é uma página estática.
 */
export function Cabecalho({ conteudo, idioma, d, secoes }: { conteudo: Conteudo; idioma: Idioma; d: Dicionario; secoes: SecaoNavegacao[] }) {
    const { perfil, redes } = conteudo;
    const idiomas: { idioma: Idioma; sigla: string; nome: string }[] = [
        { idioma: "pt", sigla: "PT", nome: d.idiomaPortugues },
        { idioma: "en", sigla: "EN", nome: d.idiomaIngles }
    ];

    const rodapeMenu = (
        <>
            {perfil.disponivel && <p className="selo-disponivel">{d.heroDisponivel}</p>}
            <div className="menu-acoes">
                <a className="btn-acento" href="#contato">
                    {d.heroContato}
                    <Icone nome="fal:arrow-right" />
                </a>
                <a className="btn-contorno" href={texto(perfil.curriculo, idioma)} target="_blank" rel="noopener noreferrer">
                    <Icone nome="fal:download" />
                    {d.baixarCv}
                </a>
            </div>
            <p className="menu-rotulo-redes">{d.menuRedes}</p>
            <ul className="menu-redes">
                {redes.map(rede => <li key={rede.nome}><LinkSocial rede={rede} /></li>)}
            </ul>
        </>
    );

    return (
        <CabecalhoFixo>
            <div className="conteudo">
                <div className="cabecalho-inicio">
                    <MenuNavegacao
                        secoes={secoes}
                        rotulos={{ abrir: d.abrirMenu, fechar: d.fecharMenu, titulo: d.navegar, navegacao: d.navegacaoSecoes }}
                        marca={<Monograma nome={perfil.nomeCurto} />}
                        iconeAbrir={<Icone nome="fal:bars" />}
                        iconeFechar={<Icone nome="fal:times" />}
                        iconeSeta={<Icone nome="fal:arrow-right" />}
                        rodape={rodapeMenu} />

                    <a className="cabecalho-marca" href="#apresentacao" aria-label={d.voltarAoInicio} title={d.voltarAoInicio}>
                        <Monograma nome={perfil.nomeCurto} />
                    </a>
                </div>

                <NavegacaoTopo secoes={secoes.filter(secao => PRINCIPAIS.includes(secao.ancora))} rotulo={d.navegacaoSecoes} />

                <div className="cabecalho-controles">
                    <BotaoTema rotuloClaro={d.temaParaClaro} rotuloEscuro={d.temaParaEscuro}>
                        <Icone nome="fas:sun" className="icone-tema icone-ir-claro" />
                        <Icone nome="fas:moon" className="icone-tema icone-ir-escuro" />
                    </BotaoTema>

                    <div className="alternador-idioma" role="group" aria-label={d.idiomaDoSite}>
                        {idiomas.map(item => {
                            const ativo = item.idioma === idioma;

                            return (
                                <a key={item.idioma}
                                   className={ativo ? "botao-idioma ativo" : "botao-idioma"}
                                   href={ROTA[item.idioma]}
                                   hrefLang={LOCALE[item.idioma]}
                                   lang={LOCALE[item.idioma]}
                                   title={item.nome}
                                   aria-current={ativo ? "true" : undefined}>{item.sigla}</a>
                            );
                        })}
                    </div>

                    <a className="btn-acento btn-pequeno cabecalho-contato" href="#contato">{d.heroContato}</a>
                </div>
            </div>
        </CabecalhoFixo>
    );
}
