// Conteúdo editável da landing: tipos e leitura.
//
// No build, a landing lê conteudo/conteudo.json, exportado do D1 por
// scripts/exportar-conteudo.mjs. Sem ele (desenvolvimento sem banco), usa
// conteudo/semente.json, o conteúdo inicial (também usado para popular o banco).
// Os repositórios do GitHub vêm de conteudo/github.json (scripts/exportar-github.mjs),
// quando existe.
// Só roda no servidor, durante o build: nada daqui vai para o navegador.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { NomeIcone } from "@/componentes/icones/dados";

export type Idioma = "pt" | "en";

/** Texto nos dois idiomas. Campo vazio num idioma usa o do outro (ver texto()). */
export type Texto = { pt: string; en: string };

/**
 * Foto otimizada em WebP: cada largura de `larguras` existe em `${base}-${largura}.webp`.
 * `largura` e `altura` são as da imagem original, para a proporção do <img>.
 */
export type Foto = { base: string; larguras: number[]; largura: number; altura: number };

export type RedeSocial = { nome: string; url: string; icone: NomeIcone };

export type Projeto = {
    id: number;
    titulo: Texto;
    descricao: Texto;
    url: string | null;
    /** Link do código-fonte (GitHub, GitLab...). */
    repositorio: string | null;
    stack: string[];
    /** Etiqueta curta, como "Em produção". Vazia: sem etiqueta. */
    situacao: Texto;
    imagem: Foto | null;
    /** Imagem de fundo (paisagem) que aparece bem apagada atrás da seção enquanto o projeto está ativo. */
    fundo: Foto | null;
};

/** Um card da seção "O que eu faço". */
export type Servico = { icone: NomeIcone; titulo: Texto; descricao: Texto };

export type RepositorioGithub = {
    nome: string;
    /** A escrita no painel ou, sem ela, a do GitHub (em português). */
    descricao: Texto;
    url: string;
    linguagem: string | null;
    estrelas: number;
    forks: number;
    /** AAAA-MM-DD do último push. */
    atualizadoEm: string;
};

/** Atividade pública no GitHub, buscada no build. */
export type Github = {
    usuario: string;
    url: string;
    repositoriosPublicos: number;
    seguidores: number;
    estrelas: number;
    repositorios: RepositorioGithub[];
};

export type Depoimento = {
    id: number;
    nome: string;
    /** Idioma em que a pessoa escreveu; o outro é a tradução feita na aprovação. */
    idiomaOriginal: Idioma;
    texto: Texto;
    profissao: Texto;
    /** Perfil do LinkedIn da pessoa: vira um botão no card. */
    linkedin: string | null;
    foto: Foto | null;
};

/** Nomes próprios (C#, Git) vêm como texto simples; o que muda entre os idiomas, como Texto. */
export type ItemHabilidade = string | Texto;

export type Conteudo = {
    perfil: {
        nomeCurto: string;
        nomeCompleto: string;
        /** AAAA-MM-DD; a idade é calculada a partir dela. */
        nascimento: string;
        email: string;
        telefone: string;
        whatsapp: string;
        linkedin: string;
        /** Link do Download CV em cada idioma (inglês vazio: usa o do português). */
        curriculo: Texto;
        saudacao: Texto;
        profissao: Texto;
        descricaoHero: Texto;
        biografia: Texto[];
        endereco: Texto;
        chamadaConvite: Texto;
        chamadaCitacao: Texto;
        chamadaAutor: string;
        fotoHero: Foto;
        fotoBiografia: Foto;
        /** Mostra o selo "Disponível para novos projetos" no topo. */
        disponivel: boolean;
        /** Ano em que a carreira começou (Anos de experiência). null: o mais antigo dos períodos das experiências. */
        inicioCarreira: number | null;
    };
    redes: RedeSocial[];
    servicos: Servico[];
    projetos: Projeto[];
    depoimentos: Depoimento[];
    habilidades: { titulo: Texto; itens: ItemHabilidade[] }[];
    certificacoes: { sigla: string; descricao: Texto }[];
    formacoes: { periodo: Texto; titulo: Texto; instituicao: Texto }[];
    experiencias: { periodo: Texto; cargo: Texto; empresa: Texto; endereco: Texto; descricao: Texto; stack: string[] }[];
    github: Github | null;
    /** Configuração da seção "Código aberto", usada por scripts/exportar-github.mjs. */
    codigoAberto: { exibir: boolean; repositorios: { nome: string; descricao: Texto }[] };
};

let cache: Conteudo | undefined;

export function lerConteudo(): Conteudo {
    if (cache) return cache;

    const pasta = join(process.cwd(), "conteudo");
    const exportado = join(pasta, "conteudo.json");
    const arquivo = existsSync(exportado) ? exportado : join(pasta, "semente.json");

    const lido = JSON.parse(readFileSync(arquivo, "utf8")) as Conteudo;
    const github = join(pasta, "github.json");
    const vazio: Texto = { pt: "", en: "" };

    // Campos novos ganham valor padrão: um conteudo.json exportado antes deles continua valendo.
    cache = {
        ...lido,
        perfil: {
            ...lido.perfil,
            // Exportado antes do currículo por idioma: o link único vale para o português.
            curriculo: typeof lido.perfil.curriculo === "string" ? { pt: lido.perfil.curriculo, en: "" } : lido.perfil.curriculo,
            disponivel: Boolean(lido.perfil.disponivel),
            inicioCarreira: lido.perfil.inicioCarreira ?? null
        },
        servicos: lido.servicos ?? [],
        projetos: lido.projetos.map(projeto => ({
            ...projeto,
            repositorio: projeto.repositorio ?? null,
            stack: projeto.stack ?? [],
            situacao: projeto.situacao ?? vazio,
            fundo: projeto.fundo ?? null
        })),
        depoimentos: lido.depoimentos.map(depoimento => ({ ...depoimento, linkedin: depoimento.linkedin ?? null })),
        experiencias: lido.experiencias.map(experiencia => ({ ...experiencia, stack: experiencia.stack ?? [] })),
        github: existsSync(github) ? lerGithub(github) : null,
        codigoAberto: lido.codigoAberto ?? { exibir: true, repositorios: [] }
    };
    return cache;
}

/** conteudo/github.json; um gerado antes das descrições por idioma traz a descrição como texto simples. */
function lerGithub(arquivo: string): Github {
    const lido = JSON.parse(readFileSync(arquivo, "utf8")) as Github;

    return {
        ...lido,
        repositorios: lido.repositorios.map(r => ({ ...r, descricao: typeof r.descricao === "string" ? { pt: r.descricao, en: "" } : r.descricao }))
    };
}

/** O texto no idioma pedido; se estiver vazio, o do outro idioma. */
export function texto(valor: ItemHabilidade, idioma: Idioma): string {
    if (typeof valor === "string") return valor;

    return valor[idioma] || valor[idioma === "pt" ? "en" : "pt"];
}

/** srcset de uma Foto, das larguras geradas. */
export function srcset(foto: Foto): string {
    return foto.larguras.map(largura => `${foto.base}-${largura}.webp ${largura}w`).join(", ");
}

/** A maior versão da foto, para o src (navegadores sem srcset). */
export function src(foto: Foto): string {
    return `${foto.base}-${foto.larguras[foto.larguras.length - 1]}.webp`;
}
