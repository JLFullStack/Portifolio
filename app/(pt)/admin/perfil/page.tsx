"use client";

import { useRef, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { dataHora } from "@/lib/painel";
import { Aviso, Campo, CampoBilingue, Entrada, useAcao, type Bilingue } from "@/componentes/painel/Campos";
import { Icone } from "@/componentes/icones/Icone";
import { CampoImagem } from "@/componentes/painel/Imagens";
import { usePainel } from "@/componentes/painel/PainelAdmin";

const SIMPLES = ["nome_curto", "nome_completo", "nascimento", "email", "telefone", "whatsapp", "linkedin", "curriculo_pt", "curriculo_en", "chamada_autor", "foto_hero", "foto_biografia"];
const BILINGUES = ["saudacao", "profissao", "descricao_hero", "biografia", "endereco", "chamada_convite", "chamada_citacao"];

const IDIOMAS = { pt: "português", en: "inglês" } as const;

/**
 * Currículo em PDF de um idioma, guardado no D1: no próximo Publicar ele vira
 * /curriculo-<idioma>.pdf e o Download CV da página naquele idioma passa a abri-lo
 * (o link do campo Currículo vale enquanto não houver PDF).
 */
function Curriculo({ idioma }: { idioma: "pt" | "en" }) {
    const { dados, recarregar } = usePainel();
    const entrada = useRef<HTMLInputElement>(null);
    const { executando, aviso, executar } = useAcao();
    const atual = dados.curriculos[idioma];
    const caminho = `/api/arquivos/curriculo_${idioma}`;

    const enviar = async (arquivo: File | undefined) => {
        if (!arquivo) return;

        await executar(async () => {
            if (arquivo.type !== "application/pdf") throw new Error("Escolha um arquivo PDF.");
            await api("POST", caminho, arquivo);
            await recarregar();
        }, "Currículo enviado. Publique para atualizar o site.");

        if (entrada.current) entrada.current.value = "";
    };

    const remover = () => confirm("Remover o PDF? O Download CV volta a usar o link do campo Currículo.") && executar(async () => {
        await api("DELETE", caminho);
        await recarregar();
    }, "PDF removido. Publique para atualizar o site.");

    return (
        <div className="campo arquivo-curriculo">
            <span className="arquivo-curriculo-titulo">
                <span className="arquivo-curriculo-icone"><Icone nome="fal:file-pdf" /></span>
                Em {IDIOMAS[idioma]}
                {atual ? <span className="selo selo-aprovado">PDF enviado</span> : <span className="selo">{idioma.toUpperCase()}</span>}
            </span>
            <p className="cartao-nota">
                {atual
                    ? <>PDF de {(atual.tamanho / 1024).toFixed(0)} KB, enviado em {dataHora(atual.atualizado_em)}. O Download CV {idioma === "pt" ? "em português" : "em inglês"} abre este arquivo.</>
                    : <>Nenhum PDF: vale o link do campo Currículo ({idioma.toUpperCase()}). Até 1,9 MB.</>}
            </p>
            <div className="botoes">
                <label className="botao botao-primario enviar-imagem">
                    <Icone nome="fal:upload" /> {executando ? "Enviando…" : atual ? "Trocar PDF" : "Enviar PDF"}
                    <input ref={entrada} type="file" accept="application/pdf" disabled={executando} onChange={e => enviar(e.target.files?.[0])} />
                </label>
                {atual && (
                    <>
                        <a className="botao" href={caminho} target="_blank" rel="noopener"><Icone nome="fal:external-link" /> Ver PDF</a>
                        <button type="button" className="botao botao-perigo" disabled={executando} onClick={remover}><Icone nome="fal:trash-alt" /> Remover</button>
                    </>
                )}
            </div>
            <Aviso aviso={aviso} />
        </div>
    );
}

/** Perfil: identidade, contatos, selo de disponível, currículo, textos do hero, biografia, chamada final e as duas fotos. */
export default function PaginaPerfil() {
    const { dados, recarregar } = usePainel();
    const [perfil, setPerfil] = useState<Record<string, string>>(() => ({ ...dados.perfil }));
    const [imagens, setImagens] = useState(dados.imagens);
    const { executando, aviso, executar } = useAcao();

    const mudar = (campo: string, valor: string) => setPerfil(p => ({ ...p, [campo]: valor }));
    const bilingue = (campo: string): Bilingue => ({ pt: perfil[`${campo}_pt`] ?? "", en: perfil[`${campo}_en`] ?? "" });
    const mudarBilingue = (campo: string) => (valor: Bilingue) => setPerfil(p => ({ ...p, [`${campo}_pt`]: valor.pt, [`${campo}_en`]: valor.en }));

    const salvar = (evento: FormEvent) => {
        evento.preventDefault();

        const corpo: Record<string, string | number> = { disponivel: Number(perfil.disponivel) ? 1 : 0 };
        for (const campo of SIMPLES) corpo[campo] = perfil[campo] ?? "";
        for (const campo of BILINGUES) {
            corpo[`${campo}_pt`] = perfil[`${campo}_pt`] ?? "";
            corpo[`${campo}_en`] = perfil[`${campo}_en`] ?? "";
        }

        executar(async () => {
            await api("PUT", "/api/perfil", corpo);
            await recarregar();
        }, "Perfil salvo. Publique para atualizar o site.");
    };

    const texto = (campo: string, rotulo: string, tipo = "text", dica?: string) => (
        <Campo rotulo={rotulo} dica={dica}>
            <Entrada type={tipo} value={perfil[campo] ?? ""} onChange={e => mudar(campo, e.target.value)} />
        </Campo>
    );

    return (
        <form onSubmit={salvar}>
            <h1 className="painel-titulo">Perfil</h1>
            <p className="painel-subtitulo">Seus dados e os textos fixos da landing. Campo vazio num idioma usa o texto do outro.</p>

            <section className="cartao">
                <h2><Icone nome="fal:camera" /> Fotos</h2>
                <p className="cartao-nota">Depois de escolher, ajuste a posição e o zoom. A foto nova só vale depois de salvar o perfil.</p>
                <div className="fotos-perfil">
                    <CampoImagem rotulo="Foto do topo" dica="Recortada, com fundo transparente. Mantém a proporção da própria foto."
                                 id={perfil.foto_hero || null} info={imagens[perfil.foto_hero]} formato="livre"
                                 larguras={[320, 480, 640, 832]} rotuloEnviar="Trocar foto"
                                 aoEnviar={img => { setImagens(i => ({ ...i, [img.id]: img })); mudar("foto_hero", img.id); }} />
                    <CampoImagem rotulo="Foto da biografia" dica="Aparece recortada em círculo."
                                 id={perfil.foto_biografia || null} info={imagens[perfil.foto_biografia]} formato="redonda"
                                 larguras={[360, 700]} proporcao={1} rotuloEnviar="Trocar foto"
                                 aoEnviar={img => { setImagens(i => ({ ...i, [img.id]: img })); mudar("foto_biografia", img.id); }} />
                </div>
            </section>

            <section className="cartao">
                <h2><Icone nome="fal:id-card" /> Identificação e contato</h2>
                <div className="campos-duas">
                    {texto("nome_curto", "Nome em destaque")}
                    {texto("nome_completo", "Nome completo")}
                    {texto("nascimento", "Nascimento", "date", "A idade é calculada a partir desta data.")}
                    {texto("email", "E-mail", "email")}
                    {texto("telefone", "Celular")}
                    {texto("whatsapp", "Link do WhatsApp", "url", "Destino do botão CONTATO. Ex.: https://wa.me/5513999999999")}
                    {texto("linkedin", "LinkedIn", "url", "Link da assinatura no rodapé.")}
                    {texto("curriculo_pt", "Currículo (PT)", "url", "Download CV da página em português, enquanto não houver PDF enviado abaixo.")}
                    {texto("curriculo_en", "Currículo (EN)", "url", "Download CV da página em inglês. Vazio: usa o do português.")}
                </div>
                <label className="interruptor interruptor-destaque">
                    <input type="checkbox" role="switch" checked={Boolean(Number(perfil.disponivel))}
                           onChange={e => mudar("disponivel", e.target.checked ? "1" : "0")} />
                    <span>Mostrar o selo <strong>Disponível para novos projetos</strong> no topo e no menu</span>
                </label>
                <div className="campos">
                    <CampoBilingue rotulo="Endereço" valor={bilingue("endereco")} aoMudar={mudarBilingue("endereco")} />
                </div>
            </section>

            <section className="cartao">
                <h2><Icone nome="fal:file-pdf" /> Currículo em PDF</h2>
                <p className="cartao-nota">Um arquivo por idioma. Com PDF enviado, o Download CV daquele idioma abre o arquivo do próprio site.</p>
                <div className="campos-duas">
                    <Curriculo idioma="pt" />
                    <Curriculo idioma="en" />
                </div>
            </section>

            <section className="cartao">
                <h2><Icone nome="fal:home" /> Apresentação (topo)</h2>
                <div className="campos">
                    <CampoBilingue rotulo="Saudação" valor={bilingue("saudacao")} aoMudar={mudarBilingue("saudacao")} />
                    <CampoBilingue rotulo="Profissão" valor={bilingue("profissao")} aoMudar={mudarBilingue("profissao")} />
                    <CampoBilingue rotulo="Descrição" area linhas={4} valor={bilingue("descricao_hero")} aoMudar={mudarBilingue("descricao_hero")} />
                </div>
            </section>

            <section className="cartao">
                <h2><Icone nome="fal:user" /> Biografia</h2>
                <CampoBilingue rotulo="Texto" area linhas={10} dica="Separe os parágrafos com uma linha em branco."
                               valor={bilingue("biografia")} aoMudar={mudarBilingue("biografia")} />
            </section>

            <section className="cartao">
                <h2><Icone nome="fal:paper-plane" /> Chamada final</h2>
                <div className="campos">
                    <CampoBilingue rotulo="Convite" valor={bilingue("chamada_convite")} aoMudar={mudarBilingue("chamada_convite")} />
                    <CampoBilingue rotulo="Citação" area linhas={2} valor={bilingue("chamada_citacao")} aoMudar={mudarBilingue("chamada_citacao")} />
                    <Campo rotulo="Autor da citação">
                        <Entrada value={perfil.chamada_autor ?? ""} onChange={e => mudar("chamada_autor", e.target.value)} />
                    </Campo>
                </div>
            </section>

            <div className="barra-salvar">
                <Aviso aviso={aviso} />
                <button type="submit" className="botao botao-primario" disabled={executando}>
                    <Icone nome="fal:save" /> {executando ? "Salvando…" : "Salvar perfil"}
                </button>
            </div>
        </form>
    );
}
