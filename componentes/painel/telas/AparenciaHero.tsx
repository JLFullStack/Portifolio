"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import { Icone } from "@/componentes/icones/Icone";
import type { InfoImagem } from "@/lib/painel";

type Tema = "escuro" | "claro";
type Aparelho = "computador" | "celular";
type GrupoAjustes = "foto" | "esmaecer" | "opacidade";

export type AparenciaHero = {
    tamanho: number;
    esmaecer: number;
    esmaecerDireita: number;
    luzDireita: number;
    opacidadeEscuro: number;
    opacidadeClaro: number;
    foto: string | null;
    info?: InfoImagem;
};

/** Tamanho da janela simulada: o quadro tem esse tamanho de verdade (valem as media queries) e é reduzido para caber. */
const TAMANHOS: Record<Aparelho, { largura: number; altura: number }> = {
    computador: { largura: 1440, altura: 900 },
    celular: { largura: 390, altura: 844 }
};

/** Valores iniciais dos ajustes, em % (os mesmos da migração 0007): o clique duplo em uma barra volta a eles. */
export const PADRAO_FOTO = { tamanho: 100, esmaecer: 60, esmaecerDireita: 0, luzDireita: 0, opacidadeEscuro: 70, opacidadeClaro: 93 };

/** Dois toques ou cliques em uma barra dentro deste intervalo, em ms, voltam ao padrão. */
const INTERVALO_TOQUE_DUPLO = 400;

/** Limites dos ajustes, em %. A API recusa o que passar deles (worker/api/conteudo.js). */
const TAMANHO_MINIMO = 50;
const TAMANHO_MAXIMO = 100;
const OPACIDADE_MINIMA = 10;
const OPACIDADE_MAXIMA = 100;
const ESMAECER_MINIMO = 0;
const ESMAECER_MAXIMO = 100;
const LUZ_MINIMA = -100;
const LUZ_MAXIMA = 100;

/**
 * Dentro do quadro: o tema se troca pela barra da tela de configuração, que não grava nada, então
 * o botão do site não aparece (ele gravaria a preferência do navegador). Sem barra de rolagem,
 * que tiraria largura da tela simulada; a rolagem continua funcionando. .hero-original é a
 * foto como foi enviada, sem opacidade, esmaecimento nem luz, no mesmo lugar e tamanho.
 */
const ESTILO_DO_QUADRO = "#btn-tema{visibility:hidden}html{scrollbar-width:none}" +
    ".hero-original .hero-foto-imagens{opacity:1!important;-webkit-mask-image:none!important;mask-image:none!important}" +
    ".hero-original .hero-foto-luz{display:none!important}";

/** Valor de uma barra como aparece na tela: a luz leva o sinal. */
const comSinal = (valor: number) => `${valor > 0 ? "+" : ""}${valor}%`;

/** Os grupos de ajustes, na ordem em que aparecem. */
const GRUPOS: { id: GrupoAjustes; rotulo: string; ajuda: string }[] = [
    {
        id: "foto",
        rotulo: "Foto",
        ajuda: `Tamanho: de ${TAMANHO_MINIMO}% a ${TAMANHO_MAXIMO}%; no computador a foto fica centralizada na altura e, no celular, encostada no topo da tela. Luz à direita: de ${LUZ_MINIMA}% a +${LUZ_MAXIMA}%, para escurecer ou clarear esse lado do rosto.`
    },
    {
        id: "esmaecer",
        rotulo: "Esmaecer",
        ajuda: `De ${ESMAECER_MINIMO}% a ${ESMAECER_MAXIMO}%, só no computador: aumente do lado em que a foto tem sombra.`
    },
    {
        id: "opacidade",
        rotulo: "Opacidade",
        ajuda: `De ${OPACIDADE_MINIMA}% a ${OPACIDADE_MAXIMA}% em cada tema: em 100% a foto fica nítida, e valores menores a integram ao fundo.`
    }
];

