import { DICIONARIOS } from "@/dicionarios";
import { lerConteudo, type Conteudo, type Idioma } from "@/lib/conteudo";
import type { Dicionario } from "@/dicionarios";
import type { NomeIcone } from "@/componentes/icones/dados";
import { Apresentacao } from "./Apresentacao";
import { Biografia } from "./Biografia";
import { BotaoTopo } from "./BotaoTopo";
import { Cabecalho, type SecaoNavegacao } from "./Cabecalho";
import { Certificacoes } from "./Certificacoes";
import { ChamadaFinal } from "./ChamadaFinal";
import { Depoimentos } from "./Depoimentos";
import { Educacao } from "./Educacao";
import { Experiencia } from "./Experiencia";
import { Github } from "./Github";
import { Habilidades } from "./Habilidades";
import { Projetos } from "./Projetos";
import { Rodape } from "./Rodape";
import { Servicos } from "./Servicos";
import { Icone } from "@/componentes/icones/Icone";
import { LuzCartoes } from "./LuzCartoes";
import { RevelarAoRolar } from "./RevelarAoRolar";

/** O que toda seção recebe: o conteúdo, o idioma da página e os textos fixos dele. */
export type PropsSecao = { conteudo: Conteudo; idioma: Idioma; d: Dicionario };

/**
 * A landing page de página única, na ordem do mockup.
 * Componente de servidor: vira HTML no build. Só os pedaços interativos (menus, tema,
 * carrosséis, voltar ao topo, brilho dos cards, revelar ao rolar, formulário de
 * contato) são componentes de cliente. As animações em si são CSS (estilos/animacao.css).
 *
 * Seções sem conteúdo (nenhum projeto, depoimento ou serviço publicado, GitHub fora
 * do ar no build) não aparecem, nem no menu.
 */
export function Landing({ idioma }: { idioma: Idioma }) {
    const conteudo = lerConteudo();
    const d = DICIONARIOS[idioma];
    const props: PropsSecao = { conteudo, idioma, d };

    const secao = (ancora: keyof Dicionario["nav"], icone: NomeIcone, mostrar = true): SecaoNavegacao[] =>
        mostrar ? [{ ancora, rotulo: d.nav[ancora], icone: <Icone nome={icone} /> }] : [];

    const secoes: SecaoNavegacao[] = [
        ...secao("apresentacao", "fal:home"),
        ...secao("servicos", "fal:rocket", conteudo.servicos.length > 0),
        ...secao("biografia", "fal:user"),
        ...secao("projetos", "fal:folder-open", conteudo.projetos.length > 0),
        ...secao("github", "fab:github", Boolean(conteudo.github)),
        ...secao("depoimentos", "fal:comments", conteudo.depoimentos.length > 0),
        ...secao("habilidades", "fal:laptop-code", conteudo.habilidades.length > 0),
        ...secao("certificacoes", "fal:file-certificate", conteudo.certificacoes.length > 0),
        ...secao("educacao", "fal:graduation-cap", conteudo.formacoes.length > 0),
        ...secao("experiencia", "fal:briefcase", conteudo.experiencias.length > 0),
        ...secao("contato", "fal:paper-plane")
    ];

    return (
        <>
            <a className="pular-conteudo" href="#conteudo-principal">{d.pularConteudo}</a>

            <Cabecalho conteudo={conteudo} idioma={idioma} d={d} secoes={secoes} />

            <main id="conteudo-principal">
                <Apresentacao {...props} />
                {conteudo.servicos.length > 0 && <Servicos {...props} />}
                <Biografia {...props} />
                {conteudo.projetos.length > 0 && <Projetos {...props} />}
                {conteudo.github && <Github {...props} />}
                {conteudo.depoimentos.length > 0 && <Depoimentos {...props} />}
                {conteudo.habilidades.length > 0 && <Habilidades {...props} />}
                {conteudo.certificacoes.length > 0 && <Certificacoes {...props} />}
                {conteudo.formacoes.length > 0 && <Educacao {...props} />}
                {conteudo.experiencias.length > 0 && <Experiencia {...props} />}
                <ChamadaFinal {...props} />
            </main>

            <Rodape {...props} />

            <LuzCartoes />
            <RevelarAoRolar />

            <BotaoTopo rotulo={d.voltarAoTopo}>
                <Icone nome="fal:arrow-up" />
            </BotaoTopo>
        </>
    );
}
