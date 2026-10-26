"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { dataHora } from "@/lib/painel";
import { Aviso, useAcao } from "@/componentes/painel/Campos";
import { usePainel } from "@/componentes/painel/PainelAdmin";

const SITUACAO = {
    pedida: { selo: "selo-pendente", texto: "Em andamento" },
    concluida: { selo: "selo-aprovado", texto: "Publicada" },
    falhou: { selo: "selo-recusado", texto: "Falhou" }
} as const;

/** Visão geral: números do conteúdo, depoimentos à espera e o botão Publicar. */
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

    const numeros = [
        { href: "/admin/projetos", valor: dados.projetos.filter(p => p.publicado).length, rotulo: "projetos publicados" },
        { href: "/admin/depoimentos", valor: dados.depoimentos.filter(d => d.publicado).length, rotulo: "depoimentos no site" },
        { href: "/admin/depoimentos", valor: pendentes.length, rotulo: "aguardando aprovação" },
        { href: "/admin/pessoas", valor: dados.usuarios.filter(u => u.papel === "depoente").length, rotulo: "pessoas convidadas" }
    ];

    return (
        <>
            <h1 className="painel-titulo">Visão geral</h1>
            <p className="painel-subtitulo">
                O que você salva aqui fica guardado no banco. O site só muda quando você publica.
            </p>

            <div className="resumo-numeros">
                {numeros.map(n => (
                    <a key={n.rotulo} href={n.href}><strong>{n.valor}</strong><span>{n.rotulo}</span></a>
                ))}
            </div>

            <section className="cartao">
                <header>
                    <h2>Publicar o site</h2>
                    <button type="button" className="botao botao-primario" disabled={executando || emAndamento} onClick={publicar}>
                        {emAndamento ? "Publicando…" : "Publicar alterações"}
                    </button>
                </header>
                <p className="cartao-nota">
                    Gera a landing de novo com o conteúdo atual do banco (perfil, projetos, depoimentos aprovados e seções) e
                    publica no Cloudflare. Leva de 2 a 4 minutos.
                </p>
                <Aviso aviso={aviso} />

                {dados.publicacoes.length > 0 && (
                    <div className="rolagem-horizontal">
                        <table className="tabela">
                            <thead>
                                <tr><th>Pedida em</th><th>Por</th><th>Situação</th><th>Concluída em</th></tr>
                            </thead>
                            <tbody>
                                {dados.publicacoes.map(p => (
                                    <tr key={p.id}>
                                        <td>{dataHora(p.pedida_em)}</td>
                                        <td>{p.usuario ?? "—"}</td>
                                        <td>
                                            <span className={`selo ${SITUACAO[p.situacao].selo}`}>{SITUACAO[p.situacao].texto}</span>
                                            {p.detalhe && <small> {p.detalhe}</small>}
                                        </td>
                                        <td>{dataHora(p.concluida_em)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {pendentes.length > 0 && (
                <section className="cartao">
                    <header>
                        <h2>Depoimentos aguardando aprovação</h2>
                        <a className="botao" href="/admin/depoimentos">Revisar</a>
                    </header>
                    <ul className="itens">
                        {pendentes.map(d => (
                            <li key={d.id} className="item"><div className="item-corpo" style={{ paddingTop: "0.85rem" }}>
                                <strong>{d.nome}</strong> · enviado em {dataHora(d.enviado_em)}
                            </div></li>
                        ))}
                    </ul>
                </section>
            )}
        </>
    );
}
