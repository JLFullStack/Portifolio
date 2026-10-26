import type { Metadata } from "next";
import { FormLogin } from "@/componentes/painel/Acesso";
import { Moldura } from "@/componentes/painel/Moldura";

export const metadata: Metadata = {
    title: "Entrar — Lucas Araújo",
    robots: { index: false, follow: false }
};

export default function PaginaLogin() {
    return (
        <Moldura>
            <FormLogin />
        </Moldura>
    );
}
