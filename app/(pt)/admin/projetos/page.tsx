"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { ImagemProjeto, Linha, Projeto } from "@/lib/painel";
import { Aviso, CampoBilingue, useAcao } from "@/componentes/painel/Campos";
import { EditorColecao, type DefCampo } from "@/componentes/painel/EditorColecao";
import { EnviarImagem, Previa } from "@/componentes/painel/Imagens";
import { usePainel } from "@/componentes/painel/PainelAdmin";

const CAMPOS: DefCampo[] = [
    { nome: "titulo", rotulo: "Título", bilingue: true },
    { nome: "descricao", rotulo: "Descrição", tipo: "area", bilingue: true },
    { nome: "url", rotulo: "Link do projeto (botão Ver Trabalho)", tipo: "url", dica: "Vazio: o botão aparece desativado." },
    { nome: "publicado", rotulo: "Mostrar no site", tipo: "bool" }
];

/** Uma imagem do projeto: prévia, texto alternativo PT/EN e as ações. */
function ImagemDoProjeto({ projetoId, imagem, primeira, mover }: { projetoId: number; imagem: ImagemProjeto; primeira: boolean; mover: (d: -1 | 1) => void }) {
    const { dados, recarregar } = usePainel();
    const [alt, setAlt] = useState({ pt: imagem.alt_pt, en: imagem.alt_en });
    const { executando, aviso, executar } = useAcao();

    return (
        <div className="campo" style={{ width: "15rem" }}>
            <Previa id={imagem.imagem_id} info={dados.imagens[imagem.imagem_id]} alt={alt.pt} />
            {primeira && <span className="selo selo-aprovado" style={{ justifySelf: "start" }}>Imagem do card</span>}
            <CampoBilingue rotulo="Descrição da imagem (acessibilidade)" valor={alt} aoMudar={setAlt} />
            <div className="botoes">
                <button type="button" className="botao" disabled={executando}
                        onClick={() => executar(async () => {
                            await api("PUT", `/api/projetos/${projetoId}/imagens/${imagem.imagem_id}`, { alt_pt: alt.pt, alt_en: alt.en });
                            await recarregar();
                        }, "Salvo.")}>Salvar</button>
                <button type="button" className="botao botao-icone-pequeno" aria-label="Antes" onClick={() => mover(-1)}>←</button>
                <button type="button" className="botao botao-icone-pequeno" aria-label="Depois" onClick={() => mover(1)}>→</button>
                <button type="button" className="botao botao-perigo" disabled={executando}
                        onClick={() => confirm("Tirar esta imagem do projeto?") && executar(async () => {
                            await api("DELETE", `/api/projetos/${projetoId}/imagens/${imagem.imagem_id}`);
                            await recarregar();
                        })}>Remover</button>
            </div>
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
        <div className="campo" style={{ marginTop: "var(--espaco-3)" }}>
            <span>Imagens do projeto (a primeira aparece no card da landing)</span>
            <div className="imagens">
                {projeto.imagens.map((imagem, indice) => (
                    <ImagemDoProjeto key={imagem.imagem_id} projetoId={projeto.id} imagem={imagem} primeira={indice === 0}
                                     mover={d => mover(indice, d)} />
                ))}
            </div>
            <EnviarImagem larguras={[360, 560, 740]} rotulo="Adicionar imagem"
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
                               resumo={(item: Linha) => (
                                   <>
                                       {String(item.titulo_pt || item.titulo_en || "Sem título")}
                                       {!item.publicado && <span className="selo"> oculto</span>}
                                       {Boolean(item.exemplo) && <span className="selo selo-pendente"> exemplo</span>}
                                   </>
                               )}
                               extras={item => <ImagensDoProjeto projeto={item as Projeto} />} />
            </section>
        </>
    );
}
