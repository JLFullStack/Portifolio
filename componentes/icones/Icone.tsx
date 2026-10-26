import { ICONES, type NomeIcone } from "./dados";

/**
 * Ícone do Font Awesome Pro como SVG inline, no lugar do <i class="fal fa-...">.
 *
 * Tem 1em de altura e a largura da proporção do desenho, então continua sendo
 * dimensionado pelo font-size do elemento pai, como a webfont era. Herda a cor
 * por currentColor. É decorativo: o rótulo acessível fica no botão ou link.
 *
 * Componente de servidor: os desenhos ficam só no HTML. Um componente de cliente
 * que precise de ícone o recebe pronto, como children ou prop.
 */
export function Icone({ nome, className }: { nome: NomeIcone; className?: string }) {
    // Nome vindo do banco que não existe mais em dados.ts: sem ícone, em vez de quebrar o build.
    if (!Object.hasOwn(ICONES, nome)) return null;

    const [largura, altura, path] = ICONES[nome];

    return (
        <svg className={className ? `icone ${className}` : "icone"}
             viewBox={`0 0 ${largura} ${altura}`}
             aria-hidden="true" focusable="false">
            <path fill="currentColor" d={path} />
        </svg>
    );
}
