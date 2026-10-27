"use client";

import { api } from "@/lib/api";
import { dataHora, type Mensagem } from "@/lib/painel";
import { Aviso, useAcao } from "@/componentes/painel/Campos";
import { usePainel } from "@/componentes/painel/PainelAdmin";

/** Uma mensagem: quem mandou, o assunto, o texto e as ações (responder, marcar como lida, excluir). */
function CartaoMensagem({ mensagem }: { mensagem: Mensagem }) {
    const { recarregar } = usePainel();
    const { executando, aviso, executar } = useAcao();
    const assunto = mensagem.interesse || "Mensagem pelo portfólio";

    const marcar = (lida: boolean) => executar(async () => {
        await api("PUT", `/api/mensagens/${mensagem.id}`, { lida });
        await recarregar();
    });

    const excluir = () => confirm("Excluir esta mensagem? Isso não pode ser desfeito.") && executar(async () => {
        await api("DELETE", `/api/mensagens/${mensagem.id}`);
        await recarregar();
    });

    return (
        <li>
            <article className={mensagem.lida ? "mensagem" : "mensagem mensagem-nova"}>
                <header className="mensagem-cabeca">
                    <div>
                        <strong>{mensagem.nome}</strong>
                        <a href={`mailto:${mensagem.email}`}>{mensagem.email}</a>
                    </div>
                    <div className="mensagem-meta">
                        {!mensagem.lida && <span className="selo selo-pendente">nova</span>}
                        {mensagem.interesse && <span className="selo">{mensagem.interesse}</span>}
                        <span className="selo">{mensagem.idioma === "en" ? "EN" : "PT"}</span>
                        <small>{dataHora(mensagem.enviada_em)}</small>
                    </div>
                </header>

                <p className="mensagem-texto">{mensagem.texto}</p>

                <div className="botoes">
                    <a className="botao botao-primario"
                       href={`mailto:${mensagem.email}?subject=${encodeURIComponent(`Re: ${assunto}`)}`}
                       onClick={() => { if (!mensagem.lida) marcar(true); }}>Responder por e-mail</a>
                    <button type="button" className="botao" disabled={executando} onClick={() => marcar(!mensagem.lida)}>
                        {mensagem.lida ? "Marcar como nova" : "Marcar como lida"}
                    </button>
                    <button type="button" className="botao botao-perigo" disabled={executando} onClick={excluir}>Excluir</button>
                </div>
                <Aviso aviso={aviso} />
            </article>
        </li>
    );
}

/** Mensagens que chegaram pelo formulário de contato da landing (as 200 mais recentes). */
export default function PaginaMensagens() {
    const { dados } = usePainel();
    const novas = dados.mensagens.filter(m => !m.lida).length;
    const total = dados.mensagens.length;

    return (
        <>
            <h1 className="painel-titulo">Mensagens</h1>
            <p className="painel-subtitulo">
                {total
                    ? `${total} ${total === 1 ? "mensagem" : "mensagens"} pelo formulário de contato${novas ? `, ${novas} ${novas === 1 ? "nova" : "novas"}` : ""}.`
                    : "Nenhuma mensagem ainda. Elas chegam pelo formulário da seção Contato da landing."}
            </p>

            {dados.mensagens.length > 0 && (
                <ul className="itens mensagens">
                    {dados.mensagens.map(mensagem => <CartaoMensagem key={mensagem.id} mensagem={mensagem} />)}
                </ul>
            )}
        </>
    );
}
