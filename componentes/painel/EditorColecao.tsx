"use client";

import { useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { Linha } from "@/lib/painel";
import { ICONES } from "@/componentes/icones/dados";
import { Icone } from "@/componentes/icones/Icone";
import { AreaTexto, Aviso, Campo, CampoBilingue, Entrada, useAcao } from "./Campos";
import { usePainel } from "./PainelAdmin";

/** "icone": redes sociais (fab:); "icone-servico": os ícones de traço fino dos cards de Serviços. */
type TipoCampo = "texto" | "area" | "url" | "icone" | "icone-servico" | "bool";

/** Um campo do formulário. `bilingue` edita as colunas <nome>_pt e <nome>_en. */
export type DefCampo = { nome: string; rotulo: string; tipo?: TipoCampo; bilingue?: boolean; dica?: string };

type Valores = Record<string, string | number | boolean | null>;

/** Ícones de redes sociais disponíveis (gerados por scripts/gerar-icones.mjs). */
const ICONES_REDES = Object.keys(ICONES).filter(nome => nome.startsWith("fab:")) as (keyof typeof ICONES)[];

/** Ícones oferecidos para os cards de Serviços (todos gerados em scripts/gerar-icones.mjs). */
const ICONES_SERVICOS = ([
    "fal:server", "fal:laptop-code", "fal:database", "fal:sync-alt", "fal:tools", "fal:mobile-alt", "fal:cloud", "fal:shield-check",
    "fal:chart-line", "fal:cogs", "fal:code", "fal:layer-group", "fal:rocket", "fal:paint-brush", "fal:infinity"
] as const).filter(nome => Object.hasOwn(ICONES, nome));

const opcoesIcone = (tipo?: TipoCampo): readonly (keyof typeof ICONES)[] => tipo === "icone-servico" ? ICONES_SERVICOS : ICONES_REDES;

function valoresIniciais(campos: DefCampo[], item?: Linha): Valores {
    const valores: Valores = {};

    for (const campo of campos) {
        const colunas = campo.bilingue ? [`${campo.nome}_pt`, `${campo.nome}_en`] : [campo.nome];
        for (const coluna of colunas) {
            valores[coluna] = item?.[coluna] ?? (campo.tipo === "bool" ? 1 : campo.tipo?.startsWith("icone") ? opcoesIcone(campo.tipo)[0] : "");
        }
    }

    return valores;
}

function Formulario({ campos, valores, mudar }: { campos: DefCampo[]; valores: Valores; mudar: (coluna: string, valor: string | number) => void }) {
    return (
        <div className="campos">
            {campos.map(campo => {
                if (campo.bilingue) {
                    return (
                        <CampoBilingue key={campo.nome} rotulo={campo.rotulo} area={campo.tipo === "area"} dica={campo.dica}
                                       valor={{ pt: String(valores[`${campo.nome}_pt`] ?? ""), en: String(valores[`${campo.nome}_en`] ?? "") }}
                                       aoMudar={v => { mudar(`${campo.nome}_pt`, v.pt); mudar(`${campo.nome}_en`, v.en); }} />
                    );
                }

                const valor = valores[campo.nome];

                if (campo.tipo === "bool") {
                    return (
                        <label key={campo.nome} className="opcoes">
                            <span><input type="checkbox" checked={Boolean(valor)} onChange={e => mudar(campo.nome, e.target.checked ? 1 : 0)} /> {campo.rotulo}</span>
                        </label>
                    );
                }

                if (campo.tipo === "icone" || campo.tipo === "icone-servico") {
                    return (
                        <Campo key={campo.nome} rotulo={campo.rotulo} dica={campo.dica}>
                            <span className="opcoes">
                                <select className="entrada" style={{ maxWidth: "16rem" }} value={String(valor)} onChange={e => mudar(campo.nome, e.target.value)}>
                                    {opcoesIcone(campo.tipo).map(nome => <option key={nome} value={nome}>{nome.slice(4)}</option>)}
                                </select>
                                {Object.hasOwn(ICONES, String(valor)) && <span className="previa-icone"><Icone nome={String(valor) as keyof typeof ICONES} /></span>}
                            </span>
                        </Campo>
                    );
                }

                return (
                    <Campo key={campo.nome} rotulo={campo.rotulo} dica={campo.dica}>
                        {campo.tipo === "area"
                            ? <AreaTexto value={String(valor ?? "")} onChange={e => mudar(campo.nome, e.target.value)} />
                            : <Entrada type={campo.tipo === "url" ? "url" : "text"} value={String(valor ?? "")} onChange={e => mudar(campo.nome, e.target.value)} />}
                    </Campo>
                );
            })}
        </div>
    );
}

function ItemColecao({ tabela, item, campos, titulo, extras, mover }: {
    tabela: string;
    item: Linha;
    campos: DefCampo[];
    titulo: ReactNode;
    extras?: ReactNode;
    mover: (direcao: -1 | 1) => void;
}) {
    const { recarregar } = usePainel();
    const [valores, setValores] = useState(() => valoresIniciais(campos, item));
    const { executando, aviso, executar } = useAcao();

    const salvar = () => executar(async () => {
        await api("PUT", `/api/colecoes/${tabela}/${item.id}`, valores);
        await recarregar();
    }, "Salvo. Publique para atualizar o site.");

    const excluir = () => {
        if (!confirm("Excluir este item? Isso não pode ser desfeito.")) return;
        executar(async () => {
            await api("DELETE", `/api/colecoes/${tabela}/${item.id}`);
            await recarregar();
        });
    };

    return (
        <li>
            <details className="item">
                <summary>
                    <span className="item-titulo">{titulo}</span>
                    <button type="button" className="botao botao-icone-pequeno" aria-label="Subir"
                            onClick={e => { e.preventDefault(); mover(-1); }}>↑</button>
                    <button type="button" className="botao botao-icone-pequeno" aria-label="Descer"
                            onClick={e => { e.preventDefault(); mover(1); }}>↓</button>
                </summary>
                <div className="item-corpo">
                    <Formulario campos={campos} valores={valores} mudar={(coluna, valor) => setValores(v => ({ ...v, [coluna]: valor }))} />
                    <div className="botoes">
                        <button type="button" className="botao botao-primario" disabled={executando} onClick={salvar}>Salvar</button>
                        <button type="button" className="botao botao-perigo" disabled={executando} onClick={excluir}>Excluir</button>
                    </div>
                    <Aviso aviso={aviso} />
                    {extras}
                </div>
            </details>
        </li>
    );
}

function NovoItem({ tabela, campos, rotulo, valoresFixos }: { tabela: string; campos: DefCampo[]; rotulo: string; valoresFixos?: Valores }) {
    const { recarregar } = usePainel();
    const [valores, setValores] = useState(() => valoresIniciais(campos));
    const [aberto, setAberto] = useState(false);
    const { executando, aviso, executar } = useAcao();

    const criar = async () => {
        const ok = await executar(async () => {
            await api("POST", `/api/colecoes/${tabela}`, { ...valores, ...valoresFixos });
            await recarregar();
        });

        if (ok) {
            setValores(valoresIniciais(campos));
            setAberto(false);
        }
    };

    return (
        <li>
            <details className="item item-novo" open={aberto} onToggle={e => setAberto(e.currentTarget.open)}>
                <summary><span className="item-titulo">+ {rotulo}</span></summary>
                <div className="item-corpo">
                    <Formulario campos={campos} valores={valores} mudar={(coluna, valor) => setValores(v => ({ ...v, [coluna]: valor }))} />
                    <div className="botoes">
                        <button type="button" className="botao botao-primario" disabled={executando} onClick={criar}>Adicionar</button>
                    </div>
                    <Aviso aviso={aviso} />
                </div>
            </details>
        </li>
    );
}

/**
 * Lista editável de uma coleção do banco (worker/api.js, COLECOES): cada item abre um
 * formulário com Salvar, Excluir e as setas de ordem; no fim, o formulário de um novo.
 */
export function EditorColecao({ tabela, itens, campos, resumo, rotuloNovo, extras, valoresFixos, recurso }: {
    tabela: string;
    itens: Linha[];
    campos: DefCampo[];
    resumo: (item: Linha) => ReactNode;
    rotuloNovo: string;
    extras?: (item: Linha) => ReactNode;
    valoresFixos?: Valores;
    /** Endereço da reordenação, quando não é /api/colecoes/<tabela>/ordem. */
    recurso?: string;
}) {
    const { recarregar } = usePainel();
    const { aviso, executar } = useAcao();

    const mover = (indice: number, direcao: -1 | 1) => {
        const destino = indice + direcao;
        if (destino < 0 || destino >= itens.length) return;

        const ids = itens.map(item => item.id);
        [ids[indice], ids[destino]] = [ids[destino], ids[indice]];

        executar(async () => {
            await api("POST", recurso ?? `/api/colecoes/${tabela}/ordem`, { ids });
            await recarregar();
        });
    };

    return (
        <>
            <ul className="itens">
                {itens.map((item, indice) => (
                    <ItemColecao key={`${item.id}-${item.ordem}`} tabela={tabela} item={item} campos={campos} titulo={resumo(item)}
                                 extras={extras?.(item)} mover={direcao => mover(indice, direcao)} />
                ))}
                <NovoItem tabela={tabela} campos={campos} rotulo={rotuloNovo} valoresFixos={valoresFixos} />
            </ul>
            <Aviso aviso={aviso} />
        </>
    );
}
