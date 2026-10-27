import type { ReactNode } from "react";
import type { RedeSocial } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";

/**
 * Título de seção: o número da seção (contador CSS, então seções ocultas não
 * deixam buraco na contagem), o h2 com a última palavra em gradiente e, atrás,
 * o mesmo texto gigante e só contornado. O texto de fundo é decorativo: aria-hidden.
 */
export function TituloSecao({ texto }: { texto: string }) {
    const quebra = texto.lastIndexOf(" ");
    const inicio = quebra > 0 ? texto.slice(0, quebra + 1) : "";
    const destaque = quebra > 0 ? texto.slice(quebra + 1) : texto;

    return (
        <div className="titulo-secao">
            <span className="titulo-secao-fundo" aria-hidden="true">{texto}</span>
            <h2>{inicio}<span className="texto-gradiente">{destaque}</span></h2>
        </div>
    );
}

/** Régua fina em gradiente entre blocos. Decorativa: role="presentation" evita o anúncio "separador". */
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
 * porque a ordem importa. A linha se preenche conforme a página rola (CSS).
 */
export function LinhaTempo({ children }: { children: ReactNode }) {
    return <ol className="linha-tempo">{children}</ol>;
}

/** Um card da timeline: período, título no acento e os detalhes. O marcador na linha leva o ícone da seção. */
export function ItemLinhaTempo({ periodo, titulo, icone, children }: {
    periodo: string;
    titulo: string;
    icone: ReactNode;
    children: ReactNode;
}) {
    return (
        <li className="linha-tempo-item revelar">
            <span className="linha-tempo-marcador" aria-hidden="true">{icone}</span>
            <div className="linha-tempo-card cartao-luz">
                <p className="linha-tempo-periodo">{periodo}</p>
                <h3 className="linha-tempo-titulo">{titulo}</h3>
                <div className="linha-tempo-corpo">{children}</div>
            </div>
        </li>
    );
}
