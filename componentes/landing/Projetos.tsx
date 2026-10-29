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
 * Atrás do título, o número do projeto em tamanho gigante; acima dele, a situação
 * (Em produção...), e embaixo a stack e os links do projeto e do código. Os cards
 * inativos ficam inclinados em perspectiva e o ativo se endireita com um brilho.
 * Atrás da seção inteira, a imagem de fundo do projeto ativo, bem apagada (papel de parede).
 * Clicar na imagem do card em destaque a amplia (ProjetosVitrine).
 */
export function Projetos({ conteudo, idioma, d }: PropsSecao) {
    const projetos = conteudo.projetos.map((projeto, indice) => {
        const titulo = texto(projeto.titulo, idioma);
        const situacao = texto(projeto.situacao, idioma);

        return {
            id: projeto.id,
            titulo,
            // Só projeto com imagem pode ser ampliado; o texto vai pronto (funções não passam para o cliente).
            rotuloAmpliar: projeto.imagem ? d.ampliarImagem(titulo) : null,
            // Fora da primeira dobra e decorativa: lazy, alt vazio e a versão pequena no celular.
            fundo: projeto.fundo && (
                <img src={src(projeto.fundo)} srcSet={srcset(projeto.fundo)} sizes="100vw"
                     width={projeto.fundo.largura} height={projeto.fundo.altura}
                     alt="" loading="lazy" decoding="async" />
            ),
            info: (
                <>
                    <span className="projeto-numero" aria-hidden="true">{String(indice + 1).padStart(2, "0")}</span>
                    {situacao && <p className="projeto-situacao">{situacao}</p>}
                    <h3 className="projeto-titulo">{titulo}</h3>
                    <p className="projeto-descricao">{texto(projeto.descricao, idioma)}</p>

                    {projeto.stack.length > 0 && (
                        <ul className="etiquetas" aria-label={d.tecnologias}>
                            {projeto.stack.map(tecnologia => <li key={tecnologia}>{tecnologia}</li>)}
                        </ul>
                    )}

                    <div className="projeto-acoes">
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

                        {projeto.repositorio && (
                            <a className="btn-contorno" href={projeto.repositorio} target="_blank" rel="noopener noreferrer">
                                <Icone nome="fab:github" />
                                {d.verCodigo}
                            </a>
                        )}
                    </div>
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
        // Sem .revelar na seção: o respiro do topo entrava na tela antes do conteúdo e a
        // animação acabava antes de os cards aparecerem. Quem revela são o texto e a vitrine.
        <section id="projetos" className="secao projetos">
            <div className="conteudo projetos-grade">
                <h2 className="visualmente-oculto">{d.secaoProjetos}</h2>

                <ProjetosVitrine
                    projetos={projetos}
                    rotuloVitrine={d.vitrineProjetos}
                    rotuloFechar={d.fecharImagem}
                    rotuloLerMais={d.lerMais}
                    rotuloLerMenos={d.lerMenos}
                    iconeAmpliar={<Icone nome="fal:search-plus" />}
                    iconeFechar={<Icone nome="fal:times" />}
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
