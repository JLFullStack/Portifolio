"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { InfoImagem } from "@/lib/painel";
import { Icone } from "@/componentes/icones/Icone";
import { Aviso, useAcao } from "./Campos";
import { EditorRecorte, type Recorte } from "./EditorRecorte";
import { enviarImagem, type ImagemEnviada } from "./redimensionar";

/** Endereço da versão da imagem mais próxima de `alvo` px (no painel, lida do D1 pelo Worker). */
export function urlImagem(id: string, info: InfoImagem | undefined, alvo = 360): string | null {
    if (!info?.larguras.length) return null;

    const largura = info.larguras.find(l => l >= alvo) ?? info.larguras[info.larguras.length - 1];
    return `/api/imagens/${id}/${largura}`;
}

/** Endereços das versões guardadas, da maior para a menor: o Ajustar parte da maior que abrir. */
function urlsVersoes(id: string | null, info: InfoImagem | undefined): string[] {
    return id && info ? [...info.larguras].sort((a, b) => b - a).map(largura => `/api/imagens/${id}/${largura}`) : [];
}

/**
 * Miniatura da imagem (ou a caixa vazia). `formato`: "retrato" (370 × 512, imagens dos
 * projetos), "redonda" (fotos de perfil e de depoentes), "larga" (16:9, fundo dos
 * projetos) ou "livre" (a proporção da própria imagem, como a foto recortada do topo).
 */
export type FormatoImagem = "retrato" | "redonda" | "larga" | "livre";

export function Previa({ id, info, formato = "retrato", alt }: {
    id: string | null;
    info?: InfoImagem;
    formato?: FormatoImagem;
    alt: string;
}) {
    const url = id ? urlImagem(id, info, formato === "larga" ? 640 : 360) : null;

    return (
        <div className={`previa previa-${formato}`}>
            {url ? (
                <img src={url} alt={alt} loading="lazy" />
            ) : (
                <div className="previa-vazia"><Icone nome="fal:image" /><span>Sem imagem</span></div>
            )}
        </div>
    );
}

/**
 * Botões que escolhem um arquivo, abrem o EditorRecorte (posição e zoom), reduzem e
 * convertem no navegador e enviam ao D1. `larguras`: as versões a gerar (as que a
 * landing pede no srcset). `proporcao` (largura ÷ altura) é a da moldura; sem ela, vale
 * a proporção da própria imagem. `redonda` mostra a moldura em círculo (fotos de perfil).
 * `atual`: as versões da imagem já escolhida (urlsVersoes); com elas aparece o Ajustar,
 * que reabre o editor na maior.
 * `acoes`: botões a mais na mesma linha (remover...).
 */
