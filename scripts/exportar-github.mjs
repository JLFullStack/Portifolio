// Busca a atividade pública no GitHub para a seção "Código aberto" da landing e grava
// conteudo/github.json (lido por lib/conteudo.ts). npm run github; o deploy roda depois
// do export do D1.
//
// O usuário sai da rede social com ícone fab:github (painel → Seções → Redes sociais),
// então não há nada a mais para configurar. Sem essa rede, ou se a API falhar, o arquivo
// é apagado e a seção some: o build nunca quebra por causa do GitHub.
//
// Sem token a API aceita 60 pedidos por hora por IP; no GitHub Actions o workflow passa
// o GITHUB_TOKEN automático, para não disputar esse limite com outros repositórios.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const PASTA = join(RAIZ, "conteudo");
const DESTINO = join(PASTA, "github.json");
const QUANTIDADE = 6;

const exportado = join(PASTA, "conteudo.json");
const conteudo = JSON.parse(readFileSync(existsSync(exportado) ? exportado : join(PASTA, "semente.json"), "utf8"));
const rede = conteudo.redes.find(r => r.icone === "fab:github");
const usuario = rede?.url.match(/github\.com\/([A-Za-z0-9-]+)/i)?.[1];

function desistir(motivo) {
    if (existsSync(DESTINO)) rmSync(DESTINO);
    console.log(`GitHub: ${motivo} A seção "Código aberto" fica de fora.`);
    process.exit(0);
}

if (!usuario) desistir("nenhuma rede social com ícone fab:github.");

const cabecalhos = {
    accept: "application/vnd.github+json",
    "user-agent": "portifolio-lucasaraujo",
    ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
};

async function buscar(caminho) {
    const resposta = await fetch(`https://api.github.com${caminho}`, { headers: cabecalhos, signal: AbortSignal.timeout(15_000) });
    if (!resposta.ok) throw new Error(`${resposta.status} em ${caminho}`);
    return resposta.json();
}

try {
    const [perfil, repositorios] = await Promise.all([
        buscar(`/users/${usuario}`),
        buscar(`/users/${usuario}/repos?per_page=100&sort=pushed&type=owner`)
    ]);

    // Os próprios (sem forks nem arquivados), os mais estrelados primeiro e, no empate, os mais recentes.
    const proprios = repositorios.filter(r => !r.fork && !r.archived && !r.private);
    const escolhidos = [...proprios]
        .sort((a, b) => b.stargazers_count - a.stargazers_count || b.pushed_at.localeCompare(a.pushed_at))
        .slice(0, QUANTIDADE);

    const github = {
        usuario: perfil.login,
        url: perfil.html_url,
        repositoriosPublicos: perfil.public_repos,
        seguidores: perfil.followers,
        estrelas: proprios.reduce((total, r) => total + r.stargazers_count, 0),
        repositorios: escolhidos.map(r => ({
            nome: r.name,
            descricao: r.description ?? "",
            url: r.html_url,
            linguagem: r.language,
            estrelas: r.stargazers_count,
            forks: r.forks_count,
            atualizadoEm: r.pushed_at.slice(0, 10)
        }))
    };

    if (!github.repositorios.length) desistir(`${usuario} não tem repositórios públicos próprios.`);

    writeFileSync(DESTINO, JSON.stringify(github, null, 2));
    console.log(`GitHub: ${github.repositorios.length} repositórios de ${usuario} exportados.`);
} catch (erro) {
    desistir(`não foi possível consultar a API (${erro.message}).`);
}
