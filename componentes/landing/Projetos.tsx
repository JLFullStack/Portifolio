import { src, srcset, texto } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";
import { ControlesFaixa } from "./ControlesFaixa";
import type { PropsSecao } from "./Landing";
import { ProjetosVitrine } from "./ProjetosVitrine";

/**
 * Seção 4 do mockup: Projetos. À esquerda o título, a descrição e o Ver Trabalho
 * do projeto ativo; à direita a faixa de cards, com o ativo maior e os seguintes
 * sangrando na borda direita da tela. O mockup não mostra o título "Projetos":
 * o h2 fica só para leitores de tela.
 *
 * Todos os textos e cards vão no HTML; ProjetosVitrine só alterna qual está ativo.
 * Atrás do título, o número do projeto em tamanho gigante; os cards inativos
 * ficam inclinados em perspectiva e o ativo se endireita com um brilho.
 */
export function Projetos({ conteudo, idioma, d }: PropsSecao) {
    const projetos = conteudo.projetos.map((projeto, indice) => {
        const titulo = texto(projeto.titulo, idioma);

        return {
            id: projeto.id,
            info: (
                <>
                    <span className="projeto-numero" aria-hidden="true">{String(indice + 1).padStart(2, "0")}</span>
                    <h3 className="projeto-titulo">{titulo}</h3>
                    <p className="projeto-descricao">{texto(projeto.descricao, idioma)}</p>

                    {projeto.url ? (
                        <a className="btn-acento" href={projeto.url} target="_blank" rel="noopener noreferrer">
                            {d.verTrabalho}
                            <Icone nome="fal:arrow-right" />
                        </a>
                    ) : (
                        // Sem endereço: um botão inerte é mais honesto que um link que não leva a lugar nenhum.
                        <button type="button" className="btn-acento" aria-disabled="true" title={d.linkPendente}>
                            {d.verTrabalho}
                            <Icone nome="fal:arrow-right" />
                        </button>
                    )}
                </>
            ),
            card: (
                <>
                    <p className="projeto-rotulo">{titulo}</p>

                    {projeto.imagem ? (
                        <img className="projeto-imagem"
                             src={src(projeto.imagem)}
                             srcSet={srcset(projeto.imagem)}
                             sizes="(max-width: 991px) 60vw, 23rem"
                             width={projeto.imagem.largura} height={projeto.imagem.altura}
                             alt={d.imagemProjetoAlt(titulo)}
                             loading="lazy" decoding="async" />
                    ) : (
                        // Caixa cinza com a palavra "Imagem", como no mockup.
                        <div className="projeto-imagem projeto-imagem--vazia" role="img" aria-label={d.imagemProjetoAlt(titulo)}>
                            <span aria-hidden="true">{d.imagemPendente}</span>
                        </div>
                    )}
                </>
            )
        };
    });

    return (
        <section id="projetos" className="secao projetos revelar">
            <div className="conteudo projetos-grade">
                <h2 className="visualmente-oculto">{d.secaoProjetos}</h2>

                <ProjetosVitrine
                    projetos={projetos}
                    rotuloVitrine={d.vitrineProjetos}
                    controles={
                        <ControlesFaixa idFaixa="projetos-faixa" passo="item"
                                        rotuloAnterior={d.projetoAnterior} rotuloProximo={d.proximoProjeto}
                                        iconeAnterior={<Icone nome="fal:chevron-left" />}
                                        iconeProximo={<Icone nome="fal:chevron-right" />} />
                    } />
            </div>
        </section>
    );
}
