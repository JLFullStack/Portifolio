"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { DadosPainel } from "@/lib/painel";
import { sair } from "./Acesso";
import { Aviso, useAcao } from "./Campos";

type ContextoPainel = { dados: DadosPainel; recarregar: () => Promise<void> };

const Contexto = createContext<ContextoPainel | null>(null);

/** Os dados do painel (GET /api/painel) e a função que os recarrega depois de salvar algo. */
export function usePainel(): ContextoPainel {
    const contexto = useContext(Contexto);
    if (!contexto) throw new Error("usePainel fora do PainelAdmin");
    return contexto;
}

const SECOES = [
    { href: "/admin", rotulo: "Visão geral" },
    { href: "/admin/perfil", rotulo: "Perfil" },
    { href: "/admin/projetos", rotulo: "Projetos" },
    { href: "/admin/depoimentos", rotulo: "Depoimentos" },
    { href: "/admin/secoes", rotulo: "Seções" },
    { href: "/admin/pessoas", rotulo: "Pessoas" },
    { href: "/admin/conta", rotulo: "Conta" }
];

/**
 * Moldura de todas as páginas /admin: cabeçalho com a navegação e os dados do painel,
 * carregados ao abrir a página e compartilhados com ela pelo contexto.
 * A navegação usa links comuns, não next/link: na exportação estática o pré-carregamento
 * de rotas do Next pede arquivos que não existem e fica preso atrás do Worker.
 * O acesso já foi conferido pelo Worker antes de a página chegar aqui.
 */
export function PainelAdmin({ children }: { children: ReactNode }) {
    const caminho = usePathname().replace(/\/$/, "") || "/admin";
    const [dados, setDados] = useState<DadosPainel | null>(null);
    const { aviso, executar } = useAcao();

    const recarregar = useCallback(async () => {
        setDados(await api<DadosPainel>("GET", "/api/painel"));
    }, []);

    useEffect(() => {
        executar(recarregar);
    }, [executar, recarregar]);

    const pendentes = dados?.depoimentos.filter(d => d.situacao === "pendente").length ?? 0;

    return (
        <>
            <header className="painel-cabecalho">
                <div className="conteudo">
                    <p className="painel-marca">Painel <span>do portfólio</span></p>

                    <nav className="painel-navegacao" aria-label="Seções do painel">
                        {SECOES.map(secao => (
                            <a key={secao.href} href={secao.href} aria-current={caminho === secao.href ? "page" : undefined}>
                                {secao.rotulo}
                                {secao.href === "/admin/depoimentos" && pendentes > 0 && <span className="selo selo-pendente">{pendentes}</span>}
                            </a>
                        ))}
                    </nav>

                    <div className="painel-acoes-topo">
                        <a className="botao" href="/" target="_blank" rel="noopener">Ver site</a>
                        <button type="button" className="botao" onClick={sair}>Sair</button>
                    </div>
                </div>
            </header>

            <main className="painel-corpo">
                <div className="conteudo">
                    <Aviso aviso={aviso} />
                    {dados ? (
                        <Contexto.Provider value={{ dados, recarregar }}>{children}</Contexto.Provider>
                    ) : (
                        !aviso && <p className="painel-subtitulo">Carregando…</p>
                    )}
                </div>
            </main>
        </>
    );
}
