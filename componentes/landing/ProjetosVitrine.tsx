"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";

type ItemVitrine = {
    id: number;
    titulo: string;
    /** Rótulo do botão de ampliar; null quando o projeto não tem imagem. */
    rotuloAmpliar: string | null;
    info: ReactNode;
    card: ReactNode;
    fundo: ReactNode;
};

/** A imagem que está ampliada e de onde ela saiu (para voltar ao mesmo lugar). */
type Ampliada = { id: number; titulo: string; src: string; srcSet: string; alt: string; origem: DOMRect };

const EASING_ABRIR = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const EASING_FECHAR = "cubic-bezier(0.4, 0, 0.2, 1)";

const movimentoReduzido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Folga à esquerda da faixa (padding-left): é ali, e não na borda, que o card ativo para. */
const folgaEsquerda = (faixa: HTMLElement) => parseFloat(getComputedStyle(faixa).paddingLeft) || 0;

/** O transform que leva o retângulo `destino` (já na tela) a ocupar o lugar de `origem`. */
function inverter(origem: DOMRect, destino: DOMRect): string {
    return `translate(${origem.left - destino.left}px, ${origem.top - destino.top}px) scale(${origem.width / destino.width}, ${origem.height / destino.height})`;
}

/**
 * Mantém o texto da esquerda em sincronia com a faixa de cards: o card mais
 * próximo da borda esquerda da faixa é o ativo. Os textos, os cards e as imagens de
 * fundo chegam prontos do servidor; aqui só se alterna a classe .ativo (o fundo do
 * projeto ativo aparece com fade, os outros somem).
 *
 * Clicar na imagem do card ativo a amplia com FLIP: a imagem ampliada nasce no
 * lugar e no tamanho do card (transform invertido) e anima até o centro da tela;
 * ao fechar, faz o caminho de volta. Clicar num card inativo o traz para o destaque.
 *
 * Para a animação ficar fluida (inclusive no celular): só transform, pelo Web
 * Animations API (nada de border-radius animado nem desfoque no fundo); a versão
 * maior da imagem só é pedida depois que a abertura termina; a página não é travada
 * (rolar fecha a imagem); e o card volta a mostrar a imagem no mesmo quadro em que
 * o diálogo fecha.
 */
