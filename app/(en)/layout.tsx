import type { ReactNode } from "react";
import { Documento } from "@/componentes/Documento";

// Layout raiz das páginas em inglês (/en).
export { viewport } from "@/lib/metadados";

// Ícone de todas as páginas do idioma (a landing repete em metadadosLanding).
export const metadata = { icons: { icon: "/favicon.png" } };

export default function LayoutIngles({ children }: { children: ReactNode }) {
    return <Documento lang="en">{children}</Documento>;
}
