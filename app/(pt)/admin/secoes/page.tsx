"use client";

import type { Grupo, Linha } from "@/lib/painel";
import { Icone } from "@/componentes/icones/Icone";
import { EditorColecao, type DefCampo } from "@/componentes/painel/EditorColecao";
import { usePainel } from "@/componentes/painel/PainelAdmin";

const titulo = (item: Linha, ...campos: string[]) => String(campos.map(c => item[c]).find(Boolean) ?? "Sem título");

const REDES: DefCampo[] = [
    { nome: "nome", rotulo: "Nome da rede" },
    { nome: "url", rotulo: "Endereço", tipo: "url", dica: "https://..., mailto:, tel: ou skype:" },
    { nome: "icone", rotulo: "Ícone", tipo: "icone" }
];

const SERVICO: DefCampo[] = [
    { nome: "icone", rotulo: "Ícone", tipo: "icone-servico" },
    { nome: "titulo", rotulo: "Título", bilingue: true },
    { nome: "descricao", rotulo: "Descrição", tipo: "area", bilingue: true, dica: "Uma ou duas frases sobre o que você entrega." }
];

const GRUPO: DefCampo[] = [{ nome: "titulo", rotulo: "Título do card", bilingue: true }];

const HABILIDADE: DefCampo[] = [
    { nome: "nome_pt", rotulo: "Habilidade" },
    { nome: "nome_en", rotulo: "Em inglês (só se for diferente)", dica: "Vazio: usa o mesmo nome. Ex.: API Rest → Rest API" }
];

const CERTIFICACAO: DefCampo[] = [
    { nome: "sigla", rotulo: "Sigla" },
    { nome: "descricao", rotulo: "Descrição", bilingue: true }
];

const FORMACAO: DefCampo[] = [
    { nome: "periodo", rotulo: "Período", bilingue: true, dica: "Ex.: Dezembro de 2014 / December 2014" },
    { nome: "titulo", rotulo: "Curso", bilingue: true },
    { nome: "instituicao", rotulo: "Instituição", bilingue: true }
];

const EXPERIENCIA: DefCampo[] = [
    { nome: "periodo", rotulo: "Período", bilingue: true },
    { nome: "cargo", rotulo: "Cargo", bilingue: true },
    { nome: "empresa", rotulo: "Empresa", bilingue: true },
    { nome: "endereco", rotulo: "Endereço", bilingue: true },
    { nome: "descricao", rotulo: "Descrição", tipo: "area", bilingue: true },
    { nome: "stack", rotulo: "Tecnologias", dica: "Separadas por vírgula. Aparecem em etiquetas no card." }
];

/** As seções em lista da landing. Seção sem nenhum item some da landing e do menu. */
export default function PaginaSecoes() {
    const { dados } = usePainel();

    return (
        <>
            <h1 className="painel-titulo">Seções</h1>
            <p className="painel-subtitulo">Itens de cada seção, na ordem em que aparecem na landing. Use as setas para reordenar.</p>

            <section className="cartao">
                <h2><Icone nome="fal:at" /> Redes sociais</h2>
                <p className="cartao-nota">Aparecem em volta da foto da biografia e no rodapé.</p>
                <EditorColecao tabela="redes_sociais" itens={dados.redes} campos={REDES} rotuloNovo="Nova rede"
                               resumo={item => titulo(item, "nome")} />
            </section>

            <section className="cartao">
                <h2><Icone nome="fal:rocket" /> O que eu faço (serviços)</h2>
                <p className="cartao-nota">Cards logo depois do topo. Os títulos também viram os assuntos do formulário de contato.</p>
                <EditorColecao tabela="servicos" itens={dados.servicos} campos={SERVICO} rotuloNovo="Novo serviço"
                               resumo={item => titulo(item, "titulo_pt", "titulo_en")}
                               selos={item => Boolean(item.exemplo) && <span className="selo selo-pendente">exemplo</span>} />
            </section>

            <section className="cartao">
                <h2><Icone nome="fal:code" /> Habilidades profissionais</h2>
                <p className="cartao-nota">Cada grupo é um card. Abra o grupo para editar as habilidades dele.</p>
                <EditorColecao tabela="grupos_habilidades" itens={dados.grupos} campos={GRUPO} rotuloNovo="Novo grupo"
                               resumo={item => titulo(item, "titulo_pt", "titulo_en")}
                               selos={item => <span className="selo">{(item as Grupo).itens.length} habilidades</span>}
                               extras={item => (
                                   <div className="subcolecao">
                                       <EditorColecao tabela="habilidades" itens={(item as Grupo).itens} campos={HABILIDADE}
                                                      rotuloNovo="Nova habilidade" valoresFixos={{ grupo_id: item.id }}
                                                      resumo={h => titulo(h, "nome_pt")} />
                                   </div>
                               )} />
            </section>

            <section className="cartao">
                <h2><Icone nome="fal:file-certificate" /> Certificações</h2>
                <EditorColecao tabela="certificacoes" itens={dados.certificacoes} campos={CERTIFICACAO} rotuloNovo="Nova certificação"
                               resumo={item => titulo(item, "sigla")} />
            </section>

            <section className="cartao">
                <h2><Icone nome="fal:graduation-cap" /> Educação</h2>
                <EditorColecao tabela="formacoes" itens={dados.formacoes} campos={FORMACAO} rotuloNovo="Nova formação"
                               resumo={item => titulo(item, "titulo_pt", "titulo_en")}
                               selos={item => <span className="selo">{titulo(item, "instituicao_pt", "instituicao_en")}</span>} />
            </section>

            <section className="cartao">
                <h2><Icone nome="fal:briefcase" /> Experiência</h2>
                <EditorColecao tabela="experiencias" itens={dados.experiencias} campos={EXPERIENCIA} rotuloNovo="Nova experiência"
                               resumo={item => titulo(item, "cargo_pt", "cargo_en")}
                               selos={item => <span className="selo">{titulo(item, "periodo_pt", "periodo_en")}</span>} />
            </section>
        </>
    );
}