/**
 * As barras, em grupos. grupoVisivel é o grupo da aba escolhida em telas menores, onde só um
 * aparece por vez; com ajuda ligada, cada grupo mostra a própria explicação.
 */
function Controles({ aparencia, aoMudar, grupoVisivel, ajuda }: {
    aparencia: AparenciaHero;
    aoMudar: (campo: string, valor: string) => void;
    grupoVisivel: GrupoAjustes;
    ajuda: boolean;
}) {
    // Conta pelo soltar do ponteiro, não pelo evento de clique duplo, que o toque em uma
    // barra deslizante do celular não dispara.
    const ultimoToque = useRef({ campo: "", tempo: 0 });

    const soltar = (campo: string, padrao: number, tempo: number) => {
        const duplo = ultimoToque.current.campo === campo && tempo - ultimoToque.current.tempo < INTERVALO_TOQUE_DUPLO;

        ultimoToque.current = { campo: duplo ? "" : campo, tempo };
        if (duplo) aoMudar(campo, String(padrao));
    };

    const barra = (campo: string, rotulo: string, valor: number, padrao: number, minimo: number, maximo: number, pontas?: [string, string]) => (
        <label className="controle-opacidade" title={`De ${minimo}% a ${maximo}%. Clique duplo: volta para ${padrao}%`}>
            <span>{rotulo}</span>
            {pontas && <small>{pontas[0]}</small>}
            <input type="range" min={minimo} max={maximo} step={1} value={valor}
                   onChange={e => aoMudar(campo, e.target.value)}
                   onPointerUp={e => soltar(campo, padrao, e.timeStamp)} />
            {pontas && <small>{pontas[1]}</small>}
            <output>{minimo < 0 ? comSinal(valor) : `${valor}%`}</output>
        </label>
    );

    const barras: Record<GrupoAjustes, ReactNode> = {
        foto: (
            <>
                {barra("hero_tamanho", "Tamanho", aparencia.tamanho, PADRAO_FOTO.tamanho, TAMANHO_MINIMO, TAMANHO_MAXIMO)}
                {barra("hero_luz_direita", "Luz à direita", aparencia.luzDireita, PADRAO_FOTO.luzDireita, LUZ_MINIMA, LUZ_MAXIMA, ["Escurecer", "Clarear"])}
            </>
        ),
        esmaecer: (
            <>
                {barra("hero_esmaecer", "À esquerda", aparencia.esmaecer, PADRAO_FOTO.esmaecer, ESMAECER_MINIMO, ESMAECER_MAXIMO)}
                {barra("hero_esmaecer_direita", "À direita", aparencia.esmaecerDireita, PADRAO_FOTO.esmaecerDireita, ESMAECER_MINIMO, ESMAECER_MAXIMO)}
            </>
        ),
        opacidade: (
            <>
                {barra("hero_opacidade_escuro", "Tema escuro", aparencia.opacidadeEscuro, PADRAO_FOTO.opacidadeEscuro, OPACIDADE_MINIMA, OPACIDADE_MAXIMA)}
                {barra("hero_opacidade_claro", "Tema claro", aparencia.opacidadeClaro, PADRAO_FOTO.opacidadeClaro, OPACIDADE_MINIMA, OPACIDADE_MAXIMA)}
            </>
        )
    };

    return (
        <>
            {GRUPOS.map(({ id, rotulo, ajuda: explicacao }) => (
                <div key={id} role="group" aria-label={rotulo} data-oculto={grupoVisivel !== id ? "" : undefined} className="ajustes-grupo">
                    <strong>{rotulo}</strong>
                    {barras[id]}
                    {ajuda && <small className="ajustes-ajuda">{explicacao}</small>}
                </div>
            ))}
        </>
    );
}