export function ProjetosVitrine({ projetos, rotuloVitrine, rotuloFechar, iconeAmpliar, iconeFechar, controles }: {
    projetos: ItemVitrine[];
    rotuloVitrine: string;
    rotuloFechar: string;
    iconeAmpliar: ReactNode;
    iconeFechar: ReactNode;
    controles: ReactNode;
}) {
    const faixa = useRef<HTMLUListElement>(null);
    const dialogo = useRef<HTMLDialogElement>(null);
    const imagemAmpliada = useRef<HTMLImageElement>(null);
    const fechando = useRef(false);
    const [ativo, setAtivo] = useState(projetos[0]?.id);
    const [ampliada, setAmpliada] = useState<Ampliada | null>(null);
    // Depois da abertura, o srcset entra e o navegador pode trocar pela versão maior.
    const [nitida, setNitida] = useState(false);

    useEffect(() => {
        const elemento = faixa.current;

        if (!elemento) return;

        const atualizar = () => {
            // Distância medida entre as bordas visíveis: offsetLeft seria relativo
            // ao offsetParent, não à faixa. O card ativo para depois da folga esquerda
            // da faixa (o padding onde cabe o brilho dele).
            const borda = elemento.getBoundingClientRect().left + folgaEsquerda(elemento);
            let maisProximo: HTMLElement | undefined;
            let menorDistancia = Infinity;

            for (const card of Array.from(elemento.children) as HTMLElement[]) {
                const distancia = Math.abs(card.getBoundingClientRect().left - borda);

                if (distancia < menorDistancia) {
                    menorDistancia = distancia;
                    maisProximo = card;
                }
            }

            if (maisProximo?.dataset.projeto) setAtivo(Number(maisProximo.dataset.projeto));
        };

        elemento.addEventListener("scroll", atualizar, { passive: true });
        atualizar();

        return () => elemento.removeEventListener("scroll", atualizar);
    }, []);

    /** A imagem do card de um projeto, na faixa. */
    const imagemDoCard = (id: number) => faixa.current?.querySelector<HTMLImageElement>(`[data-projeto="${id}"] img.projeto-imagem`);

    const clicarCard = async (projeto: ItemVitrine, evento: MouseEvent<HTMLButtonElement>) => {
        const card = evento.currentTarget.closest("li");
        const elementoFaixa = faixa.current;

        // Card inativo: rola até ele, que vira o destaque.
        if (projeto.id !== ativo) {
            if (card && elementoFaixa) {
                const deslocamento = card.getBoundingClientRect().left - elementoFaixa.getBoundingClientRect().left - folgaEsquerda(elementoFaixa);
                elementoFaixa.scrollTo({ left: elementoFaixa.scrollLeft + deslocamento, behavior: "smooth" });
            }
            return;
        }

        const imagem = imagemDoCard(projeto.id);
        if (!imagem) return;

        // A ampliada é outro <img>: no celular, sem decodificar antes, o primeiro quadro
        // saía em branco e a tela piscava. Decodifica e só então abre.
        const src = imagem.currentSrc || imagem.src;
        const previa = new Image();
        previa.src = src;
        await previa.decode().catch(() => undefined);

        setAmpliada({
            id: projeto.id,
            titulo: projeto.titulo,
            src,
            srcSet: imagem.srcset,
            alt: imagem.alt,
            // Medida depois da espera: se algo se mexeu, a viagem sai do lugar certo.
            origem: imagem.getBoundingClientRect()
        });
    };

    // Abre: mostra o diálogo com a imagem já no tamanho final e a anima a partir do card.
    useLayoutEffect(() => {
        const elemento = dialogo.current;
        const alvo = imagemAmpliada.current;
        if (!ampliada || !elemento || !alvo) return;

        elemento.showModal();
        if (movimentoReduzido()) {
            setNitida(true);
            return;
        }

        const animacao = alvo.animate(
            [{ transform: inverter(ampliada.origem, alvo.getBoundingClientRect()) }, { transform: "none" }],
            { duration: 600, easing: EASING_ABRIR }
        );
        animacao.onfinish = () => setNitida(true);
    }, [ampliada]);

    // Fecha: anima de volta até onde o card está agora e só então fecha o diálogo.
    const fechar = () => {
        const elemento = dialogo.current;
        const alvo = imagemAmpliada.current;
        if (!ampliada || !elemento || !alvo || fechando.current) return;

        const terminar = () => {
            fechando.current = false;
            // Primeiro o card volta a mostrar a imagem (e a ampliada sai), no mesmo
            // quadro em que o diálogo fecha: sem o instante em que ela não está em lugar nenhum.
            flushSync(() => {
                setAmpliada(null);
                setNitida(false);
            });
            elemento.classList.remove("fechando");
            elemento.close();
        };

        if (movimentoReduzido()) {
            terminar();
            return;
        }

        fechando.current = true;
        elemento.classList.add("fechando");

        const destino = imagemDoCard(ampliada.id)?.getBoundingClientRect() ?? ampliada.origem;
        const animacao = alvo.animate(
            [{ transform: "none" }, { transform: inverter(destino, alvo.getBoundingClientRect()) }],
            { duration: 420, easing: EASING_FECHAR, fill: "forwards" }
        );
        animacao.onfinish = terminar;
    };

    // A página não é travada enquanto a imagem está aberta (travar fazia a tela do
    // celular piscar): se a pessoa rolar, a imagem volta para o card.
    const fecharAoRolar = useRef(fechar);
    fecharAoRolar.current = fechar;

    // Só depois da abertura: o foco no × ao abrir pode gerar um evento de rolagem.
    useEffect(() => {
        if (!ampliada || !nitida) return;

        const rolar = () => fecharAoRolar.current();
        window.addEventListener("scroll", rolar, { passive: true, once: true });
        return () => window.removeEventListener("scroll", rolar);
    }, [ampliada, nitida]);

    const comFundo = projetos.filter(projeto => projeto.fundo);

    return (
        <>
            {comFundo.length > 0 && (
                <div className="projetos-fundos" aria-hidden="true">
                    {comFundo.map(projeto => (
                        <div key={projeto.id} className={projeto.id === ativo ? "projeto-fundo ativo" : "projeto-fundo"}>
                            {projeto.fundo}
                        </div>
                    ))}
                </div>
            )}

            {/* Texto e vitrine se revelam cada um quando entra na tela (RevelarAoRolar);
                os cards da vitrine entram deslizando, um depois do outro (--indice). */}
            <div className="projetos-info revelar revelar-tarde">
                {projetos.map(projeto => (
                    <article key={projeto.id} className={projeto.id === ativo ? "projeto-info ativo" : "projeto-info"}>
                        {projeto.info}
                    </article>
                ))}
            </div>

            <div className="projetos-vitrine revelar revelar-tarde" style={{ "--indice": 1 } as CSSProperties}>
                {/* tabIndex torna a faixa rolável pelo teclado (setas). */}
                <ul className="projetos-faixa" id="projetos-faixa" ref={faixa} tabIndex={0} aria-label={rotuloVitrine}>
                    {projetos.map((projeto, indice) => {
                        const classes = ["projeto-card", projeto.id === ativo && "ativo", projeto.id === ampliada?.id && "ampliando"];

                        return (
                            <li key={projeto.id} data-projeto={projeto.id} style={{ "--indice": indice } as CSSProperties}
                                className={classes.filter(Boolean).join(" ")}>
                                {projeto.card}

                                {/* Só o card ativo entra no Tab; nos outros o clique só o traz para o destaque. */}
                                {projeto.rotuloAmpliar && (
                                    <button type="button" className="projeto-ampliar" aria-label={projeto.rotuloAmpliar}
                                            tabIndex={projeto.id === ativo ? 0 : -1} onClick={evento => clicarCard(projeto, evento)}>
                                        <span className="projeto-ampliar-icone" aria-hidden="true">{iconeAmpliar}</span>
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>

                {controles}
            </div>

            {/* Esc dispara "cancel": vira o fechamento animado. Qualquer clique na tela, na
                imagem ou fora dela, também fecha (o do × chega aqui e o fechando o ignora). */}
            <dialog ref={dialogo} className="projeto-ampliado" aria-label={ampliada?.titulo}
                    onCancel={evento => { evento.preventDefault(); fechar(); }}
                    onClick={fechar}>
                {ampliada && (
                    // O foco inicial do diálogo fica na figura, não no ×: o anel de foco
                    // aparecendo e sumindo no botão também piscava no celular.
                    <figure className="projeto-ampliado-figura" tabIndex={-1} autoFocus>
                        <img ref={imagemAmpliada} className="projeto-ampliado-imagem" src={ampliada.src} decoding="sync"
                             srcSet={nitida ? ampliada.srcSet : undefined} sizes="min(90vw, 56dvh)" alt={ampliada.alt} />
                        <figcaption className="projeto-ampliado-legenda">{ampliada.titulo}</figcaption>
                        <button type="button" className="botao-icone projeto-ampliado-fechar" aria-label={rotuloFechar} onClick={fechar}>
                            {iconeFechar}
                        </button>
                    </figure>
                )}
            </dialog>
        </>
    );
}
