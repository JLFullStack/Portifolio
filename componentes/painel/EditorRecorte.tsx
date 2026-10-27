"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

/** Retângulo da imagem original (em pixels dela) que vai virar a imagem enviada. */
export type Recorte = { x: number; y: number; largura: number; altura: number };

/** Até quanto se pode aproximar, além do enquadramento inicial que cobre a moldura. */
const ZOOM_MAXIMO = 5;

const TEXTOS = {
    pt: {
        titulo: "Ajustar a imagem",
        dica: "Arraste para escolher a parte que aparece. Use o controle, a roda do mouse ou dois dedos para o zoom.",
        zoom: "Zoom",
        centralizar: "Centralizar",
        cancelar: "Cancelar",
        usar: "Usar esta parte",
        moldura: "Área da imagem que será usada. Arraste ou use as setas do teclado; + e − mudam o zoom.",
        pequena: (largura: number) => `O recorte tem ${largura} px de largura e pode perder nitidez no site. Diminua o zoom ou use uma foto maior.`
    },
    en: {
        titulo: "Adjust the image",
        dica: "Drag to choose the part that shows. Use the slider, the mouse wheel, or two fingers to zoom.",
        zoom: "Zoom",
        centralizar: "Center",
        cancelar: "Cancel",
        usar: "Use this part",
        moldura: "Area of the image that will be used. Drag or use the arrow keys; + and − change the zoom.",
        pequena: (largura: number) => `The crop is ${largura} px wide and may look blurry on the site. Zoom out or use a larger photo.`
    }
};

type Vista = { zoom: number; x: number; y: number };
type Medida = { largura: number; altura: number };

/**
 * Editor de enquadramento, como o do Instagram: a moldura tem a proporção de destino
 * (370 × 512 nos projetos, círculo nas fotos de perfil) e a imagem se move e aproxima
 * por baixo dela. Arrastar move; controle deslizante, roda do mouse, pinça com dois
 * dedos ou + e − fazem o zoom, sempre em torno do ponto indicado. A imagem nunca
 * deixa a moldura com vão vazio.
 *
 * Tudo é feito no navegador: o resultado é só o retângulo da imagem original
 * (`Recorte`), que redimensionar.ts usa ao gerar as versões em WebP.
 */
