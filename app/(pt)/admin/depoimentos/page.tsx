"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { dataHora, type Depoimento } from "@/lib/painel";
import { Aviso, Campo, CampoBilingue, Entrada, useAcao } from "@/componentes/painel/Campos";
import { EnviarImagem, Previa } from "@/componentes/painel/Imagens";
import { usePainel } from "@/componentes/painel/PainelAdmin";

const SITUACAO = {
    pendente: { selo: "selo-pendente", texto: "Aguardando aprovação" },
    aprovado: { selo: "selo-aprovado", texto: "Aprovado" },
    recusado: { selo: "selo-recusado", texto: "Recusado" }
} as const;

/**
 * Um depoimento: o texto original da pessoa e a tradução que você completa, com
 * Salvar, Aprovar (salva e publica esta versão no próximo Publicar), Recusar,
 * Tirar do site e Excluir.
 */
function CartaoDepoimento({ depoimento, mover }: { depoimento: Depoimento; mover: (d: -1 | 1) => void }) {
    const { dados, recarregar } = usePainel();
    const [nome, setNome] = useState(depoimento.nome);
    const [idioma, setIdioma] = useState(depoimento.idioma_original);
    const [texto, setTexto] = useState({ pt: depoimento.texto_pt, en: depoimento.texto_en });
    const [profissao, setProfissao] = useState({ pt: depoimento.profissao_pt, en: depoimento.profissao_en });
    const [foto, setFoto] = useState(depoimento.foto);
    const [imagens, setImagens] = useState(dados.imagens);
    const { executando, aviso, executar } = useAcao();

    const corpo = () => ({
        nome, idioma_original: idioma, foto,
        texto_pt: texto.pt, texto_en: texto.en, profissao_pt: profissao.pt, profissao_en: profissao.en
    });

    const acao = (passos: () => Promise<unknown>, sucesso: string) => executar(async () => {
        await passos();
        await recarregar();
    }, sucesso);

    const salvar = () => acao(() => api("PUT", `/api/depoimentos/${depoimento.id}`, corpo()), "Salvo.");
    const aprovar = () => acao(async () => {
        await api("PUT", `/api/depoimentos/${depoimento.id}`, corpo());
        await api("POST", `/api/depoimentos/${depoimento.id}/aprovar`);
    }, "Aprovado. Publique para atualizar o site.");
    const outro = idioma === "pt" ? "en" : "pt";
    const semTraducao = !texto[outro] || !profissao[outro];

    return (
        <details className="item" open={depoimento.situacao === "pendente"}>
            <summary>
                <span className="item-titulo">
                    {depoimento.nome}
                    {depoimento.email_usuario && <small style={{ color: "var(--cor-texto-tenue)" }}> · {depoimento.email_usuario}</small>}
                </span>
                {Boolean(depoimento.exemplo) && <span className="selo selo-pendente">exemplo</span>}
                {depoimento.publicado && <span className="selo selo-aprovado">no site</span>}
                <span className={`selo ${SITUACAO[depoimento.situacao].selo}`}>{SITUACAO[depoimento.situacao].texto}</span>
                {depoimento.publicado && (
                    <>
                        <button type="button" className="botao botao-icone-pequeno" aria-label="Subir" onClick={e => { e.preventDefault(); mover(-1); }}>↑</button>
                        <button type="button" className="botao botao-icone-pequeno" aria-label="Descer" onClick={e => { e.preventDefault(); mover(1); }}>↓</button>
                    </>
                )}
            </summary>

            <div className="item-corpo">
                <p className="cartao-nota">
                    Enviado em {dataHora(depoimento.enviado_em)}
                    {depoimento.aprovado_em && ` · última aprovação em ${dataHora(depoimento.aprovado_em)}`}
                    {depoimento.publicado && depoimento.situacao !== "aprovado" && " · a versão aprovada antes continua no site até você aprovar esta."}
                </p>

                <div className="imagens" style={{ alignItems: "flex-start" }}>
                    <div className="campo">
                        <Previa id={foto} info={foto ? imagens[foto] : undefined} redonda alt={nome} />
                        <EnviarImagem larguras={[160, 320]} proporcao={1} redonda rotulo="Trocar foto"
                                      aoEnviar={img => { setImagens(i => ({ ...i, [img.id]: img })); setFoto(img.id); }} />
                        {foto && <button type="button" className="botao botao-perigo" onClick={() => setFoto(null)}>Remover foto</button>}
                    </div>

                    <div className="campos" style={{ flex: "1 1 18rem", minWidth: 0 }}>
                        <div className="campos-duas">
                            <Campo rotulo="Nome">
                                <Entrada value={nome} maxLength={120} onChange={e => setNome(e.target.value)} />
                            </Campo>
                            <fieldset className="campo">
                                <legend>Idioma em que foi escrito</legend>
                                <div className="opcoes">
                                    <label><input type="radio" checked={idioma === "pt"} onChange={() => setIdioma("pt")} /> Português</label>
                                    <label><input type="radio" checked={idioma === "en"} onChange={() => setIdioma("en")} /> Inglês</label>
                                </div>
                            </fieldset>
                        </div>
                        <CampoBilingue rotulo="Profissão" valor={profissao} aoMudar={setProfissao} original={idioma} maximo={120} />
                        <CampoBilingue rotulo="Depoimento" valor={texto} aoMudar={setTexto} original={idioma} area linhas={6} maximo={1500}
                                       dica={semTraducao ? "Sem tradução, a outra versão do site mostra o texto original." : undefined} />
                    </div>
                </div>

                <div className="botoes">
                    <button type="button" className="botao botao-primario" disabled={executando} onClick={aprovar}>Aprovar</button>
                    <button type="button" className="botao" disabled={executando} onClick={salvar}>Salvar sem aprovar</button>
                    {depoimento.situacao === "pendente" && (
                        <button type="button" className="botao" disabled={executando}
                                onClick={() => acao(() => api("POST", `/api/depoimentos/${depoimento.id}/recusar`), "Recusado.")}>Recusar</button>
                    )}
                    {depoimento.publicado && (
                        <button type="button" className="botao" disabled={executando}
                                onClick={() => acao(() => api("POST", `/api/depoimentos/${depoimento.id}/ocultar`), "Tirado do site. Publique para valer.")}>
                            Tirar do site
                        </button>
                    )}
                    <button type="button" className="botao botao-perigo" disabled={executando}
                            onClick={() => confirm(`Excluir o depoimento de ${depoimento.nome}?`) &&
                                acao(() => api("DELETE", `/api/depoimentos/${depoimento.id}`), "Excluído.")}>Excluir</button>
                </div>
                <Aviso aviso={aviso} />
            </div>
        </details>
    );
}

