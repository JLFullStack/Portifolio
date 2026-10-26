// Conteúdo editável da landing: tipos e leitura.
//
// No build, a landing lê conteudo/conteudo.json, exportado do D1 por
// scripts/exportar-conteudo.mjs (fase 2). Sem ele (desenvolvimento local),
// usa conteudo/semente.json, o conteúdo inicial portado do Blazor.
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
    imagem: Foto | null;
};

export type Depoimento = {
    id: number;
    nome: string;
    /** Idioma em que a pessoa escreveu; o outro é a tradução feita na aprovação. */
    idiomaOriginal: Idioma;
    texto: Texto;
    profissao: Texto;
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
        curriculo: string;
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
    };
    redes: RedeSocial[];
    projetos: Projeto[];
    depoimentos: Depoimento[];
    habilidades: { titulo: Texto; itens: ItemHabilidade[] }[];
    certificacoes: { sigla: string; descricao: Texto }[];
    formacoes: { periodo: Texto; titulo: Texto; instituicao: Texto }[];
    experiencias: { periodo: Texto; cargo: Texto; empresa: Texto; endereco: Texto; descricao: Texto }[];
};

let cache: Conteudo | undefined;

export function lerConteudo(): Conteudo {
    if (cache) return cache;

    const pasta = join(process.cwd(), "conteudo");
    const exportado = join(pasta, "conteudo.json");
    const arquivo = existsSync(exportado) ? exportado : join(pasta, "semente.json");

    cache = JSON.parse(readFileSync(arquivo, "utf8")) as Conteudo;
    return cache;
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
