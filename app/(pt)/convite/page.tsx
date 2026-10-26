import type { Metadata } from "next";
import { FormConvite } from "@/componentes/painel/Acesso";
import { Moldura } from "@/componentes/painel/Moldura";

export const metadata: Metadata = {
    title: "Criar senha — Lucas Araújo",
    robots: { index: false, follow: false },
    // O token do convite vai na URL: não deixar que ele vaze no Referer de links externos.
    referrer: "no-referrer"
};

export default function PaginaConvite() {
    return (
        <Moldura>
            <FormConvite />
        </Moldura>
    );
}
