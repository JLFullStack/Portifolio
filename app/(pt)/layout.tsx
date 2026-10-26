import type { ReactNode } from "react";
import { Documento } from "@/componentes/Documento";

// Layout raiz das páginas em português: a landing (/) e, a partir da fase 3, login e painel.
// Cada idioma tem o próprio layout raiz para o <html lang> sair certo no HTML estático.
export { viewport } from "@/lib/metadados";

export default function LayoutPortugues({ children }: { children: ReactNode }) {
    return <Documento lang="pt-BR">{children}</Documento>;
}
