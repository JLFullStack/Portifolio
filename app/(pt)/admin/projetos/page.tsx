"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { ImagemProjeto, Linha, Projeto } from "@/lib/painel";
import { Icone } from "@/componentes/icones/Icone";
import { Aviso, CampoBilingue, useAcao } from "@/componentes/painel/Campos";
import { EditorColecao, type DefCampo } from "@/componentes/painel/EditorColecao";
import { CampoImagem, EnviarImagem } from "@/componentes/painel/Imagens";
import { usePainel } from "@/componentes/painel/PainelAdmin";
import type { ImagemEnviada } from "@/componentes/painel/redimensionar";

const CAMPOS: DefCampo[] = [
    { nome: "titulo", rotulo: "Título", bilingue: true },
    { nome: "descricao", rotulo: "Descrição", tipo: "area", bilingue: true },
    { nome: "situacao", rotulo: "Situação", bilingue: true, dica: "Etiqueta curta acima do título. Ex.: Em produção / In production. Vazio: sem etiqueta." },
    { nome: "stack", rotulo: "Tecnologias", dica: "Separadas por vírgula. Ex.: C#, .NET Core, SQL Server" },
    { nome: "url", rotulo: "Link do projeto (botão Ver Trabalho)", tipo: "url", dica: "Vazio: o botão aparece desativado." },
    { nome: "repositorio", rotulo: "Link do código (botão Ver código)", tipo: "url", dica: "GitHub, GitLab... Vazio: o botão não aparece." },
    { nome: "publicado", rotulo: "Mostrar no site", tipo: "bool" }
];

const LARGURAS_CARD = [360, 560, 740];

/** Uma imagem do projeto: prévia, trocar e ajustar, ordem, texto alternativo PT/EN e remover. */
function ImagemDoProjeto({ projetoId, imagem, posicao, primeira, ultima, mover }: {
    projetoId: number;
    imagem: ImagemProjeto;
    posicao: number;
    primeira: boolean;
    ultima: boolean;
    mover: (d: -1 | 1) => void;
}) {
    const { dados, recarregar } = usePainel();
    const [alt, setAlt] = useState({ pt: imagem.alt_pt, en: imagem.alt_en });
    const { executando, aviso, executar } = useAcao();
    const caminho = `/api/projetos/${projetoId}/imagens/${imagem.imagem_id}`;

    // Trocar e Ajustar põem a imagem nova no lugar desta, com a mesma descrição e posição.
    const substituir = (nova: ImagemEnviada) => executar(async () => {
        if (nova.id === imagem.imagem_id) return;

        const ids = (dados.projetos.find(p => p.id === projetoId)?.imagens ?? [])
            .map(i => i.imagem_id === imagem.imagem_id ? nova.id : i.imagem_id);

        await api("POST", `/api/projetos/${projetoId}/imagens`, { imagem_id: nova.id, alt_pt: alt.pt, alt_en: alt.en });
        await api("DELETE", caminho);
        await api("POST", `/api/projetos/${projetoId}/imagens/ordem`, { ids });
        await recarregar();
    }, "Imagem atualizada.");

    return (
        <li>
            <CampoImagem id={imagem.imagem_id} info={dados.imagens[imagem.imagem_id]} formato="retrato"
                         larguras={LARGURAS_CARD} proporcao={370 / 512} rotuloEnviar="Trocar"
                         selo={<span className={primeira ? "galeria-posicao galeria-capa" : "galeria-posicao"}>{primeira ? "Capa do card" : `${posicao}ª imagem`}</span>}
                         aoEnviar={async nova => { await substituir(nova); }}
                         aoRemover={() => confirm("Tirar esta imagem do projeto?") && executar(async () => {
                             await api("DELETE", caminho);
                             await recarregar();
                         })}>
                <div className="galeria-ordem">
                    <button type="button" className="botao botao-redondo" aria-label="Mover para antes" title="Mover para antes"
                            disabled={primeira} onClick={() => mover(-1)}><Icone nome="fal:arrow-left" /></button>
                    <span>Ordem</span>
                    <button type="button" className="botao botao-redondo" aria-label="Mover para depois" title="Mover para depois"
                            disabled={ultima} onClick={() => mover(1)}><Icone nome="fal:arrow-right" /></button>
                </div>
                <CampoBilingue rotulo="Descrição da imagem (acessibilidade)" valor={alt} aoMudar={setAlt} />
                <div className="botoes">
                    <button type="button" className="botao" disabled={executando}
                            onClick={() => executar(async () => {
                                await api("PUT", caminho, { alt_pt: alt.pt, alt_en: alt.en });
                                await recarregar();
                            }, "Descrição salva.")}><Icone nome="fal:save" /> Salvar descrição</button>
                </div>
                <Aviso aviso={aviso} />
            </CampoImagem>
        </li>
    );
}

