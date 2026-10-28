"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dataHora, type Depoimento } from "@/lib/painel";
import { Icone } from "@/componentes/icones/Icone";
import { Avatar } from "@/componentes/painel/Avatar";
import { Aviso, Campo, CampoBilingue, Entrada, useAcao } from "@/componentes/painel/Campos";
import { BotoesOrdem } from "@/componentes/painel/EditorColecao";
import { CampoImagem } from "@/componentes/painel/Imagens";
import { usePainel } from "@/componentes/painel/PainelAdmin";

const SITUACAO = {
    pendente: { selo: "selo-pendente", texto: "Aguardando aprovação", icone: "fal:hourglass-half" },
    aprovado: { selo: "selo-aprovado", texto: "Aprovado", icone: "fal:check-circle" },
    recusado: { selo: "selo-recusado", texto: "Recusado", icone: "fal:ban" }
} as const;

/**
 * Um depoimento: o texto original da pessoa e a tradução que você completa, com
 * Salvar, Aprovar (salva e publica esta versão no próximo Publicar), Recusar,
 * Tirar do site e Excluir.
 */
function CartaoDepoimento({ depoimento, ordem }: {
    depoimento: Depoimento;
    ordem?: { mover: (d: -1 | 1) => void; primeiro: boolean; ultimo: boolean };
}) {
    const { dados, recarregar } = usePainel();
    const [nome, setNome] = useState(depoimento.nome);
    const [idioma, setIdioma] = useState(depoimento.idioma_original);
    const [texto, setTexto] = useState({ pt: depoimento.texto_pt, en: depoimento.texto_en });
    const [profissao, setProfissao] = useState({ pt: depoimento.profissao_pt, en: depoimento.profissao_en });
    const [foto, setFoto] = useState(depoimento.foto);
    const [imagens, setImagens] = useState(dados.imagens);
    const { executando, aviso, executar } = useAcao();
    const situacao = SITUACAO[depoimento.situacao];

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
    const profissaoOriginal = profissao[idioma] || profissao[outro];

    return (
        <details id={`depoimento-${depoimento.id}`} className={`item depoimento depoimento-${depoimento.situacao}`}
                 open={depoimento.situacao === "pendente"}>
            <summary>
                <Avatar nome={nome} foto={foto} info={foto ? imagens[foto] : undefined} />
                <span className="item-cabeca">
                    <span className="item-titulo">{depoimento.nome}</span>
                    <span className="item-subtitulo">{profissaoOriginal || depoimento.email_usuario || "Sem profissão"}</span>
                    <span className="item-selos">
                        <span className={`selo ${situacao.selo}`}><Icone nome={situacao.icone} /> {situacao.texto}</span>
                        {depoimento.publicado && <span className="selo selo-aprovado"><Icone nome="fal:eye" /> no site</span>}
                        {Boolean(depoimento.exemplo) && <span className="selo selo-pendente">exemplo</span>}
                    </span>
                </span>
                {ordem && <BotoesOrdem {...ordem} />}
            </summary>

            <div className="item-corpo">
                <ul className="depoimento-historico">
                    <li><Icone nome="fal:paper-plane" /> Enviado em {dataHora(depoimento.enviado_em)}</li>
                    {depoimento.aprovado_em && <li><Icone nome="fal:check" /> Última aprovação em {dataHora(depoimento.aprovado_em)}</li>}
                    {depoimento.email_usuario && <li><Icone nome="fal:envelope" /> {depoimento.email_usuario}</li>}
                </ul>
                {depoimento.publicado && depoimento.situacao !== "aprovado" && (
                    <p className="aviso aviso-info"><Icone nome="fal:info-circle" /><span>A versão aprovada antes continua no site até você aprovar esta.</span></p>
                )}

                <div className="depoimento-grade">
                    <CampoImagem rotulo="Foto" id={foto} info={foto ? imagens[foto] : undefined} formato="redonda"
                                 larguras={[160, 320]} proporcao={1} rotuloEnviar={foto ? "Trocar" : "Escolher foto"}
                                 aoEnviar={img => { setImagens(i => ({ ...i, [img.id]: img })); setFoto(img.id); }}
                                 aoRemover={() => setFoto(null)} />

                    <div className="campos">
                        <div className="campos-duas">
                            <Campo rotulo="Nome">
                                <Entrada value={nome} maxLength={120} onChange={e => setNome(e.target.value)} />
                            </Campo>
                            <fieldset className="campo">
                                <legend>Idioma em que foi escrito</legend>
                                <div className="segmentado">
                                    <label><input type="radio" checked={idioma === "pt"} onChange={() => setIdioma("pt")} /><span>Português</span></label>
                                    <label><input type="radio" checked={idioma === "en"} onChange={() => setIdioma("en")} /><span>Inglês</span></label>
                                </div>
                            </fieldset>
                        </div>
                        <CampoBilingue rotulo="Profissão" valor={profissao} aoMudar={setProfissao} original={idioma} maximo={120} />
                        <CampoBilingue rotulo="Depoimento" valor={texto} aoMudar={setTexto} original={idioma} area linhas={6} maximo={1500}
                                       dica={semTraducao ? "Sem tradução, a outra versão do site mostra o texto original." : undefined} />
                    </div>
                </div>

                <div className="botoes botoes-depoimento">
                    <span className="botoes-grupo">
                        <button type="button" className="botao botao-perigo" disabled={executando}
                                onClick={() => confirm(`Excluir o depoimento de ${depoimento.nome}?`) &&
                                    acao(() => api("DELETE", `/api/depoimentos/${depoimento.id}`), "Excluído.")}>
                            <Icone nome="fal:trash-alt" /> Excluir
                        </button>
                        {depoimento.situacao === "pendente" && (
                            <button type="button" className="botao" disabled={executando}
                                    onClick={() => acao(() => api("POST", `/api/depoimentos/${depoimento.id}/recusar`), "Recusado.")}>
                                <Icone nome="fal:ban" /> Recusar
                            </button>
                        )}
                        {depoimento.publicado && (
                            <button type="button" className="botao" disabled={executando}
                                    onClick={() => acao(() => api("POST", `/api/depoimentos/${depoimento.id}/ocultar`), "Tirado do site. Publique para valer.")}>
                                <Icone nome="fal:eye-slash" /> Tirar do site
                            </button>
                        )}
                    </span>
                    <span className="botoes-grupo">
                        <button type="button" className="botao" disabled={executando} onClick={salvar}>
                            <Icone nome="fal:save" /> Salvar sem aprovar
                        </button>
                        <button type="button" className="botao botao-primario" disabled={executando} onClick={aprovar}>
                            <Icone nome="fal:check" /> Aprovar
                        </button>
                    </span>
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
    const pendentes = dados.depoimentos.filter(d => d.situacao === "pendente").length;

    // Vindo da visão geral (#depoimento-<id>): abre e mostra o depoimento escolhido.
    useEffect(() => {
        const alvo = location.hash ? document.getElementById(location.hash.slice(1)) : null;
        if (alvo instanceof HTMLDetailsElement) {
            alvo.open = true;
            alvo.scrollIntoView({ block: "start" });
        }
    }, []);

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

            <div className="resumo-linha">
                <span className="selo selo-pendente"><Icone nome="fal:hourglass-half" /> {pendentes} aguardando</span>
                <span className="selo selo-aprovado"><Icone nome="fal:eye" /> {noSite.length} no site</span>
                <span className="selo"><Icone nome="fal:comments" /> {dados.depoimentos.length} no total</span>
            </div>

            <Aviso aviso={aviso} />
            {dados.depoimentos.length === 0 ? (
                <div className="cartao vazio">
                    <span className="vazio-icone"><Icone nome="fal:comments" /></span>
                    <p>Nenhum depoimento ainda.</p>
                    <a className="botao botao-primario" href="/admin/pessoas"><Icone nome="fal:users" /> Convidar alguém</a>
                </div>
            ) : (
                <div className="itens depoimentos">
                    {dados.depoimentos.map(d => {
                        const indice = noSite.indexOf(d);

                        return (
                            <CartaoDepoimento key={`${d.id}-${d.situacao}-${d.enviado_em}`} depoimento={d}
                                              ordem={indice < 0 ? undefined : {
                                                  mover: direcao => mover(d, direcao),
                                                  primeiro: indice === 0,
                                                  ultimo: indice === noSite.length - 1
                                              }} />
                        );
                    })}
                </div>
            )}
        </>
    );
}
