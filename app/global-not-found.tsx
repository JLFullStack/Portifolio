import type { Metadata } from "next";
import { Documento } from "@/componentes/Documento";

// Página 404 (vira out/404.html; o Worker a usa pelo not_found_handling do wrangler.jsonc).
// É global porque há dois layouts raiz, um por idioma. Fica em português,
// com o atalho para a versão em inglês.
export const metadata: Metadata = {
    title: "Página não encontrada — Lucas Araújo",
    robots: { index: false }
};

export default function NaoEncontrada() {
    return (
        <Documento lang="pt-BR">
            <main className="pagina-erro" role="alert">
                <p className="pagina-erro-codigo">404</p>
                <h1>Página não encontrada</h1>
                <p>O endereço que você tentou acessar não existe ou foi removido.</p>
                <div className="pagina-erro-acoes">
                    <a className="btn-acento" href="/">Voltar para a página inicial</a>
                    <a className="btn-acento" href="/en" lang="en">Go to the home page</a>
                </div>
            </main>
        </Documento>
    );
}
