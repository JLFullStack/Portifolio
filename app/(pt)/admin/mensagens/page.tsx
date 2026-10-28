"use client";

import { api } from "@/lib/api";
import { dataHora, type Mensagem } from "@/lib/painel";
import { Icone } from "@/componentes/icones/Icone";
import { Avatar } from "@/componentes/painel/Avatar";
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
                    <Avatar nome={mensagem.nome} />
                    <div className="pessoa-dados">
                        <strong>{mensagem.nome}</strong>
                        <a href={`mailto:${mensagem.email}`}>{mensagem.email}</a>
                    </div>
                </header>
                <div className="mensagem-meta">
                    {!mensagem.lida && <span className="selo selo-pendente">nova</span>}
                    {mensagem.interesse && <span className="selo">{mensagem.interesse}</span>}
                    <span className="selo">{mensagem.idioma === "en" ? "EN" : "PT"}</span>
                    <small><Icone nome="fal:calendar-alt" /> {dataHora(mensagem.enviada_em)}</small>
                </div>

                <p className="mensagem-texto">{mensagem.texto}</p>

                <div className="botoes">
                    <button type="button" className="botao botao-perigo" disabled={executando} onClick={excluir}>
                        <Icone nome="fal:trash-alt" /> Excluir
                    </button>
                    <button type="button" className="botao" disabled={executando} onClick={() => marcar(!mensagem.lida)}>
                        <Icone nome={mensagem.lida ? "fal:envelope" : "fal:envelope-open"} /> {mensagem.lida ? "Marcar como nova" : "Marcar como lida"}
                    </button>
                    <a className="botao botao-primario"
                       href={`mailto:${mensagem.email}?subject=${encodeURIComponent(`Re: ${assunto}`)}`}
                       onClick={() => { if (!mensagem.lida) marcar(true); }}><Icone nome="fal:reply" /> Responder por e-mail</a>
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

            {total === 0 && (
                <div className="cartao vazio">
                    <span className="vazio-icone"><Icone nome="fal:inbox" /></span>
                    <p>A caixa está vazia por enquanto.</p>
                </div>
            )}

            {dados.mensagens.length > 0 && (
                <ul className="itens mensagens">
                    {dados.mensagens.map(mensagem => <CartaoMensagem key={mensagem.id} mensagem={mensagem} />)}
                </ul>
            )}
        </>
    );
}
