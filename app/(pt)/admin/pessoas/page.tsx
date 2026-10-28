"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { dataHora, type UsuarioPainel } from "@/lib/painel";
import { Icone } from "@/componentes/icones/Icone";
import { Avatar } from "@/componentes/painel/Avatar";
import { Aviso, Campo, Entrada, useAcao } from "@/componentes/painel/Campos";
import { usePainel } from "@/componentes/painel/PainelAdmin";

type Convite = { link: string; expiraEm: string };

/** Link de convite pronto para copiar e mandar à pessoa (WhatsApp, e-mail...). */
function LinkConvite({ convite, nome }: { convite: Convite; nome: string }) {
    const [copiado, setCopiado] = useState(false);

    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(convite.link);
            setCopiado(true);
        } catch {
            setCopiado(false);
        }
    };

    return (
        <div className="convite-gerado">
            <p><Icone nome="fal:link" /> Mande este link para {nome}. Ele vale uma única vez, até {dataHora(convite.expiraEm)}:</p>
            <div className="link-copiavel">
                <input className="entrada" readOnly value={convite.link} onFocus={e => e.currentTarget.select()} />
                <button type="button" className={copiado ? "botao botao-primario" : "botao"} onClick={copiar}>
                    <Icone nome={copiado ? "fal:check" : "fal:copy"} /> {copiado ? "Copiado!" : "Copiar"}
                </button>
            </div>
        </div>
    );
}

function LinhaPessoa({ pessoa }: { pessoa: UsuarioPainel }) {
    const { recarregar } = usePainel();
    const [convite, setConvite] = useState<Convite | null>(null);
    const { executando, aviso, executar } = useAcao();
    const admin = pessoa.papel === "admin";

    const situacao = !pessoa.ativo ? { selo: "selo-recusado", texto: "Desativada" }
        : pessoa.tem_senha ? { selo: "selo-aprovado", texto: `Último acesso: ${dataHora(pessoa.ultimo_acesso)}` }
        : pessoa.convite_expira_em ? { selo: "selo-pendente", texto: `Convite vale até ${dataHora(pessoa.convite_expira_em)}` }
        : { selo: "selo-recusado", texto: "Convite expirado" };

    return (
        <li className={pessoa.ativo ? "pessoa" : "pessoa pessoa-inativa"}>
            <div className="pessoa-cabeca">
                <Avatar nome={pessoa.nome} />
                <div className="pessoa-dados">
                    <strong>{pessoa.nome}</strong>
                    <a href={`mailto:${pessoa.email}`}>{pessoa.email}</a>
                </div>
            </div>
            <div className="item-selos">
                <span className={admin ? "selo selo-destaque" : "selo"}>
                    <Icone nome={admin ? "fal:shield-check" : "fal:comments"} /> {admin ? "Administrador" : "Depoente"}
                </span>
                <span className={`selo ${situacao.selo}`}>{situacao.texto}</span>
            </div>
            <div className="botoes">
                {!admin && (
                    <>
                        <button type="button" className="botao botao-perigo" disabled={executando}
                                onClick={() => confirm(`Excluir o acesso de ${pessoa.nome}? O depoimento continua no painel.`) &&
                                    executar(async () => {
                                        await api("DELETE", `/api/usuarios/${pessoa.id}`);
                                        await recarregar();
                                    })}><Icone nome="fal:trash-alt" /> Excluir</button>
                        <button type="button" className="botao" disabled={executando}
                                onClick={() => executar(async () => {
                                    await api("PUT", `/api/usuarios/${pessoa.id}`, { ativo: !pessoa.ativo });
                                    await recarregar();
                                })}><Icone nome={pessoa.ativo ? "fal:ban" : "fal:check"} /> {pessoa.ativo ? "Desativar" : "Reativar"}</button>
                    </>
                )}
                <button type="button" className="botao" disabled={executando}
                        onClick={() => executar(async () => {
                            setConvite(await api<Convite>("POST", `/api/usuarios/${pessoa.id}/convite`));
                            await recarregar();
                        })}>
                    <Icone nome={pessoa.tem_senha ? "fal:key" : "fal:link"} /> {pessoa.tem_senha ? "Link para nova senha" : "Novo link de convite"}
                </button>
            </div>
            {convite && <LinkConvite convite={convite} nome={pessoa.nome} />}
            <Aviso aviso={aviso} />
        </li>
    );
}

/** Pessoas com acesso: convidar depoentes, gerar links novos, desativar e excluir. */
export default function PaginaPessoas() {
    const { dados, recarregar } = usePainel();
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [convite, setConvite] = useState<(Convite & { nome: string }) | null>(null);
    const { executando, aviso, executar } = useAcao();

    const convidar = (evento: FormEvent) => {
        evento.preventDefault();
        executar(async () => {
            const resposta = await api<Convite>("POST", "/api/usuarios", { nome, email });
            setConvite({ ...resposta, nome });
            setNome("");
            setEmail("");
            await recarregar();
        });
    };

    return (
        <>
            <h1 className="painel-titulo">Pessoas</h1>
            <p className="painel-subtitulo">
                Não há cadastro aberto: só entra quem você convida. A pessoa recebe um link, cria a própria senha e escreve o depoimento.
            </p>

            <form className="cartao" onSubmit={convidar}>
                <h2><Icone nome="fal:paper-plane" /> Convidar para dar depoimento</h2>
                <div className="campos-duas">
                    <Campo rotulo="Nome">
                        <Entrada required maxLength={120} value={nome} onChange={e => setNome(e.target.value)} />
                    </Campo>
                    <Campo rotulo="E-mail" dica="É o login da pessoa.">
                        <Entrada type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} />
                    </Campo>
                </div>
                <div className="botoes">
                    <button type="submit" className="botao botao-primario" disabled={executando}><Icone nome="fal:link" /> Gerar convite</button>
                </div>
                <Aviso aviso={aviso} />
                {convite && <LinkConvite convite={convite} nome={convite.nome} />}
            </form>

            <section className="cartao">
                <h2><Icone nome="fal:users" /> Quem tem acesso <span className="selo">{dados.usuarios.length}</span></h2>
                <ul className="pessoas">
                    {dados.usuarios.map(pessoa => <LinhaPessoa key={pessoa.id} pessoa={pessoa} />)}
                </ul>
            </section>
        </>
    );
}
