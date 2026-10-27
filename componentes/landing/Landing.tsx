import { DICIONARIOS } from "@/dicionarios";
import { lerConteudo, type Conteudo, type Idioma } from "@/lib/conteudo";
import type { Dicionario } from "@/dicionarios";
import { Apresentacao } from "./Apresentacao";
import { Biografia } from "./Biografia";
import { BotaoTopo } from "./BotaoTopo";
import { Cabecalho, type SecaoNavegacao } from "./Cabecalho";
import { Certificacoes } from "./Certificacoes";
import { ChamadaFinal } from "./ChamadaFinal";
import { Depoimentos } from "./Depoimentos";
import { Educacao } from "./Educacao";
import { Experiencia } from "./Experiencia";
import { Habilidades } from "./Habilidades";
import { Projetos } from "./Projetos";
import { Rodape } from "./Rodape";
import { Icone } from "@/componentes/icones/Icone";
import { LuzCartoes } from "./LuzCartoes";

/** O que toda seção recebe: o conteúdo, o idioma da página e os textos fixos dele. */
export type PropsSecao = { conteudo: Conteudo; idioma: Idioma; d: Dicionario };

/**
 * A landing page de página única, na ordem do mockup.
 * Componente de servidor: vira HTML no build. Só os pedaços interativos (menu, tema,
 * carrosséis, voltar ao topo, brilho dos cards) são componentes de cliente. As
 * animações de entrada e de rolagem são só CSS (estilos/animacao.css).
 *
 * Seções sem conteúdo (nenhum projeto ou depoimento publicado) não aparecem, nem no menu.
 */
export function Landing({ idioma }: { idioma: Idioma }) {
    const conteudo = lerConteudo();
    const d = DICIONARIOS[idioma];
    const props: PropsSecao = { conteudo, idioma, d };

    const secoes: SecaoNavegacao[] = [
        { ancora: "apresentacao", rotulo: d.nav.apresentacao },
        { ancora: "biografia", rotulo: d.nav.biografia },
        ...(conteudo.projetos.length ? [{ ancora: "projetos", rotulo: d.nav.projetos }] : []),
        ...(conteudo.depoimentos.length ? [{ ancora: "depoimentos", rotulo: d.nav.depoimentos }] : []),
        ...(conteudo.habilidades.length ? [{ ancora: "habilidades", rotulo: d.nav.habilidades }] : []),
        ...(conteudo.certificacoes.length ? [{ ancora: "certificacoes", rotulo: d.nav.certificacoes }] : []),
        ...(conteudo.formacoes.length ? [{ ancora: "educacao", rotulo: d.nav.educacao }] : []),
        ...(conteudo.experiencias.length ? [{ ancora: "experiencia", rotulo: d.nav.experiencia }] : []),
        { ancora: "contato", rotulo: d.nav.contato }
    ];

    return (
        <>
            <a className="pular-conteudo" href="#conteudo-principal">{d.pularConteudo}</a>

            <Cabecalho idioma={idioma} d={d} secoes={secoes} />

            <main id="conteudo-principal">
                <Apresentacao {...props} />
                <Biografia {...props} />
                {conteudo.projetos.length > 0 && <Projetos {...props} />}
                {conteudo.depoimentos.length > 0 && <Depoimentos {...props} />}
                {conteudo.habilidades.length > 0 && <Habilidades {...props} />}
                {conteudo.certificacoes.length > 0 && <Certificacoes {...props} />}
                {conteudo.formacoes.length > 0 && <Educacao {...props} />}
                {conteudo.experiencias.length > 0 && <Experiencia {...props} />}
                <ChamadaFinal {...props} />
            </main>

            <Rodape {...props} />

            <LuzCartoes />

            <BotaoTopo rotulo={d.voltarAoTopo}>
                <Icone nome="fas:arrow-up" />
            </BotaoTopo>
        </>
    );
}
