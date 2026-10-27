"use client";

import { useEffect, useRef, useState } from "react";
import type { InfoImagem } from "@/lib/painel";
import { Aviso, useAcao } from "./Campos";
import { EditorRecorte, type Recorte } from "./EditorRecorte";
import { enviarImagem, type ImagemEnviada } from "./redimensionar";

/** Endereço da versão da imagem mais próxima de `alvo` px (no painel, lida do D1 pelo Worker). */
export function urlImagem(id: string, info: InfoImagem | undefined, alvo = 360): string | null {
    if (!info?.larguras.length) return null;

    const largura = info.larguras.find(l => l >= alvo) ?? info.larguras[info.larguras.length - 1];
    return `/api/imagens/${id}/${largura}`;
}

/**
 * Miniatura da imagem (ou a caixa vazia). `redonda` para fotos de perfil e de depoentes;
 * `larga` para imagens em paisagem (fundo dos projetos).
 */
export function Previa({ id, info, redonda = false, larga = false, alt }: {
    id: string | null;
    info?: InfoImagem;
    redonda?: boolean;
    larga?: boolean;
    alt: string;
}) {
    const url = id ? urlImagem(id, info, larga ? 640 : 360) : null;
    const classes = ["previa", redonda && "previa-redonda", larga && "previa-larga"].filter(Boolean).join(" ");

    return (
        <div className={classes}>
            {url ? <img src={url} alt={alt} loading="lazy" /> : <div className="previa-vazia">Sem imagem</div>}
        </div>
    );
}

/**
 * Botão que escolhe um arquivo, reduz e converte no navegador e envia ao D1.
 * `larguras`: as versões a gerar (as que a landing pede no srcset).
 * `proporcao` (largura ÷ altura): antes de enviar, abre o EditorRecorte para a pessoa
 * escolher a parte da imagem e o zoom; `redonda` mostra a moldura em círculo (fotos de
 * perfil). Sem `proporcao`, a imagem vai inteira (a foto recortada do topo).
 */
export function EnviarImagem({ larguras, proporcao, redonda = false, rotulo = "Enviar imagem", idioma = "pt", aoEnviar }: {
    larguras: number[];
    proporcao?: number;
    redonda?: boolean;
    rotulo?: string;
    idioma?: "pt" | "en";
    aoEnviar: (imagem: ImagemEnviada) => void | Promise<void>;
}) {
    const entrada = useRef<HTMLInputElement>(null);
    const [pendente, setPendente] = useState<{ arquivo: File; url: string } | null>(null);
    const { executando, aviso, executar } = useAcao();

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
        if (proporcao && arquivo.type.startsWith("image/")) setPendente({ arquivo, url: URL.createObjectURL(arquivo) });
        else enviar(arquivo);
    };

    return (
        <div className="enviar-imagem">
            <label className="botao">
                {executando ? (idioma === "pt" ? "Enviando…" : "Uploading…") : rotulo}
                <input ref={entrada} type="file" accept="image/*" disabled={executando}
                       onChange={e => escolher(e.target.files?.[0])} />
            </label>
            <Aviso aviso={aviso} />

            {pendente && proporcao && (
                <EditorRecorte url={pendente.url} proporcao={proporcao} redonda={redonda} idioma={idioma}
                               larguraIdeal={Math.max(...larguras)}
                               aoCancelar={() => { setPendente(null); limparEntrada(); }}
                               aoConfirmar={recorte => { const { arquivo } = pendente; setPendente(null); enviar(arquivo, recorte); }} />
            )}
        </div>
    );
}
