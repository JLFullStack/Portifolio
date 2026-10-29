// Tipos dos dados que o painel recebe de GET /api/painel (worker/api.js, painel()).
// São as linhas do D1, com as colunas _pt/_en separadas.

export type InfoImagem = { largura: number; altura: number; larguras: number[] };

export type Perfil = Record<string, string> & { foto_hero: string; foto_biografia: string };

export type Linha = { id: number; ordem: number } & Record<string, string | number | null>;

export type ImagemProjeto = { projeto_id: number; imagem_id: string; ordem: number; alt_pt: string; alt_en: string };

export type Projeto = Linha & { imagens: ImagemProjeto[] };

export type Depoimento = Linha & {
    usuario_id: number | null;
    email_usuario: string | null;
    nome: string;
    idioma_original: "pt" | "en";
    texto_pt: string;
    texto_en: string;
    profissao_pt: string;
    profissao_en: string;
    linkedin: string;
    foto: string | null;
    situacao: "pendente" | "aprovado" | "recusado";
    enviado_em: string;
    aprovado_em: string | null;
    exemplo: number;
    publicado: { nome: string; texto: { pt: string; en: string } } | null;
};

export type Grupo = Linha & { itens: Linha[] };

/** Mensagem do formulário de contato da landing. */
export type Mensagem = {
    id: number;
    nome: string;
    email: string;
    interesse: string;
    texto: string;
    idioma: "pt" | "en";
    lida: number;
    enviada_em: string;
};

export type UsuarioPainel = {
    id: number;
    nome: string;
    email: string;
    papel: "admin" | "depoente";
    ativo: number;
    criado_em: string;
    ultimo_acesso: string | null;
    tem_senha: number;
    convite_expira_em: string | null;
};

export type Publicacao = {
    id: number;
    usuario: string | null;
    pedida_em: string;
    situacao: "pedida" | "concluida" | "falhou";
    concluida_em: string | null;
    detalhe: string | null;
};

export type DadosPainel = {
    perfil: Perfil;
    redes: Linha[];
    projetos: Projeto[];
    servicos: Linha[];
    depoimentos: Depoimento[];
    grupos: Grupo[];
    certificacoes: Linha[];
    formacoes: Linha[];
    experiencias: Linha[];
    usuarios: UsuarioPainel[];
    publicacoes: Publicacao[];
    mensagens: Mensagem[];
    /** O currículo em PDF enviado no painel em cada idioma, ou null. */
    curriculos: Record<"pt" | "en", { tamanho: number; atualizado_em: string } | null>;
    imagens: Record<string, InfoImagem>;
};

/** Data do banco (UTC, "AAAA-MM-DD HH:MM:SS") no fuso e formato de quem está vendo. */
export function dataHora(valor: string | null | undefined): string {
    if (!valor) return "—";

    return new Date(`${valor.replace(" ", "T")}Z`).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
