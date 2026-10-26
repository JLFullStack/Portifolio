"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { dataHora, type UsuarioPainel } from "@/lib/painel";
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
        <div className="aviso aviso-info">
            Mande este link para {nome}. Ele vale uma única vez, até {dataHora(convite.expiraEm)}:
            <div className="link-copiavel">
                <input className="entrada" readOnly value={convite.link} onFocus={e => e.currentTarget.select()} />
                <button type="button" className="botao" onClick={copiar}>{copiado ? "Copiado!" : "Copiar"}</button>
            </div>
        </div>
    );
}

function LinhaPessoa({ pessoa }: { pessoa: UsuarioPainel }) {
    const { recarregar } = usePainel();
    const [convite, setConvite] = useState<Convite | null>(null);
    const { executando, aviso, executar } = useAcao();
    const admin = pessoa.papel === "admin";

    const situacao = !pessoa.ativo ? "Desativada"
        : pessoa.tem_senha ? `Último acesso: ${dataHora(pessoa.ultimo_acesso)}`
        : pessoa.convite_expira_em ? `Convite enviado, vale até ${dataHora(pessoa.convite_expira_em)}`
        : "Convite expirado";

    return (
        <tr>
            <td><strong>{pessoa.nome}</strong><br /><small>{pessoa.email}</small></td>
            <td>{admin ? "Administrador" : "Depoente"}</td>
            <td>{situacao}</td>
            <td>
                <div className="botoes" style={{ marginTop: 0 }}>
                    <button type="button" className="botao" disabled={executando}
                            onClick={() => executar(async () => {
                                setConvite(await api<Convite>("POST", `/api/usuarios/${pessoa.id}/convite`));
                                await recarregar();
                            })}>
                        {pessoa.tem_senha ? "Link para nova senha" : "Novo link de convite"}
                    </button>
                    {!admin && (
                        <>
                            <button type="button" className="botao" disabled={executando}
                                    onClick={() => executar(async () => {
                                        await api("PUT", `/api/usuarios/${pessoa.id}`, { ativo: !pessoa.ativo });
                                        await recarregar();
                                    })}>{pessoa.ativo ? "Desativar" : "Reativar"}</button>
                            <button type="button" className="botao botao-perigo" disabled={executando}
                                    onClick={() => confirm(`Excluir o acesso de ${pessoa.nome}? O depoimento dela continua no painel.`) &&
                                        executar(async () => {
                                            await api("DELETE", `/api/usuarios/${pessoa.id}`);
                                            await recarregar();
                                        })}>Excluir</button>
                        </>
                    )}
                </div>
                {convite && <LinkConvite convite={convite} nome={pessoa.nome} />}
                <Aviso aviso={aviso} />
            </td>
        </tr>
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
                <h2>Convidar para dar depoimento</h2>
                <div className="campos-duas">
                    <Campo rotulo="Nome">
                        <Entrada required maxLength={120} value={nome} onChange={e => setNome(e.target.value)} />
                    </Campo>
                    <Campo rotulo="E-mail" dica="É o login da pessoa.">
                        <Entrada type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} />
                    </Campo>
                </div>
                <div className="botoes">
                    <button type="submit" className="botao botao-primario" disabled={executando}>Gerar convite</button>
                </div>
                <Aviso aviso={aviso} />
                {convite && <LinkConvite convite={convite} nome={convite.nome} />}
            </form>

            <section className="cartao rolagem-horizontal">
                <h2>Quem tem acesso</h2>
                <table className="tabela">
                    <thead>
                        <tr><th>Pessoa</th><th>Papel</th><th>Situação</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        {dados.usuarios.map(pessoa => <LinhaPessoa key={pessoa.id} pessoa={pessoa} />)}
                    </tbody>
                </table>
            </section>
        </>
    );
}
