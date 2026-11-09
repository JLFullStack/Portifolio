import type { ReactNode } from "react";
import "@/estilos/painel/compartilhado.css";

/**
 * Envolve as páginas da área restrita e traz o CSS comum a elas (a landing não o
 * carrega). Cada página importa o próprio arquivo de estilos/painel/, se tiver um.
 */
export function Moldura({ children }: { children: ReactNode }) {
    return <div className="painel">{children}</div>;
}
