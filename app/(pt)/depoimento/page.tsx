import type { Metadata } from "next";
import { Icone } from "@/componentes/icones/Icone";
import { BotaoTopo } from "@/componentes/landing/BotaoTopo";
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

            <BotaoTopo rotulo="Voltar ao topo · Back to top">
                <Icone nome="fal:arrow-up" />
            </BotaoTopo>
        </Moldura>
    );
}
