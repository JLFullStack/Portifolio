"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { InfoImagem } from "@/lib/painel";
import { sair, TrocarSenha } from "./Acesso";
import { AreaTexto, Aviso, Campo, Entrada, useAcao } from "./Campos";
import { Icone } from "@/componentes/icones/Icone";
import { CampoImagem } from "./Imagens";

type MeuDepoimento = {
    usuario: { nome: string; email: string };
    depoimento: {
        nome: string;
        idioma_original: "pt" | "en";
        texto: string;
        profissao: string;
        foto: string | null;
        situacao: "pendente" | "aprovado" | "recusado";
        publicado: boolean;
    } | null;
    imagem: InfoImagem | null;
};

const MAXIMO_TEXTO = 1500;

const SITUACAO = {
    pendente: { selo: "selo-pendente", pt: "Aguardando aprovação", en: "Awaiting approval" },
    aprovado: { selo: "selo-aprovado", pt: "Aprovado", en: "Approved" },
    recusado: { selo: "selo-recusado", pt: "Não aprovado", en: "Not approved" }
} as const;

/**
 * Página do depoente (/depoimento): a pessoa escreve o próprio depoimento no idioma
 * dela, com foto e profissão. Cada envio fica pendente até o Lucas aprovar.
 */
export function AreaDepoente() {
    const [dados, setDados] = useState<MeuDepoimento | null>(null);
    const [nome, setNome] = useState("");
    const [idioma, setIdioma] = useState<"pt" | "en">("pt");
    const [profissao, setProfissao] = useState("");
    const [texto, setTexto] = useState("");
    const [foto, setFoto] = useState<{ id: string; info: InfoImagem } | null>(null);
    const carregamento = useAcao();
    const envio = useAcao();

    const carregar = async () => {
        const resposta = await api<MeuDepoimento>("GET", "/api/meu-depoimento");
        const d = resposta.depoimento;

        setDados(resposta);
        setNome(d?.nome ?? resposta.usuario.nome);
        setIdioma(d?.idioma_original ?? "pt");
        setProfissao(d?.profissao ?? "");
        setTexto(d?.texto ?? "");
        setFoto(d?.foto && resposta.imagem ? { id: d.foto, info: resposta.imagem } : null);
    };

    useEffect(() => {
        carregamento.executar(carregar);
    }, []);

    const enviar = (evento: FormEvent) => {
        evento.preventDefault();
        envio.executar(async () => {
            await api("PUT", "/api/meu-depoimento", { nome, idioma_original: idioma, profissao, texto, foto: foto?.id ?? null });
            await carregar();
        }, idioma === "pt"
            ? "Depoimento enviado! Ele aparece no portfólio depois que o Lucas aprovar."
            : "Testimonial sent! It will appear on the portfolio once Lucas approves it.");
    };

    const situacao = dados?.depoimento ? SITUACAO[dados.depoimento.situacao] : null;
    const portugues = idioma === "pt";

    return (
        <>
            <header className="painel-cabecalho">
                <div className="conteudo">
                    <a className="painel-marca" href="/">
                        <span className="monograma" aria-hidden="true">LA</span>
                        Portfólio <span>Lucas Araújo</span>
                    </a>
                    <div className="painel-acoes-topo">
                        <a className="botao" href="/" title={portugues ? "Ver portfólio" : "View portfolio"}>
                            <Icone nome="fal:external-link" /><span className="rotulo-opcional">{portugues ? "Ver portfólio" : "View portfolio"}</span>
                        </a>
                        <button type="button" className="botao" onClick={sair} title={portugues ? "Sair" : "Sign out"}>
                            <Icone nome="fal:sign-out" /><span className="rotulo-opcional">{portugues ? "Sair" : "Sign out"}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="painel-corpo">
                <div className="conteudo" style={{ maxWidth: "52rem" }}>
                    <h1 className="painel-titulo">{portugues ? "Seu depoimento" : "Your testimonial"}</h1>
                    <p className="painel-subtitulo">
                        {portugues
                            ? "Conte como foi trabalhar com o Lucas. Escreva no idioma que preferir: ele cuida da tradução."
                            : "Tell us what it was like to work with Lucas. Write in whichever language you prefer; he'll take care of the translation."}
                    </p>

                    <Aviso aviso={carregamento.aviso} />

                    {dados && (
                        <form className="cartao" onSubmit={enviar}>
                            {situacao && (
                                <p className="cartao-nota">
                                    <span className={`selo ${situacao.selo}`}>{situacao[idioma]}</span>
                                    {dados.depoimento?.publicado && (portugues
                                        ? " · A versão aprovada está no portfólio. Uma edição nova só a substitui depois de aprovada."
                                        : " · The approved version is live on the portfolio. A new edit replaces it only after it's approved.")}
                                </p>
                            )}

                            <div className="campos">
                                <fieldset className="campo">
                                    <legend>Idioma do depoimento · Testimonial language</legend>
                                    <div className="segmentado">
                                        <label><input type="radio" name="idioma" checked={portugues} onChange={() => setIdioma("pt")} /><span>Português</span></label>
                                        <label><input type="radio" name="idioma" checked={!portugues} onChange={() => setIdioma("en")} /><span>English</span></label>
                                    </div>
                                </fieldset>

                                <div className="campos-duas">
                                    <Campo rotulo={portugues ? "Seu nome" : "Your name"}>
                                        <Entrada required maxLength={120} value={nome} onChange={e => setNome(e.target.value)} />
                                    </Campo>
                                    <Campo rotulo={portugues ? "Sua profissão" : "Your profession"} dica={portugues ? "Ex.: Desenvolvedora Front-end" : "e.g., Front-end Developer"}>
                                        <Entrada required maxLength={120} value={profissao} onChange={e => setProfissao(e.target.value)} />
                                    </Campo>
                                </div>

                                <Campo rotulo={portugues ? "Depoimento" : "Testimonial"}
                                       dica={<span className="contador">{texto.length}/{MAXIMO_TEXTO}</span>}>
                                    <AreaTexto required rows={7} maxLength={MAXIMO_TEXTO} lang={portugues ? "pt-BR" : "en"}
                                               value={texto} onChange={e => setTexto(e.target.value)} />
                                </Campo>

                                <CampoImagem rotulo={portugues ? "Sua foto (opcional)" : "Your photo (optional)"}
                                             dica={portugues ? "Ajuste a posição e o zoom depois de escolher." : "Adjust position and zoom after choosing."}
                                             id={foto?.id ?? null} info={foto?.info} formato="redonda" idioma={idioma}
                                             larguras={[160, 320]} proporcao={1}
                                             rotuloEnviar={foto ? (portugues ? "Trocar foto" : "Replace photo") : (portugues ? "Escolher foto" : "Choose photo")}
                                             aoEnviar={imagem => setFoto({ id: imagem.id, info: imagem })}
                                             aoRemover={() => setFoto(null)} />
                            </div>

                            <div className="botoes">
                                <button type="submit" className="botao botao-primario" disabled={envio.executando}>
                                    <Icone nome="fal:paper-plane" />
                                    {envio.executando ? (portugues ? "Enviando…" : "Sending…") : (portugues ? "Enviar para aprovação" : "Send for approval")}
                                </button>
                            </div>
                            <Aviso aviso={envio.aviso} />
                        </form>
                    )}

                    {dados && <TrocarSenha />}
                </div>
            </main>
        </>
    );
}