export function EnviarImagem({ larguras, proporcao, redonda = false, rotulo = "Enviar imagem", idioma = "pt", atual, acoes, aoEnviar }: {
    larguras: number[];
    proporcao?: number;
    redonda?: boolean;
    rotulo?: string;
    idioma?: "pt" | "en";
    atual?: string[];
    acoes?: ReactNode;
    aoEnviar: (imagem: ImagemEnviada) => void | Promise<void>;
}) {
    const entrada = useRef<HTMLInputElement>(null);
    const [pendente, setPendente] = useState<{ arquivo: File; url: string } | null>(null);
    const { executando, aviso, executar } = useAcao();
    const portugues = idioma === "pt";

    // A prévia do editor é um blob: local; libera a memória quando ele fecha.
    useEffect(() => () => { if (pendente) URL.revokeObjectURL(pendente.url); }, [pendente]);

    const limparEntrada = () => {
        if (entrada.current) entrada.current.value = "";
    };

    const enviar = async (arquivo: File, recorte?: Recorte) => {
        await executar(async () => {
            const imagem = await enviarImagem(arquivo, larguras, recorte);
            await aoEnviar(imagem);
        });
        limparEntrada();
    };

    const escolher = (arquivo: File | undefined) => {
        if (!arquivo) return;
        if (arquivo.type.startsWith("image/")) setPendente({ arquivo, url: URL.createObjectURL(arquivo) });
        else enviar(arquivo);
    };

    // Ajustar: baixa a maior versão guardada que o navegador consiga abrir e a leva ao
    // editor, como se fosse um arquivo novo.
    const ajustar = () => executar(async () => {
        for (const url of atual ?? []) {
            const resposta = await fetch(url).catch(() => null);
            if (!resposta?.ok) continue;

            const blob = await resposta.blob();
            const legivel = await createImageBitmap(blob).then(bitmap => { bitmap.close(); return true; }, () => false);
            if (!legivel) continue;

            escolher(new File([blob], "atual.webp", { type: blob.type || "image/webp" }));
            return;
        }

        throw new Error(portugues ? "Não foi possível abrir a imagem atual. Envie a foto de novo." : "Could not open the current image. Upload it again.");
    });

    return (
        <div className="enviar-imagem">
            <div className="botoes">
                <label className={`botao${atual?.length ? "" : " botao-primario"}`} aria-disabled={executando}>
                    <Icone nome={atual?.length ? "fal:upload" : "fal:camera"} />
                    {executando ? (portugues ? "Enviando…" : "Uploading…") : rotulo}
                    <input ref={entrada} type="file" accept="image/*" disabled={executando}
                           onChange={e => escolher(e.target.files?.[0])} />
                </label>
                {atual?.length ? (
                    <button type="button" className="botao" disabled={executando} onClick={ajustar}>
                        <Icone nome="fal:crop-alt" /> {portugues ? "Ajustar" : "Adjust"}
                    </button>
                ) : null}
                {acoes}
            </div>
            <Aviso aviso={aviso} />

            {pendente && (
                <EditorRecorte url={pendente.url} proporcao={proporcao} redonda={redonda} idioma={idioma}
                               larguraIdeal={Math.max(...larguras)}
                               aoCancelar={() => { setPendente(null); limparEntrada(); }}
                               aoConfirmar={recorte => { const { arquivo } = pendente; setPendente(null); enviar(arquivo, recorte); }} />
            )}
        </div>
    );
}

/**
 * Bloco de uma imagem do painel: título, dica, prévia e as ações (trocar, ajustar e,
 * com `aoRemover`, remover). Todo lugar que manipula imagem usa este bloco, para ter
 * as mesmas funções. `children` entra depois das ações (descrição, ordem...).
 */
export function CampoImagem({ rotulo, dica, id, info, formato, larguras, proporcao, rotuloEnviar, idioma = "pt", selo, aoEnviar, aoRemover, children }: {
    rotulo?: string;
    dica?: ReactNode;
    id: string | null;
    info?: InfoImagem;
    formato: FormatoImagem;
    larguras: number[];
    proporcao?: number;
    rotuloEnviar?: string;
    idioma?: "pt" | "en";
    selo?: ReactNode;
    aoEnviar: (imagem: ImagemEnviada) => void | Promise<void>;
    aoRemover?: () => void;
    children?: ReactNode;
}) {
    const portugues = idioma === "pt";

    return (
        <div className={`campo-imagem campo-imagem-${formato}`}>
            {(rotulo || dica) && (
                <div className="campo-imagem-texto">
                    {rotulo && <strong>{rotulo}</strong>}
                    {dica && <small>{dica}</small>}
                </div>
            )}
            <div className="campo-imagem-previa">
                <Previa id={id} info={info} formato={formato} alt={rotulo ?? ""} />
                {selo}
            </div>
            <EnviarImagem larguras={larguras} proporcao={proporcao} redonda={formato === "redonda"} idioma={idioma}
                          rotulo={rotuloEnviar ?? (id ? (portugues ? "Trocar" : "Replace") : (portugues ? "Escolher imagem" : "Choose image"))}
                          atual={urlsVersoes(id, info)} aoEnviar={aoEnviar}
                          acoes={id && aoRemover && (
                              <button type="button" className="botao botao-perigo" onClick={aoRemover}>
                                  <Icone nome="fal:trash-alt" /> {portugues ? "Remover" : "Remove"}
                              </button>
                          )} />
            {children}
        </div>
    );
}
