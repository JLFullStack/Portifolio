import type { ReactNode } from "react";
import { Documento } from "@/componentes/Documento";

// Layout raiz das páginas em inglês (/en).
export { viewport } from "@/lib/metadados";

export default function LayoutIngles({ children }: { children: ReactNode }) {
    return <Documento lang="en">{children}</Documento>;
}