/**
 * Imagem de fundo do projeto: paisagem 16:9, ajustada no editor de corte. Na landing
 * ela fica bem apagada atrás da seção inteira enquanto o projeto está ativo.
 */
function FundoDoProjeto({ projeto }: { projeto: Projeto }) {
    const { dados, recarregar } = usePainel();
    const { aviso, executar } = useAcao();
    const fundo = projeto.fundo ? String(projeto.fundo) : null;

    const gravar = (id: string | null, mensagem: string) => executar(async () => {
        await api("PUT", `/api/colecoes/projetos/${projeto.id}`, { fundo: id });
        await recarregar();
    }, mensagem);

    return (
        <div className="bloco-imagens">
            <h3><Icone nome="fal:image" /> Imagem de fundo</h3>
            <CampoImagem dica="Aparece bem apagada atrás da seção, como papel de parede, enquanto o projeto está ativo."
                         id={fundo} info={fundo ? dados.imagens[fundo] : undefined} formato="larga"
                         larguras={[960, 1600]} proporcao={16 / 9} rotuloEnviar={fundo ? "Trocar fundo" : "Escolher fundo"}
                         aoEnviar={async img => { await gravar(img.id, "Fundo salvo. Publique para atualizar o site."); }}
                         aoRemover={() => confirm("Tirar a imagem de fundo deste projeto?") && gravar(null, "Fundo retirado.")} />
            <Aviso aviso={aviso} />
        </div>
    );
}

function ImagensDoProjeto({ projeto }: { projeto: Projeto }) {
    const { recarregar } = usePainel();
    const { aviso, executar } = useAcao();

    const mover = (indice: number, direcao: -1 | 1) => {
        const destino = indice + direcao;
        if (destino < 0 || destino >= projeto.imagens.length) return;

        const ids = projeto.imagens.map(i => i.imagem_id);
        [ids[indice], ids[destino]] = [ids[destino], ids[indice]];
        executar(async () => {
            await api("POST", `/api/projetos/${projeto.id}/imagens/ordem`, { ids });
            await recarregar();
        });
    };

    return (
        <div className="bloco-imagens">
            <h3><Icone nome="fal:camera" /> Imagens do projeto <span className="selo">{projeto.imagens.length}</span></h3>
            <p className="cartao-nota">A primeira é a capa do card na landing. Use as setas para mudar a ordem.</p>
            {projeto.imagens.length > 0 && (
                <ul className="galeria">
                    {projeto.imagens.map((imagem, indice) => (
                        <ImagemDoProjeto key={imagem.imagem_id} projetoId={projeto.id} imagem={imagem} posicao={indice + 1}
                                         primeira={indice === 0} ultima={indice === projeto.imagens.length - 1}
                                         mover={d => mover(indice, d)} />
                    ))}
                </ul>
            )}
            <EnviarImagem larguras={LARGURAS_CARD} proporcao={370 / 512} rotulo="Adicionar imagem"
                          aoEnviar={async img => {
                              await api("POST", `/api/projetos/${projeto.id}/imagens`, { imagem_id: img.id, alt_pt: "", alt_en: "" });
                              await recarregar();
                          }} />
            <Aviso aviso={aviso} />
        </div>
    );
}

export default function PaginaProjetos() {
    const { dados } = usePainel();

    return (
        <>
            <h1 className="painel-titulo">Projetos</h1>
            <p className="painel-subtitulo">
                Os projetos aparecem na landing na ordem abaixo. Imagens em pé (proporção 370 × 512) ficam melhores no card.
            </p>

            <section className="cartao">
                <EditorColecao tabela="projetos" itens={dados.projetos} campos={CAMPOS} rotuloNovo="Novo projeto"
                               resumo={(item: Linha) => String(item.titulo_pt || item.titulo_en || "Sem título")}
                               selos={item => (
                                   <>
                                       {item.publicado
                                           ? <span className="selo selo-aprovado"><Icone nome="fal:eye" /> no site</span>
                                           : <span className="selo"><Icone nome="fal:eye-slash" /> oculto</span>}
                                       <span className="selo"><Icone nome="fal:image" /> {(item as Projeto).imagens.length}</span>
                                       {Boolean(item.exemplo) && <span className="selo selo-pendente">exemplo</span>}
                                   </>
                               )}
                               extras={item => (
                                   <>
                                       <ImagensDoProjeto projeto={item as Projeto} />
                                       <FundoDoProjeto projeto={item as Projeto} />
                                   </>
                               )} />
            </section>
        </>
    );
}