/**
 * Tela de configuração da aparência, sem salvar nem publicar: abre a própria landing publicada
 * em um quadro da mesma origem e aplica nela, direto no DOM, o que está escolhido nas barras
 * (tamanho, esmaecimento, opacidades, tema e foto, que vem da API enquanto não for publicada).
 * A landing não tem nenhum código para isso. O sandbox impede que um link tire o painel da página.
 */
function ConfigurarAparencia({ aparencia, aoMudar, aoFechar }: {
    aparencia: AparenciaHero;
    aoMudar: (campo: string, valor: string) => void;
    aoFechar: () => void;
}) {
    const dialogo = useRef<HTMLDialogElement>(null);
    const area = useRef<HTMLDivElement>(null);
    const quadro = useRef<HTMLIFrameElement>(null);
    const [aparelho, setAparelho] = useState<Aparelho>("computador");
    const [tema, setTema] = useState<Tema>("escuro");
    const [original, setOriginal] = useState(false);
    const [grupo, setGrupo] = useState<GrupoAjustes>("foto");
    const [ajuda, setAjuda] = useState(false);
    const [escala, setEscala] = useState(1);
    const tamanho = TAMANHOS[aparelho];
    const { tamanho: tamanhoFoto, esmaecer, esmaecerDireita, luzDireita, opacidadeEscuro, opacidadeClaro, foto, info } = aparencia;

    useEffect(() => {
        const elemento = dialogo.current;
        elemento?.showModal();
        return () => elemento?.close();
    }, []);

    useEffect(() => {
        const elemento = area.current;
        if (!elemento) return;

        const medir = () => setEscala(Math.min(1, elemento.clientWidth / tamanho.largura, elemento.clientHeight / tamanho.altura));
        const observador = new ResizeObserver(medir);
        observador.observe(elemento);
        return () => observador.disconnect();
    }, [tamanho]);

    const aplicar = useCallback(() => {
        const documento = quadro.current?.contentDocument;
        if (!documento) return;

        documento.documentElement.setAttribute("data-tema", tema);

        const hero = documento.querySelector<HTMLElement>(".hero");
        if (!hero) return;

        hero.classList.toggle("hero-original", original);
        hero.style.setProperty("--tamanho-foto", String(tamanhoFoto / 100));
        hero.style.setProperty("--esmaecer-foto", String(esmaecer / 100));
        hero.style.setProperty("--esmaecer-direita-foto", String(esmaecerDireita / 100));
        hero.style.setProperty("--luz-direita-foto", String(luzDireita / 100));
        hero.style.setProperty("--opacidade-foto-escuro", String(opacidadeEscuro / 100));
        hero.style.setProperty("--opacidade-foto-claro", String(opacidadeClaro / 100));

        const copiaLuz = hero.querySelector<HTMLImageElement>(".hero-foto-luz");
        if (copiaLuz) copiaLuz.hidden = luzDireita === 0;

        // A foto e a cópia da luz mostram sempre o mesmo arquivo.
        for (const imagem of hero.querySelectorAll<HTMLImageElement>(".hero-foto img")) {
            if (!foto || !info?.larguras.length) break;

            const srcset = info.larguras.map(largura => `/api/imagens/${foto}/${largura} ${largura}w`).join(", ");
            if (imagem.getAttribute("srcset") !== srcset) {
                imagem.srcset = srcset;
                imagem.src = `/api/imagens/${foto}/${info.larguras[info.larguras.length - 1]}`;
            }
        }
    }, [tema, original, tamanhoFoto, esmaecer, esmaecerDireita, luzDireita, opacidadeEscuro, opacidadeClaro, foto, info]);

    useEffect(aplicar, [aplicar]);

    // Mexer em um ajuste volta para a foto configurada: é nela que o ajuste aparece.
    const mudarAjuste = (campo: string, valor: string) => {
        setOriginal(false);
        aoMudar(campo, valor);
    };

    // As seis barras voltam ao padrão no formulário; como as demais mudanças, só vale ao salvar.
    const noPadrao = tamanhoFoto === PADRAO_FOTO.tamanho && esmaecer === PADRAO_FOTO.esmaecer
        && esmaecerDireita === PADRAO_FOTO.esmaecerDireita && luzDireita === PADRAO_FOTO.luzDireita
        && opacidadeEscuro === PADRAO_FOTO.opacidadeEscuro && opacidadeClaro === PADRAO_FOTO.opacidadeClaro;

    const voltarAoPadrao = () => {
        mudarAjuste("hero_tamanho", String(PADRAO_FOTO.tamanho));
        mudarAjuste("hero_esmaecer", String(PADRAO_FOTO.esmaecer));
        mudarAjuste("hero_esmaecer_direita", String(PADRAO_FOTO.esmaecerDireita));
        mudarAjuste("hero_luz_direita", String(PADRAO_FOTO.luzDireita));
        mudarAjuste("hero_opacidade_escuro", String(PADRAO_FOTO.opacidadeEscuro));
        mudarAjuste("hero_opacidade_claro", String(PADRAO_FOTO.opacidadeClaro));
    };

    const carregou = (evento: SyntheticEvent<HTMLIFrameElement>) => {
        const documento = evento.currentTarget.contentDocument;

        if (documento) {
            const estilo = documento.createElement("style");
            estilo.textContent = ESTILO_DO_QUADRO;
            documento.head.append(estilo);

            // O formulário de contato do quadro não envia: seria uma mensagem de verdade.
            documento.addEventListener("submit", e => {
                e.preventDefault();
                e.stopImmediatePropagation();
            }, true);
        }

        aplicar();
    };

    return (
        // Enter em um controle não pode enviar o formulário do perfil, que envolve este diálogo.
        <dialog ref={dialogo} className="config-foto-landing" aria-label="Configurar a aparência da foto do topo"
                onCancel={evento => { evento.preventDefault(); aoFechar(); }}
                onKeyDown={evento => { if (evento.key === "Enter" && evento.target instanceof HTMLInputElement) evento.preventDefault(); }}>
            <div className="config-foto-barra">
                <div className="config-foto-acoes">
                    <button type="button" className="botao" aria-pressed={original} title={original ? "Ver configurada" : "Ver original"}
                            aria-label={original ? "Ver configurada" : "Ver original"} onClick={() => setOriginal(o => !o)}>
                        <Icone nome="fal:camera" /> <span className="config-foto-rotulo">{original ? "Ver configurada" : "Ver original"}</span>
                    </button>
                    <button type="button" className="botao config-foto-padrao" title="Voltar ao padrão" aria-label="Voltar ao padrão"
                            disabled={noPadrao} onClick={voltarAoPadrao}>
                        <Icone nome="fal:history" /> <span className="config-foto-rotulo">Voltar ao padrão</span>
                    </button>
                    <button type="button" className="botao" aria-pressed={ajuda} title="Ajuda" aria-label="Ajuda" onClick={() => setAjuda(a => !a)}>
                        <Icone nome="fal:info-circle" /> <span className="config-foto-rotulo">Ajuda</span>
                    </button>
                    <div className="segmentado" role="radiogroup" aria-label="Tema do site">
                        <label title="Tema escuro"><input type="radio" name="config-foto-tema" aria-label="Tema escuro" checked={tema === "escuro"} onChange={() => setTema("escuro")} /><span><Icone nome="fas:moon" /> <span className="config-foto-rotulo">Escuro</span></span></label>
                        <label title="Tema claro"><input type="radio" name="config-foto-tema" aria-label="Tema claro" checked={tema === "claro"} onChange={() => setTema("claro")} /><span><Icone nome="fas:sun" /> <span className="config-foto-rotulo">Claro</span></span></label>
                    </div>
                    <div className="segmentado" role="radiogroup" aria-label="Tamanho da tela">
                        <label title="Tela de computador"><input type="radio" name="config-foto-aparelho" aria-label="Tela de computador" checked={aparelho === "computador"} onChange={() => setAparelho("computador")} /><span><Icone nome="fal:laptop-code" /> <span className="config-foto-rotulo">Computador</span></span></label>
                        <label title="Tela de celular"><input type="radio" name="config-foto-aparelho" aria-label="Tela de celular" checked={aparelho === "celular"} onChange={() => setAparelho("celular")} /><span><Icone nome="fal:mobile-alt" /> <span className="config-foto-rotulo">Celular</span></span></label>
                    </div>
                    <button type="button" className="botao config-foto-fechar" title="Fechar" aria-label="Fechar" onClick={aoFechar}>
                        <Icone nome="fal:times" /> <span className="config-foto-rotulo">Fechar</span>
                    </button>
                </div>
                {ajuda && (
                    <small className="config-foto-nota">
                        O site aparece como está publicado, com esta foto e estas escolhas; textos ainda não publicados não aparecem. Clique ou toque duplo em uma barra volta ao padrão dela. Nada fica gravado aqui: as escolhas só valem depois de fechar esta tela e salvar o perfil.
                    </small>
                )}
                <div className="config-foto-ajustes">
                    <Controles aparencia={aparencia} aoMudar={mudarAjuste} grupoVisivel={grupo} ajuda={ajuda} />
                </div>
                <div className="segmentado config-foto-abas" role="radiogroup" aria-label="Grupo de ajustes">
                    {GRUPOS.map(({ id, rotulo }) => (
                        <label key={id}><input type="radio" name="config-foto-grupo" checked={grupo === id} onChange={() => setGrupo(id)} /><span>{rotulo}</span></label>
                    ))}
                </div>
            </div>
            <div ref={area} className="config-foto-area">
                <div className="config-foto-caixa" style={{ width: tamanho.largura * escala, height: tamanho.altura * escala }}>
                    <iframe ref={quadro} src="/" title="Portfólio com as escolhas atuais" sandbox="allow-same-origin allow-scripts"
                            className="config-foto-quadro" onLoad={carregou}
                            style={{ width: tamanho.largura, height: tamanho.altura, transform: `scale(${escala})` }} />
                </div>
            </div>
        </dialog>
    );
}

