import { Icone } from "@/componentes/icones/Icone";
import { AnoAtual } from "./AnoAtual";
import { LinkSocial } from "./Comuns";
import type { PropsSecao } from "./Landing";

/**
 * Seção 11 do mockup: rodapé de ponta a ponta. Redes sociais em círculos
 * contornados e o copyright, com o nome na fonte manuscrita Ernestone.
 */
export function Rodape({ conteudo, d }: PropsSecao) {
    const { perfil, redes } = conteudo;

    return (
        <footer id="rodape" className="rodape">
            <div className="conteudo">
                <ul className="rodape-redes">
                    {redes.map(rede => (
                        <li key={rede.nome}>
                            <LinkSocial rede={rede} />
                        </li>
                    ))}
                </ul>

                <p className="rodape-copyright">
                    <AnoAtual formato={d.copyright} noBuild={new Date().getFullYear()} />
                    <a className="rodape-assinatura" href={perfil.linkedin} target="_blank" rel="noopener noreferrer"
                       title={d.assinaturaTitulo}>{perfil.nomeCurto}</a>
                </p>

                {/* Entrada da área restrita (painel e depoentes): discreta, a landing continua sendo a index. */}
                <a className="rodape-entrar" href="/login" rel="nofollow" aria-label={d.entrar} title={d.entrar}>
                    <Icone nome="fal:sign-in" />
                </a>
            </div>
        </footer>
    );
}
