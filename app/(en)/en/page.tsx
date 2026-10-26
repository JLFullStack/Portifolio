import { Landing } from "@/componentes/landing/Landing";
import { metadadosLanding } from "@/lib/metadados";

export const metadata = metadadosLanding("en");

export default function PaginaInicialIngles() {
    return <Landing idioma="en" />;
}
