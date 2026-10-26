import { texto } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";
import { SeparadorSecao, TituloSecao } from "./Comuns";
import type { PropsSecao } from "./Landing";

/** Seção 7 do mockup: Certificações. Ícone de certificado à esquerda e o texto à direita. */
export function Certificacoes({ conteudo, idioma, d }: PropsSecao) {
    return (
        <section id="certificacoes" className="secao">
            <div className="conteudo">
                <SeparadorSecao />
                <TituloSecao texto={d.secaoCertificacoes} />

                <ul className="certificacoes-lista">
                    {conteudo.certificacoes.map((certificacao, i) => (
                        <li key={i} className="certificacao-card">
                            <Icone nome="fal:file-certificate" className="certificacao-icone" />
                            <div>
                                <h3 className="certificacao-sigla">{certificacao.sigla}</h3>
                                <p className="certificacao-descricao">{texto(certificacao.descricao, idioma)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