export default function PaginaDepoimentos() {
    const { dados, recarregar } = usePainel();
    const { aviso, executar } = useAcao();
    const noSite = dados.depoimentos.filter(d => d.publicado);

    // A ordem só importa entre os que estão no site.
    const mover = (depoimento: Depoimento, direcao: -1 | 1) => {
        const indice = noSite.indexOf(depoimento);
        const destino = indice + direcao;
        if (destino < 0 || destino >= noSite.length) return;

        const ids = noSite.map(d => d.id);
        [ids[indice], ids[destino]] = [ids[destino], ids[indice]];
        executar(async () => {
            await api("POST", "/api/depoimentos/ordem", { ids });
            await recarregar();
        });
    };

    return (
        <>
            <h1 className="painel-titulo">Depoimentos</h1>
            <p className="painel-subtitulo">
                Quem você convidou (em Pessoas) escreve o depoimento no próprio idioma. Complete a tradução, aprove e publique.
            </p>

            <Aviso aviso={aviso} />
            {dados.depoimentos.length === 0 ? (
                <p className="cartao">Nenhum depoimento ainda. Convide alguém em Pessoas.</p>
            ) : (
                <div className="itens">
                    {dados.depoimentos.map(d => (
                        <CartaoDepoimento key={`${d.id}-${d.situacao}-${d.enviado_em}`} depoimento={d} mover={direcao => mover(d, direcao)} />
                    ))}
                </div>
            )}
        </>
    );
}
