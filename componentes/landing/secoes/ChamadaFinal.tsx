import { texto } from "@/lib/conteudo";
import { Icone } from "@/componentes/icones/Icone";
import { FormularioContato } from "@/componentes/landing/secoes/FormularioContato";
import type { PropsSecao } from "@/componentes/landing/Landing";

/**
 * Seção 10 do mockup: chamada final. Um painel em gradiente com aurora e anéis
 * decorativos: à esquerda o convite, a citação e os contatos diretos preenchidos
 * no painel (WhatsApp, e-mail, celular); à direita o formulário de contato. O convite é o h2 da seção.
 * Os assuntos do formulário são os serviços, mais "Outro assunto".
 */
export function ChamadaFinal({ conteudo, idioma, d }: PropsSecao) {
    const { perfil } = conteudo;
    const interesses = [...conteudo.servicos.map(servico => texto(servico.titulo, idioma)), d.formOutro];
    // Contato vazio no painel não aparece; sem nenhum, fica só o formulário.
    const temContato = Boolean(perfil.whatsapp || perfil.email || perfil.telefone);

    return (
        <section id="contato" className="secao">
            <div className="conteudo">
                <div className="chamada-card revelar">
                    <span className="chamada-aneis" aria-hidden="true" />

                    <div className="chamada-texto">
                        <h2 className="chamada-convite">{texto(perfil.chamadaConvite, idioma)}</h2>
                        <figure className="chamada-citacao">
                            <blockquote>{texto(perfil.chamadaCitacao, idioma)}</blockquote>
                            <figcaption>{perfil.chamadaAutor}</figcaption>
                        </figure>

                        {temContato && (
                            <>
                                <p className="chamada-direto">{d.contatoDireto}</p>
                                <ul className="chamada-contatos">
                                    {perfil.whatsapp && (
                                        <li className="chamada-contatos-botao">
                                            <a className="btn-claro" href={perfil.whatsapp} target="_blank" rel="noopener noreferrer">
                                                <Icone nome="fab:whatsapp" />
                                                WhatsApp
                                                <Icone nome="fal:arrow-right" className="icone-seta" />
                                            </a>
                                        </li>
                                    )}
                                    {perfil.email && (
                                        <li>
                                            <a className="chamada-contato" href={`mailto:${perfil.email}`}>
                                                <Icone nome="fal:envelope" />
                                                {perfil.email}
                                            </a>
                                        </li>
                                    )}
                                    {perfil.telefone && (
                                        <li>
                                            <a className="chamada-contato" href={`tel:${perfil.telefone.replace(/[^\d+]/g, "")}`}>
                                                <Icone nome="fal:mobile-alt" />
                                                {perfil.telefone}
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </>
                        )}
                    </div>

                    <FormularioContato
                        idioma={idioma}
                        interesses={interesses}
                        iconeEnviar={<Icone nome="fal:paper-plane" />}
                        iconeOk={<Icone nome="fal:check" />}
                        textos={{
                            titulo: d.formTitulo, nome: d.formNome, email: d.formEmail, interesse: d.formInteresse,
                            mensagem: d.formMensagem, enviar: d.formEnviar, enviando: d.formEnviando,
                            sucesso: d.formSucesso, erro: d.formErro, isca: d.formIsca
                        }} />
                </div>
            </div>
        </section>
    );
}
