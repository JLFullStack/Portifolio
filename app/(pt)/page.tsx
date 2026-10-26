import { Landing } from "@/componentes/landing/Landing";
import { metadadosLanding } from "@/lib/metadados";

export const metadata = metadadosLanding("pt");

export default function PaginaInicial() {
    return <Landing idioma="pt" />;
}
