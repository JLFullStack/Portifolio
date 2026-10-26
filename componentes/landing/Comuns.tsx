import type { ReactNode } from "react";
import type { RedeSocial } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";

/**
 * Título de seção: rótulo alinhado à esquerda, em peso alto. Não desenha régua:
 * as linhas cianas do mockup ficam ACIMA dos títulos de Habilidades,
 * Certificações, Educação e Experiência. São o SeparadorSecao.
 */
export function TituloSecao({ texto }: { texto: string }) {
    return (
        <div className="titulo-secao">
            <h2>{texto}</h2>
        </div>
    );
}

/** Régua fina em ciano entre blocos. Decorativa: role="presentation" evita o anúncio "separador". */
export function SeparadorSecao() {
    return <hr className="separador-secao" role="presentation" />;
}

/**
 * Link para uma rede social, usado no arco da Biografia e no Rodapé. Só tem
 * ícone, então o aria-label carrega o nome da rede.
 */
export function LinkSocial({ rede }: { rede: RedeSocial }) {
    return (
        <a href={rede.url} target="_blank" rel="noopener noreferrer" aria-label={rede.nome} title={rede.nome}>
            <Icone nome={rede.icone} />
        </a>
    );
}

/**
 * Timeline vertical de Educação e Experiência. No desktop os cards alternam os
 * lados (por :nth-child no CSS); no celular ficam todos do mesmo lado. É uma <ol>
 * porque a ordem importa.
 */
export function LinhaTempo({ children }: { children: ReactNode }) {
    return <ol className="linha-tempo">{children}</ol>;
}

/** Um card da timeline: período, título no acento e os detalhes. O marcador na linha é o ::before do item. */
export function ItemLinhaTempo({ periodo, titulo, children }: { periodo: string; titulo: string; children: ReactNode }) {
    return (
        <li className="linha-tempo-item">
            <div className="linha-tempo-card">
                <p className="linha-tempo-periodo">{periodo}</p>
                <h3 className="linha-tempo-titulo">{titulo}</h3>
                <div className="linha-tempo-corpo">{children}</div>
            </div>
        </li>
    );
}