/** Resumo do que está escolhido para a foto do topo e o botão que abre a tela de configuração. */
export function CamposAparenciaHero({ aparencia, aoMudar }: {
    aparencia: AparenciaHero;
    aoMudar: (campo: string, valor: string) => void;
}) {
    const [configurando, setConfigurando] = useState(false);

    return (
        <div className="aparencia-hero">
            <strong>Aparência no site</strong>
            <small>Abre o site com esta foto para ajustar o tamanho, a luz, o esmaecimento e a opacidade vendo o resultado. As escolhas só valem depois de salvar o perfil.</small>
            <dl className="aparencia-resumo">
                <div><dt>Tamanho</dt><dd>{aparencia.tamanho}%</dd></div>
                <div><dt>Luz à direita</dt><dd>{comSinal(aparencia.luzDireita)}</dd></div>
                <div><dt>Esmaecer à esquerda</dt><dd>{aparencia.esmaecer}%</dd></div>
                <div><dt>Esmaecer à direita</dt><dd>{aparencia.esmaecerDireita}%</dd></div>
                <div><dt>Opacidade no tema escuro</dt><dd>{aparencia.opacidadeEscuro}%</dd></div>
                <div><dt>Opacidade no tema claro</dt><dd>{aparencia.opacidadeClaro}%</dd></div>
            </dl>
            <div className="botoes">
                <button type="button" className="botao" onClick={() => setConfigurando(true)}>
                    <Icone nome="fal:paint-brush" /> Configurar aparência
                </button>
            </div>
            {configurando && <ConfigurarAparencia aparencia={aparencia} aoMudar={aoMudar} aoFechar={() => setConfigurando(false)} />}
        </div>
    );
}
