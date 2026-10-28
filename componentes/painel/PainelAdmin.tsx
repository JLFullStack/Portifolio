"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { DadosPainel } from "@/lib/painel";
import type { NomeIcone } from "@/componentes/icones/dados";
import { Icone } from "@/componentes/icones/Icone";
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

const SECOES: { href: string; rotulo: string; icone: NomeIcone; dica: string }[] = [
    { href: "/admin", rotulo: "Visão geral", icone: "fal:tachometer-alt", dica: "Resumo e publicação" },
    { href: "/admin/perfil", rotulo: "Perfil", icone: "fal:user", dica: "Fotos, textos e currículo" },
    { href: "/admin/projetos", rotulo: "Projetos", icone: "fal:folder-open", dica: "Vitrine de trabalhos" },
    { href: "/admin/depoimentos", rotulo: "Depoimentos", icone: "fal:comments", dica: "Aprovação e ordem" },
    { href: "/admin/mensagens", rotulo: "Mensagens", icone: "fal:inbox", dica: "Recebidas pelo contato" },
    { href: "/admin/secoes", rotulo: "Seções", icone: "fal:layer-group", dica: "Serviços, habilidades e carreira" },
    { href: "/admin/pessoas", rotulo: "Pessoas", icone: "fal:users", dica: "Acessos e convites" },
    { href: "/admin/conta", rotulo: "Conta", icone: "fal:user-cog", dica: "Seus dados e senha" }
];

/** No celular, quantas abas ficam na barra de baixo; as demais vão para o menu Mais. */
const ABAS_NA_BARRA = 4;

/**
 * Moldura de todas as páginas /admin: cabeçalho com a navegação e os dados do painel,
 * carregados ao abrir a página e compartilhados com ela pelo contexto.
 * A navegação usa links comuns, não next/link: na exportação estática o pré-carregamento
 * de rotas do Next pede arquivos que não existem e fica preso atrás do Worker.
 * No celular as abas vão para uma barra fixa embaixo (painel.css), ao alcance do polegar:
 * as quatro primeiras e um botão Mais, que abre as outras numa folha que sobe da barra.
 * O acesso já foi conferido pelo Worker antes de a página chegar aqui.
 */
export function PainelAdmin({ children }: { children: ReactNode }) {
    const caminho = usePathname().replace(/\/$/, "") || "/admin";
    const [dados, setDados] = useState<DadosPainel | null>(null);
    const { aviso, executar } = useAcao();
    const navegacao = useRef<HTMLElement>(null);
    const folha = useRef<HTMLDialogElement>(null);

    // A aba atual sempre à vista na faixa rolável das abas.
    useEffect(() => {
        navegacao.current?.querySelector("[aria-current]")?.scrollIntoView({ block: "nearest", inline: "center" });
    }, [caminho]);

    const recarregar = useCallback(async () => {
        setDados(await api<DadosPainel>("GET", "/api/painel"));
    }, []);

    useEffect(() => {
        executar(recarregar);
    }, [executar, recarregar]);

    const pendentes = dados?.depoimentos.filter(d => d.situacao === "pendente").length ?? 0;
    const novas = dados?.mensagens.filter(m => !m.lida).length ?? 0;
    const contagem: Record<string, number> = { "/admin/depoimentos": pendentes, "/admin/mensagens": novas };
    const extras = SECOES.slice(ABAS_NA_BARRA);
    const extraAtual = extras.find(secao => secao.href === caminho);
    const contagemExtras = extras.reduce((total, secao) => total + (contagem[secao.href] ?? 0), 0);

    return (
        <>
            <header className="painel-cabecalho">
                <div className="conteudo">
                    <a className="painel-marca" href="/admin">
                        <span className="monograma" aria-hidden="true">LA</span>
                        <span className="painel-marca-texto">Painel <span>do portfólio</span></span>
                    </a>

                    <nav ref={navegacao} className="painel-navegacao" aria-label="Seções do painel">
                        {SECOES.map((secao, indice) => (
                            <a key={secao.href} href={secao.href} aria-current={caminho === secao.href ? "page" : undefined}
                               className={indice >= ABAS_NA_BARRA ? "painel-aba-extra" : undefined}>
                                <span className="painel-aba-icone">
                                    <Icone nome={secao.icone} />
                                    {contagem[secao.href] > 0 && <span className="painel-aba-contagem">{contagem[secao.href]}</span>}
                                </span>
                                <span className="painel-aba-rotulo">{secao.rotulo}</span>
                            </a>
                        ))}
                        <button type="button" className="painel-aba-mais" aria-haspopup="dialog"
                                aria-current={extraAtual ? "page" : undefined} onClick={() => folha.current?.showModal()}>
                            <span className="painel-aba-icone">
                                <Icone nome="fal:bars" />
                                {contagemExtras > 0 && <span className="painel-aba-contagem">{contagemExtras}</span>}
                            </span>
                            <span className="painel-aba-rotulo">{extraAtual?.rotulo ?? "Mais"}</span>
                        </button>
                    </nav>

                    {/* Folha do botão Mais: fecha no X, no Esc ou tocando fora dela */}
                    <dialog ref={folha} className="painel-folha" aria-label="Mais seções"
                            onClick={e => e.target === e.currentTarget && folha.current?.close()}>
                        <div className="painel-folha-cabeca">
                            <strong>Mais seções</strong>
                            <button type="button" className="botao botao-redondo" aria-label="Fechar" onClick={() => folha.current?.close()}>
                                <Icone nome="fal:times" />
                            </button>
                        </div>
                        <ul className="painel-folha-lista">
                            {extras.map(secao => (
                                <li key={secao.href}>
                                    <a href={secao.href} aria-current={caminho === secao.href ? "page" : undefined}>
                                        <span className="painel-folha-icone">
                                            <Icone nome={secao.icone} />
                                            {contagem[secao.href] > 0 && <span className="painel-aba-contagem">{contagem[secao.href]}</span>}
                                        </span>
                                        <span className="painel-folha-texto">
                                            <strong>{secao.rotulo}</strong>
                                            <small>{secao.dica}</small>
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="painel-folha-rodape">
                            <a className="botao" href="/" target="_blank" rel="noopener"><Icone nome="fal:external-link" /> Ver site</a>
                            <button type="button" className="botao" onClick={sair}><Icone nome="fal:sign-out" /> Sair</button>
                        </div>
                    </dialog>

                    <div className="painel-acoes-topo">
                        <a className="botao" href="/" target="_blank" rel="noopener" title="Ver site">
                            <Icone nome="fal:external-link" /><span className="rotulo-opcional">Ver site</span>
                        </a>
                        <button type="button" className="botao" onClick={sair} title="Sair">
                            <Icone nome="fal:sign-out" /><span className="rotulo-opcional">Sair</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="painel-corpo">
                <div className="conteudo">
                    <Aviso aviso={aviso} />
                    {dados ? (
                        <Contexto.Provider value={{ dados, recarregar }}>{children}</Contexto.Provider>
                    ) : (
                        !aviso && <p className="painel-carregando"><Icone nome="fal:circle-notch" /> Carregando…</p>
                    )}
                </div>
            </main>
        </>
    );
}
