import type { Dicionario } from "@/dicionarios";
import { LOCALE, ROTA } from "@/dicionarios";
import type { Idioma } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";
import { BotaoTema } from "./BotaoTema";
import { CabecalhoFixo } from "./CabecalhoFixo";
import { MenuNavegacao } from "./MenuNavegacao";

export type SecaoNavegacao = { ancora: string; rotulo: string };

/**
 * Cabeçalho fixo. Mockup: minimalista; no canto direito só o tema e o PT | EN.
 * A navegação por âncora fica no menu lateral, aberto pelo botão da esquerda.
 *
 * O PT | EN são links comuns entre / e /en: cada idioma é uma página estática.
 */
export function Cabecalho({ idioma, d, secoes }: { idioma: Idioma; d: Dicionario; secoes: SecaoNavegacao[] }) {
    const idiomas: { idioma: Idioma; sigla: string; nome: string }[] = [
        { idioma: "pt", sigla: "PT", nome: d.idiomaPortugues },
        { idioma: "en", sigla: "EN", nome: d.idiomaIngles }
    ];

    return (
        <CabecalhoFixo>
            <div className="conteudo">
                <MenuNavegacao
                    secoes={secoes}
                    rotulos={{ abrir: d.abrirMenu, fechar: d.fecharMenu, titulo: d.navegar, navegacao: d.navegacaoSecoes }}
                    iconeAbrir={<Icone nome="fal:bars" />}
                    iconeFechar={<Icone nome="fal:times" />} />

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
                </div>
            </div>
        </CabecalhoFixo>
    );
}
