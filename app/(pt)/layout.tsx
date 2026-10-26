import type { ReactNode } from "react";
import { Documento } from "@/componentes/Documento";

// Layout raiz das páginas em português: a landing (/), o login, o convite, o painel e a página do depoente.
// Cada idioma tem o próprio layout raiz para o <html lang> sair certo no HTML estático.
export { viewport } from "@/lib/metadados";

// Ícone de todas as páginas do idioma (a landing repete em metadadosLanding).
export const metadata = { icons: { icon: "/favicon.png" } };

export default function LayoutPortugues({ children }: { children: ReactNode }) {
    return <Documento lang="pt-BR">{children}</Documento>;
}
