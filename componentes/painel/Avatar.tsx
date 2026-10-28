import type { CSSProperties } from "react";
import type { InfoImagem } from "@/lib/painel";
import { urlImagem } from "./Imagens";

/** Iniciais do nome: primeira e última palavra ("Maria da Silva" → "MS"). */
function iniciais(nome: string): string {
    const palavras = nome.trim().split(/\s+/).filter(Boolean);
    if (!palavras.length) return "?";

    const primeira = palavras[0][0];
    const ultima = palavras.length > 1 ? palavras[palavras.length - 1][0] : "";
    return (primeira + ultima).toUpperCase();
}

/**
 * Foto redonda da pessoa ou, sem foto, as iniciais num círculo em gradiente.
 * O tom do círculo sai do nome, para cada pessoa ter sempre a mesma cor.
 */
export function Avatar({ nome, foto, info, grande = false }: { nome: string; foto?: string | null; info?: InfoImagem; grande?: boolean }) {
    const url = foto ? urlImagem(foto, info, 160) : null;
    const tom = ([...nome].reduce((soma, letra) => soma + letra.charCodeAt(0), 0) % 5) + 1;

    return (
        <span className={grande ? "avatar avatar-grande" : "avatar"} style={{ "--tom": `var(--tom-${tom})` } as CSSProperties} aria-hidden="true">
            {url ? <img src={url} alt="" loading="lazy" /> : iniciais(nome)}
        </span>
    );
}
