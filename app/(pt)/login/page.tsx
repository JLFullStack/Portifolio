import type { Metadata } from "next";
import { FormLogin } from "@/componentes/painel/compartilhado/Acesso";
import { Moldura } from "@/componentes/painel/compartilhado/Moldura";
import "@/estilos/painel/acesso.css";

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
