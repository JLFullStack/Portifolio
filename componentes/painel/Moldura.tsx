import type { ReactNode } from "react";
import "@/estilos/painel.css";

/** Envolve as páginas da área restrita e traz o CSS delas (a landing não o carrega). */
export function Moldura({ children }: { children: ReactNode }) {
    return <div className="painel">{children}</div>;
}
