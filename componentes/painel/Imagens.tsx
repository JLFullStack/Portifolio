"use client";

import { useRef } from "react";
import type { InfoImagem } from "@/lib/painel";
import { Aviso, useAcao } from "./Campos";
import { enviarImagem, type ImagemEnviada } from "./redimensionar";

/** Endereço da versão da imagem mais próxima de `alvo` px (no painel, lida do D1 pelo Worker). */
export function urlImagem(id: string, info: InfoImagem | undefined, alvo = 360): string | null {
    if (!info?.larguras.length) return null;

    const largura = info.larguras.find(l => l >= alvo) ?? info.larguras[info.larguras.length - 1];
    return `/api/imagens/${id}/${largura}`;
}

/** Miniatura da imagem (ou a caixa vazia). `redonda` para fotos de perfil e de depoentes. */
export function Previa({ id, info, redonda = false, alt }: { id: string | null; info?: InfoImagem; redonda?: boolean; alt: string }) {
    const url = id ? urlImagem(id, info) : null;

    return (
        <div className={redonda ? "previa previa-redonda" : "previa"}>
            {url ? <img src={url} alt={alt} loading="lazy" /> : <div className="previa-vazia">Sem imagem</div>}
        </div>
    );
}

/**
 * Botão que escolhe um arquivo, reduz e converte no navegador e envia ao D1.
 * `larguras`: as versões a gerar (as que a landing pede no srcset).
 */
export function EnviarImagem({ larguras, quadrada = false, rotulo = "Enviar imagem", aoEnviar }: {
    larguras: number[];
    quadrada?: boolean;
    rotulo?: string;
    aoEnviar: (imagem: ImagemEnviada) => void | Promise<void>;
}) {
    const entrada = useRef<HTMLInputElement>(null);
    const { executando, aviso, executar } = useAcao();

    const escolher = async (arquivo: File | undefined) => {
        if (!arquivo) return;

        await executar(async () => {
            const imagem = await enviarImagem(arquivo, larguras, quadrada);
            await aoEnviar(imagem);
        });

        if (entrada.current) entrada.current.value = "";
    };

    return (
        <div className="enviar-imagem">
            <label className="botao">
                {executando ? "Enviando…" : rotulo}
                <input ref={entrada} type="file" accept="image/*" disabled={executando}
                       onChange={e => escolher(e.target.files?.[0])} />
            </label>
            <Aviso aviso={aviso} />
        </div>
    );
}
