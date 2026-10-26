import { texto } from "@/lib/conteudo";
import { SeparadorSecao, TituloSecao } from "./Comuns";
import type { PropsSecao } from "./Landing";

/** Seção 6 do mockup: Habilidades Profissionais. Cards de mesma altura lado a lado (coluna no celular). */
export function Habilidades({ conteudo, idioma, d }: PropsSecao) {
    return (
        <section id="habilidades" className="secao">
            <div className="conteudo">
                <SeparadorSecao />
                <TituloSecao texto={d.secaoHabilidades} />

                <ul className="habilidades-grade">
                    {conteudo.habilidades.map((grupo, i) => (
                        <li key={i} className="habilidades-card">
                            <h3 className="habilidades-titulo">{texto(grupo.titulo, idioma)}</h3>
                            <ul className="habilidades-itens">
                                {grupo.itens.map((item, j) => <li key={j}>{texto(item, idioma)}</li>)}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
