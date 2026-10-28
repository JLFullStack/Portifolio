"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { dataHora } from "@/lib/painel";
import type { NomeIcone } from "@/componentes/icones/dados";
import { Icone } from "@/componentes/icones/Icone";
import { Aviso, useAcao } from "@/componentes/painel/Campos";
import { Avatar } from "@/componentes/painel/Avatar";
import { usePainel } from "@/componentes/painel/PainelAdmin";

const SITUACAO = {
    pedida: { selo: "selo-pendente", texto: "Em andamento", icone: "fal:hourglass-half" },
    concluida: { selo: "selo-aprovado", texto: "Publicada", icone: "fal:check-circle" },
    falhou: { selo: "selo-recusado", texto: "Falhou", icone: "fal:exclamation-circle" }
} as const;

/** Visão geral: números do conteúdo, depoimentos à espera, mensagens novas e o botão Publicar. */
export default function VisaoGeral() {
    const { dados, recarregar } = usePainel();
    const { executando, aviso, executar } = useAcao();
    const pendentes = dados.depoimentos.filter(d => d.situacao === "pendente");
    const emAndamento = dados.publicacoes.some(p => p.situacao === "pedida");

    // Enquanto uma publicação roda no GitHub Actions, atualiza a situação a cada 20 s.
    useEffect(() => {
        if (!emAndamento) return;

        const intervalo = setInterval(() => recarregar().catch(() => undefined), 20_000);
        return () => clearInterval(intervalo);
    }, [emAndamento, recarregar]);

    const publicar = () => executar(async () => {
        await api("POST", "/api/publicar");
        await recarregar();
    }, "Publicação iniciada. O site é atualizado em 2 a 4 minutos.");

    const numeros: { href: string; valor: number; rotulo: string; icone: NomeIcone }[] = [
        { href: "/admin/projetos", valor: dados.projetos.filter(p => p.publicado).length, rotulo: "projetos publicados", icone: "fal:folder-open" },
        { href: "/admin/depoimentos", valor: dados.depoimentos.filter(d => d.publicado).length, rotulo: "depoimentos no site", icone: "fal:comments" },
        { href: "/admin/depoimentos", valor: pendentes.length, rotulo: "aguardando aprovação", icone: "fal:hourglass-half" },
        { href: "/admin/mensagens", valor: dados.mensagens.filter(m => !m.lida).length, rotulo: "mensagens novas", icone: "fal:inbox" },
        { href: "/admin/pessoas", valor: dados.usuarios.filter(u => u.papel === "depoente").length, rotulo: "pessoas convidadas", icone: "fal:users" }
    ];

    return (
        <>
            <h1 className="painel-titulo">Visão geral</h1>
            <p className="painel-subtitulo">
                O que você salva aqui fica guardado no banco. O site só muda quando você publica.
            </p>

            <div className="resumo-numeros">
                {numeros.map(n => (
                    <a key={n.rotulo} href={n.href}>
                        <span className="resumo-icone"><Icone nome={n.icone} /></span>
                        <strong>{n.valor}</strong>
                        <span>{n.rotulo}</span>
                    </a>
                ))}
            </div>

            <section className="cartao cartao-publicar">
                <header>
                    <h2><Icone nome="fal:rocket" /> Publicar o site</h2>
                    <button type="button" className="botao botao-primario" disabled={executando || emAndamento} onClick={publicar}>
                        <Icone nome={emAndamento ? "fal:circle-notch" : "fal:rocket"} className={emAndamento ? "girando" : undefined} />
                        {emAndamento ? "Publicando…" : "Publicar alterações"}
                    </button>
                </header>
                <p className="cartao-nota">
                    Gera a landing de novo com o conteúdo atual do banco (perfil, projetos, depoimentos aprovados e seções) e
                    publica no Cloudflare. Leva de 2 a 4 minutos.
                </p>
                <Aviso aviso={aviso} />

                {dados.publicacoes.length > 0 && (
                    <>
                        <h3 className="subtitulo-cartao"><Icone nome="fal:history" /> Últimas publicações</h3>
                        <ol className="linha-tempo">
                            {dados.publicacoes.map(p => {
                                const situacao = SITUACAO[p.situacao];

                                return (
                                    <li key={p.id} className={`linha-tempo-item linha-tempo-${p.situacao}`}>
                                        <span className="linha-tempo-marca"><Icone nome={situacao.icone} /></span>
                                        <div className="linha-tempo-corpo">
                                            <div className="linha-tempo-topo">
                                                <span className={`selo ${situacao.selo}`}>{situacao.texto}</span>
                                                <span className="linha-tempo-quem">por {p.usuario ?? "—"}</span>
                                            </div>
                                            <dl className="linha-tempo-datas">
                                                <div><dt>Pedida</dt><dd>{dataHora(p.pedida_em)}</dd></div>
                                                <div><dt>Concluída</dt><dd>{dataHora(p.concluida_em)}</dd></div>
                                            </dl>
                                            {p.detalhe && <small className="linha-tempo-detalhe">{p.detalhe}</small>}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </>
                )}
            </section>

            {pendentes.length > 0 && (
                <section className="cartao">
                    <header>
                        <h2><Icone nome="fal:hourglass-half" /> Depoimentos aguardando aprovação <span className="selo selo-pendente">{pendentes.length}</span></h2>
                    </header>
                    <ul className="pendentes">
                        {pendentes.map(d => {
                            const texto = d.idioma_original === "en" ? d.texto_en : d.texto_pt;
                            const profissao = d.idioma_original === "en" ? d.profissao_en : d.profissao_pt;

                            return (
                                <li key={d.id}>
                                    <a className="pendente" href={`/admin/depoimentos#depoimento-${d.id}`}>
                                        <Avatar nome={d.nome} foto={d.foto} info={d.foto ? dados.imagens[d.foto] : undefined} />
                                        <span className="pendente-corpo">
                                            <strong>{d.nome}</strong>
                                            {profissao && <small>{profissao}</small>}
                                            {texto && <span className="pendente-trecho"><Icone nome="fas:quote-left" /> {texto}</span>}
                                            <small className="pendente-data"><Icone nome="fal:calendar-alt" /> Enviado em {dataHora(d.enviado_em)} · {d.idioma_original.toUpperCase()}</small>
                                        </span>
                                        <span className="pendente-acao">Revisar <Icone nome="fal:arrow-right" /></span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}
        </>
    );
}
