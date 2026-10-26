import type { Metadata } from "next";
import { AreaDepoente } from "@/componentes/painel/AreaDepoente";
import { Moldura } from "@/componentes/painel/Moldura";

// Protegida pelo Worker (worker/index.js): sem sessão, redireciona para o login.
export const metadata: Metadata = {
    title: "Seu depoimento — Lucas Araújo",
    robots: { index: false, follow: false }
};

export default function PaginaDepoimento() {
    return (
        <Moldura>
            <AreaDepoente />
        </Moldura>
    );
}
