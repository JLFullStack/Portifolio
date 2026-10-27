import type { CSSProperties } from "react";
import { LOCALE } from "@/dicionarios";
import { Icone } from "@/componentes/icones/Icone";
import { SeparadorSecao, TituloSecao } from "./Comuns";
import type { PropsSecao } from "./Landing";

// Cores que o próprio GitHub usa para cada linguagem: identificam a linguagem num relance.
// São dados (como as cores de uma logo), não parte do tema.
const CORES_LINGUAGEM: Record<string, string> = {
    TypeScript: "#3178c6", JavaScript: "#f1e05a", "C#": "#178600", Python: "#3572a5", HTML: "#e34c26",
    CSS: "#663399", SCSS: "#c6538c", Java: "#b07219", PHP: "#4f5d95", Go: "#00add8", Rust: "#dea584",
    Shell: "#89e051", PowerShell: "#012456", TSQL: "#e38c00", Vue: "#41b883", Dart: "#00b4ab", Kotlin: "#a97bff"
};

/**
 * "Código aberto": os repositórios públicos do GitHub (scripts/exportar-github.mjs,
 * no build), com os números do perfil e um card por repositório: nome, descrição,
 * linguagem, estrelas, forks e a data do último push. Cada card é um link.
 */
export function Github({ conteudo, idioma, d }: PropsSecao) {
    const github = conteudo.github;
    if (!github) return null;

    const formatarData = new Intl.DateTimeFormat(LOCALE[idioma], { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    const numeros = [
        { valor: github.repositoriosPublicos, rotulo: d.githubRepositorios },
        ...(github.estrelas ? [{ valor: github.estrelas, rotulo: d.githubEstrelas }] : []),
        ...(github.seguidores ? [{ valor: github.seguidores, rotulo: d.githubSeguidores }] : [])
    ];

    return (
        <section id="github" className="secao github">
            <div className="conteudo">
                <SeparadorSecao />

                <div className="github-topo">
                    <TituloSecao texto={d.secaoGithub} />

                    <div className="github-perfil revelar">
                        <ul className="github-numeros">
                            {numeros.map(numero => (
                                <li key={numero.rotulo}><strong className="texto-gradiente">{numero.valor}</strong> {numero.rotulo}</li>
                            ))}
                        </ul>
                        <a className="btn-contorno" href={github.url} target="_blank" rel="noopener noreferrer">
                            <Icone nome="fab:github" />
                            {d.githubVerPerfil}
                        </a>
                    </div>
                </div>

                <ul className="github-grade">
                    {github.repositorios.map((repositorio, i) => (
                        <li key={repositorio.nome} className="revelar" style={{ "--indice": i } as CSSProperties}>
                            <a className="repositorio-card cartao-luz" href={repositorio.url} target="_blank" rel="noopener noreferrer">
                                <span className="repositorio-cabeca">
                                    <Icone nome="fal:code-branch" className="repositorio-icone" />
                                    <span className="repositorio-nome">{repositorio.nome}</span>
                                    <Icone nome="fal:external-link" className="repositorio-sair" />
                                </span>
                                <span className="repositorio-descricao">{repositorio.descricao || d.githubSemDescricao}</span>
                                <span className="repositorio-rodape">
                                    {repositorio.linguagem && (
                                        <span className="repositorio-linguagem"
                                              style={{ "--cor-linguagem": CORES_LINGUAGEM[repositorio.linguagem] } as CSSProperties}>
                                            {repositorio.linguagem}
                                        </span>
                                    )}
                                    {repositorio.estrelas > 0 && <span><Icone nome="fal:star" /> {repositorio.estrelas}</span>}
                                    {repositorio.forks > 0 && <span><Icone nome="fal:code-branch" /> {repositorio.forks}</span>}
                                    <span className="repositorio-data">
                                        {d.githubAtualizado.replace("{data}", formatarData.format(new Date(`${repositorio.atualizadoEm}T00:00:00Z`)))}
                                    </span>
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