export function EditorRecorte({ url, proporcao, redonda = false, larguraIdeal, idioma = "pt", aoConfirmar, aoCancelar }: {
    url: string;
    /** largura ÷ altura da moldura */
    proporcao: number;
    redonda?: boolean;
    /** a maior largura que o site usa: abaixo dela, o aviso de nitidez */
    larguraIdeal: number;
    idioma?: "pt" | "en";
    aoConfirmar: (recorte: Recorte) => void;
    aoCancelar: () => void;
}) {
    const t = TEXTOS[idioma];
    const dialogo = useRef<HTMLDialogElement>(null);
    const moldura = useRef<HTMLDivElement>(null);
    const imagem = useRef<HTMLImageElement>(null);
    const ponteiros = useRef(new Map<number, { x: number; y: number }>());
    const pinca = useRef<{ distancia: number; zoom: number } | null>(null);
    const [natural, setNatural] = useState<Medida | null>(null);
    const [caixa, setCaixa] = useState<Medida | null>(null);
    const [vista, setVista] = useState<Vista>({ zoom: 1, x: 0, y: 0 });

    // Escala em que a imagem cobre a moldura exatamente (zoom 1).
    const base = natural && caixa ? Math.max(caixa.largura / natural.largura, caixa.altura / natural.altura) : 1;
    const escala = base * vista.zoom;

    useEffect(() => {
        dialogo.current?.showModal();
    }, []);

    // Tamanho original da imagem. Ouvinte nativo, e medida imediata se ela já carregou:
    // o onLoad do React se perde quando a imagem termina antes de ele ser ligado (cache).
    useEffect(() => {
        const elemento = imagem.current;
        if (!elemento) return;

        const medir = () => {
            if (elemento.naturalWidth) setNatural({ largura: elemento.naturalWidth, altura: elemento.naturalHeight });
        };

        if (elemento.complete) medir();
        elemento.addEventListener("load", medir);
        return () => elemento.removeEventListener("load", medir);
    }, [url]);

    // Tamanho da moldura na tela (muda com a janela).
    useEffect(() => {
        const elemento = moldura.current;
        if (!elemento) return;

        const medir = () => setCaixa({ largura: elemento.clientWidth, altura: elemento.clientHeight });
        const observador = new ResizeObserver(medir);

        medir();
        observador.observe(elemento);
        return () => observador.disconnect();
    }, []);

    /** Mantém a imagem cobrindo a moldura inteira, sem vão em nenhum lado. */
    const limitar = (v: Vista): Vista => {
        if (!natural || !caixa) return v;

        const largura = natural.largura * base * v.zoom;
        const altura = natural.altura * base * v.zoom;

        return {
            zoom: v.zoom,
            x: Math.min(0, Math.max(caixa.largura - largura, v.x)),
            y: Math.min(0, Math.max(caixa.altura - altura, v.y))
        };
    };

    const centralizar = () => {
        if (!natural || !caixa) return;
        setVista({ zoom: 1, x: (caixa.largura - natural.largura * base) / 2, y: (caixa.altura - natural.altura * base) / 2 });
    };

    // Enquadramento inicial: imagem centrada cobrindo a moldura (e de novo se a moldura mudar de tamanho).
    useEffect(centralizar, [natural, caixa?.largura, caixa?.altura]);

    /** Zoom em torno de um ponto da moldura (o cursor, o meio dos dedos ou o centro). */
    const zoomEm = (calcular: (atual: number) => number, ponto?: { x: number; y: number }) => {
        if (!caixa) return;

        setVista(v => {
            const zoom = Math.min(ZOOM_MAXIMO, Math.max(1, calcular(v.zoom)));
            const p = ponto ?? { x: caixa.largura / 2, y: caixa.altura / 2 };
            const fator = zoom / v.zoom;

            return limitar({ zoom, x: p.x - (p.x - v.x) * fator, y: p.y - (p.y - v.y) * fator });
        });
    };

    const mover = (dx: number, dy: number) => setVista(v => limitar({ ...v, x: v.x + dx, y: v.y + dy }));

    // Roda do mouse: ouvinte nativo, porque o do React é passivo e não pode impedir a rolagem da página.
    useEffect(() => {
        const elemento = moldura.current;
        if (!elemento) return;

        const rodar = (evento: WheelEvent) => {
            evento.preventDefault();
            const retangulo = elemento.getBoundingClientRect();
            zoomEm(z => z * Math.exp(-evento.deltaY * 0.0015), { x: evento.clientX - retangulo.left, y: evento.clientY - retangulo.top });
        };

        elemento.addEventListener("wheel", rodar, { passive: false });
        return () => elemento.removeEventListener("wheel", rodar);
    });

    const distancia = () => {
        const [a, b] = [...ponteiros.current.values()];
        return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const apertar = (evento: PointerEvent<HTMLDivElement>) => {
        // Captura o ponteiro para o arrasto seguir mesmo saindo da moldura (falha se ele já foi solto).
        try { evento.currentTarget.setPointerCapture(evento.pointerId); } catch { /* segue sem captura */ }
        ponteiros.current.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
        if (ponteiros.current.size === 2) pinca.current = { distancia: distancia(), zoom: vista.zoom };
    };

    const arrastar = (evento: PointerEvent<HTMLDivElement>) => {
        const anterior = ponteiros.current.get(evento.pointerId);
        if (!anterior) return;

        ponteiros.current.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });

        if (ponteiros.current.size === 1) {
            mover(evento.clientX - anterior.x, evento.clientY - anterior.y);
        } else if (ponteiros.current.size === 2 && pinca.current) {
            const [a, b] = [...ponteiros.current.values()];
            const retangulo = evento.currentTarget.getBoundingClientRect();
            const inicial = pinca.current;

            zoomEm(() => inicial.zoom * (distancia() / inicial.distancia),
                { x: (a.x + b.x) / 2 - retangulo.left, y: (a.y + b.y) / 2 - retangulo.top });
        }
    };

    const soltar = (evento: PointerEvent<HTMLDivElement>) => {
        ponteiros.current.delete(evento.pointerId);
        if (ponteiros.current.size < 2) pinca.current = null;
    };

    const teclar = (evento: KeyboardEvent<HTMLDivElement>) => {
        const passo = evento.shiftKey ? 40 : 10;
        const acoes: Record<string, () => void> = {
            ArrowLeft: () => mover(passo, 0),
            ArrowRight: () => mover(-passo, 0),
            ArrowUp: () => mover(0, passo),
            ArrowDown: () => mover(0, -passo),
            "+": () => zoomEm(z => z * 1.1),
            "=": () => zoomEm(z => z * 1.1),
            "-": () => zoomEm(z => z / 1.1)
        };

        if (acoes[evento.key]) {
            evento.preventDefault();
            acoes[evento.key]();
        }
    };

    const recorte = (): Recorte | null => {
        if (!natural || !caixa) return null;

        const largura = Math.min(natural.largura, caixa.largura / escala);
        const altura = Math.min(natural.altura, caixa.altura / escala);

        return {
            x: Math.max(0, Math.min(natural.largura - largura, -vista.x / escala)),
            y: Math.max(0, Math.min(natural.altura - altura, -vista.y / escala)),
            largura,
            altura
        };
    };

    const atual = recorte();
    const pequena = atual && atual.largura < larguraIdeal ? Math.round(atual.largura) : null;

    return (
        // Esc dispara "cancel" no <dialog>: vale como Cancelar.
        <dialog ref={dialogo} className="editor-recorte" aria-labelledby="editor-recorte-titulo"
                onCancel={evento => { evento.preventDefault(); aoCancelar(); }}>
            <h2 id="editor-recorte-titulo">{t.titulo}</h2>
            <p className="cartao-nota">{t.dica}</p>

            <div ref={moldura} className={redonda ? "recorte-moldura recorte-redonda" : "recorte-moldura"}
                 style={{ aspectRatio: proporcao, width: `min(100%, calc(58dvh * ${proporcao}))` }}
                 tabIndex={0} role="application" aria-label={t.moldura}
                 onPointerDown={apertar} onPointerMove={arrastar} onPointerUp={soltar} onPointerCancel={soltar}
                 onKeyDown={teclar}>
                <img ref={imagem} src={url} alt="" draggable={false}
                     style={natural ? {
                         width: natural.largura * base,
                         height: natural.altura * base,
                         transform: `translate(${vista.x}px, ${vista.y}px) scale(${vista.zoom})`
                     } : { visibility: "hidden" }} />
                <span className="recorte-grade" aria-hidden="true" />
            </div>

            <label className="campo recorte-zoom">
                <span>{t.zoom}</span>
                <input type="range" min={1} max={ZOOM_MAXIMO} step={0.01} value={vista.zoom}
                       onChange={evento => zoomEm(() => Number(evento.target.value))} />
            </label>

            {pequena && <p className="aviso aviso-info">{t.pequena(pequena)}</p>}

            <div className="botoes">
                <button type="button" className="botao botao-primario" disabled={!atual} onClick={() => atual && aoConfirmar(atual)}>{t.usar}</button>
                <button type="button" className="botao" onClick={centralizar}>{t.centralizar}</button>
                <button type="button" className="botao" onClick={aoCancelar}>{t.cancelar}</button>
            </div>
        </dialog>
    );
}
