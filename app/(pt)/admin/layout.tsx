import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Moldura } from "@/componentes/painel/Moldura";
import { PainelAdmin } from "@/componentes/painel/PainelAdmin";

// Páginas do painel. Protegidas pelo Worker (worker/index.js): só o administrador as recebe.
export const metadata: Metadata = {
    title: "Painel — Lucas Araújo",
    robots: { index: false, follow: false }
};

export default function LayoutPainel({ children }: { children: ReactNode }) {
    return (
        <Moldura>
            <PainelAdmin>{children}</PainelAdmin>
        </Moldura>
    );
}
