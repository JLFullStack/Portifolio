"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api, destinoDepoisDoLogin, type Usuario } from "@/lib/api";
import { Aviso, Campo, Entrada, useAcao } from "./Campos";

const proximo = () => new URLSearchParams(location.search).get("next");

/** Formulário de login (/login). Quem já está logado segue direto para a sua área. */
export function FormLogin() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const { executando, aviso, executar } = useAcao();

    useEffect(() => {
        api<{ usuario: Usuario }>("GET", "/auth/eu")
            .then(({ usuario }) => location.replace(destinoDepoisDoLogin(usuario, proximo())))
            .catch(() => { /* sem sessão: mostra o formulário */ });
    }, []);

    const entrar = (evento: FormEvent) => {
        evento.preventDefault();
        executar(async () => {
            const { usuario } = await api<{ usuario: Usuario }>("POST", "/auth/entrar", { email, senha });
            location.replace(destinoDepoisDoLogin(usuario, proximo()));
        });
    };

    return (
        <main className="acesso">
            <form className="acesso-cartao" onSubmit={entrar}>
                <h1>Entrar</h1>
                <p>Área restrita do portfólio de Lucas Araújo.</p>

                <div className="campos">
                    <Campo rotulo="E-mail">
                        <Entrada type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </Campo>
                    <Campo rotulo="Senha">
                        <Entrada type="password" autoComplete="current-password" required value={senha} onChange={e => setSenha(e.target.value)} />
                    </Campo>
                </div>

                <div className="botoes">
                    <button type="submit" className="botao botao-primario" disabled={executando}>
                        {executando ? "Entrando…" : "Entrar"}
                    </button>
                </div>
                <Aviso aviso={aviso} />

                <p className="acesso-rodape">
                    Esqueceu a senha? Peça um novo link de acesso ao Lucas.<br />
                    <a href="/">Voltar ao portfólio</a>
                </p>
            </form>
        </main>
    );
}

/** Define a senha pelo link de convite (/convite?token=...), de uso único. */
export function FormConvite() {
    const [token, setToken] = useState("");
    const [pessoa, setPessoa] = useState<{ nome: string; email: string } | null>(null);
    const [senha, setSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");
    const carregamento = useAcao();
    const envio = useAcao();

    useEffect(() => {
        const encontrado = new URLSearchParams(location.search).get("token") ?? "";
        setToken(encontrado);
        carregamento.executar(async () => {
            setPessoa(await api<{ nome: string; email: string }>("GET", `/auth/convite?token=${encodeURIComponent(encontrado)}`));
        });
    }, []);

    const definir = (evento: FormEvent) => {
        evento.preventDefault();

        if (senha !== confirmacao) {
            envio.setAviso({ tipo: "erro", texto: "As duas senhas não são iguais." });
            return;
        }

        envio.executar(async () => {
            const { usuario } = await api<{ usuario: Usuario }>("POST", "/auth/convite", { token, senha });
            location.replace(destinoDepoisDoLogin(usuario, null));
        });
    };

    return (
        <main className="acesso">
            <form className="acesso-cartao" onSubmit={definir}>
                <h1>Criar senha</h1>

                {!pessoa ? (
                    <>
                        <p>{carregamento.executando ? "Conferindo o convite…" : "Não foi possível abrir este convite."}</p>
                        <Aviso aviso={carregamento.aviso} />
                    </>
                ) : (
                    <>
                        <p>Olá, {pessoa.nome}! Crie a senha de acesso para <strong>{pessoa.email}</strong>.</p>

                        <div className="campos">
                            <Campo rotulo="Senha" dica="Pelo menos 10 caracteres.">
                                <Entrada type="password" autoComplete="new-password" minLength={10} maxLength={200} required
                                         value={senha} onChange={e => setSenha(e.target.value)} />
                            </Campo>
                            <Campo rotulo="Repita a senha">
                                <Entrada type="password" autoComplete="new-password" minLength={10} maxLength={200} required
                                         value={confirmacao} onChange={e => setConfirmacao(e.target.value)} />
                            </Campo>
                        </div>

                        <div className="botoes">
                            <button type="submit" className="botao botao-primario" disabled={envio.executando}>
                                {envio.executando ? "Salvando…" : "Criar senha e entrar"}
                            </button>
                        </div>
                        <Aviso aviso={envio.aviso} />
                    </>
                )}

                <p className="acesso-rodape"><a href="/">Voltar ao portfólio</a></p>
            </form>
        </main>
    );
}

/** Troca de senha de quem está logado (painel e página do depoente). */
export function TrocarSenha() {
    const [atual, setAtual] = useState("");
    const [nova, setNova] = useState("");
    const { executando, aviso, executar } = useAcao();

    const trocar = (evento: FormEvent) => {
        evento.preventDefault();
        executar(async () => {
            await api("POST", "/auth/senha", { atual, nova });
            setAtual("");
            setNova("");
        }, "Senha trocada. As outras sessões abertas foram encerradas.");
    };

    return (
        <form className="cartao" onSubmit={trocar}>
            <h2>Trocar senha</h2>
            <div className="campos-duas">
                <Campo rotulo="Senha atual">
                    <Entrada type="password" autoComplete="current-password" required value={atual} onChange={e => setAtual(e.target.value)} />
                </Campo>
                <Campo rotulo="Senha nova" dica="Pelo menos 10 caracteres.">
                    <Entrada type="password" autoComplete="new-password" minLength={10} maxLength={200} required
                             value={nova} onChange={e => setNova(e.target.value)} />
                </Campo>
            </div>
            <div className="botoes">
                <button type="submit" className="botao botao-primario" disabled={executando}>Trocar senha</button>
            </div>
            <Aviso aviso={aviso} />
        </form>
    );
}

export async function sair() {
    await api("POST", "/auth/sair").catch(() => undefined);
    location.replace("/login");
}
