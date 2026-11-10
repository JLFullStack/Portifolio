// Conteúdo da landing editado pelo administrador: perfil, coleções (listas fixas de
// colunas: só elas viram SQL), imagens dos projetos e currículo em PDF.
import { ICONES } from "../../componentes/icones/dados.ts";
import { ErroHttp, campoInteiro, campoTexto, campoUrl, json, lerJson } from "../http.js";
import { exigirImagem, proximaOrdem, reordenar } from "./comum.js";

/** Campos editáveis de cada coleção: tipo "texto", "lista", "url", "icone", "bool", "grupo", "repositorio" ou "imagem-opcional". */
const COLECOES = {
    redes_sociais: { nome: "texto", url: "url", icone: "icone" },
    projetos: {
        titulo_pt: "texto", titulo_en: "texto", descricao_pt: "texto", descricao_en: "texto", url: "url", repositorio: "url",
        stack: "lista", situacao_pt: "texto", situacao_en: "texto", publicado: "bool", fundo: "imagem-opcional"
    },
    servicos: { icone: "icone", titulo_pt: "texto", titulo_en: "texto", descricao_pt: "texto", descricao_en: "texto" },
    grupos_habilidades: { titulo_pt: "texto", titulo_en: "texto" },
    habilidades: { grupo_id: "grupo", nome_pt: "texto", nome_en: "texto" },
    certificacoes: { sigla: "texto", descricao_pt: "texto", descricao_en: "texto" },
    formacoes: { periodo_pt: "texto", periodo_en: "texto", titulo_pt: "texto", titulo_en: "texto", instituicao_pt: "texto", instituicao_en: "texto" },
    experiencias: {
        periodo_pt: "texto", periodo_en: "texto", cargo_pt: "texto", cargo_en: "texto", empresa_pt: "texto", empresa_en: "texto",
        endereco_pt: "texto", endereco_en: "texto", descricao_pt: "texto", descricao_en: "texto", stack: "lista"
    },
    github_repositorios: { nome: "repositorio", descricao_pt: "texto", descricao_en: "texto" }
};

/** Campos obrigatórios por coleção (o resto aceita vazio). */
const OBRIGATORIOS = { redes_sociais: ["nome", "url", "icone"], servicos: ["icone"], habilidades: ["nome_pt"], certificacoes: ["sigla"], github_repositorios: ["nome"] };

/** Currículo: PDF de até 1,9 MB (o D1 aceita 2 MB por registro). */
const MAXIMO_CURRICULO = 1.9 * 1024 * 1024;

const PERFIL = {
    nome_curto: "texto", nome_completo: "texto", nascimento: "data", email: "texto", telefone: "texto",
    whatsapp: "url", linkedin: "url", curriculo_pt: "url", curriculo_en: "url",
    saudacao_pt: "texto", saudacao_en: "texto", profissao_pt: "texto", profissao_en: "texto",
    descricao_hero_pt: "texto", descricao_hero_en: "texto", biografia_pt: "texto", biografia_en: "texto",
    endereco_pt: "texto", endereco_en: "texto", chamada_convite_pt: "texto", chamada_convite_en: "texto",
    chamada_citacao_pt: "texto", chamada_citacao_en: "texto", chamada_autor: "texto",
    foto_hero: "imagem", foto_biografia: "imagem", disponivel: "bool", inicio_carreira: "ano", github_exibir: "bool",
    hero_tamanho: "tamanho-foto", hero_opacidade_escuro: "opacidade", hero_opacidade_claro: "opacidade", hero_esmaecer: "esmaecer-foto", hero_esmaecer_direita: "esmaecer-foto", hero_luz_direita: "luz-foto"
};

/** Ajustes da foto do topo, em %: menor e maior valor aceitos, e o que dizer fora deles. */
const FAIXAS = {
    "tamanho-foto": [50, 100, "O tamanho da foto vai de 50% a 100%."],
    opacidade: [10, 100, "A opacidade vai de 10% a 100%."],
    "esmaecer-foto": [0, 100, "O esmaecimento vai de 0% a 100%."],
    "luz-foto": [-100, 100, "A luz vai de -100% a 100%."]
};

/** Valida os campos enviados conforme o tipo e devolve { coluna: valor } (só os presentes). */
async function validarCampos(env, dados, campos, obrigatorios = []) {
    const valores = {};

    for (const [campo, tipo] of Object.entries(campos)) {
        if (!(campo in dados)) {
            if (obrigatorios.includes(campo)) throw new ErroHttp(400, `Preencha o campo "${campo}".`);
            continue;
        }

        const obrigatorio = obrigatorios.includes(campo);

        if (tipo === "texto") valores[campo] = campoTexto(dados, campo, { obrigatorio });
        // Lista separada por vírgula (stack): normaliza os espaços e descarta itens vazios.
        else if (tipo === "lista") valores[campo] = campoTexto(dados, campo, { maximo: 500 }).split(",").map(item => item.trim()).filter(Boolean).join(", ");
        else if (tipo === "url") valores[campo] = campoUrl(dados, campo, { obrigatorio });
        else if (tipo === "bool") valores[campo] = dados[campo] ? 1 : 0;
        else if (tipo === "grupo") valores[campo] = campoInteiro(dados, campo);
        else if (tipo === "imagem") valores[campo] = await exigirImagem(env, dados[campo]);
        // Imagem que pode ser retirada: null ou vazio grava NULL.
        else if (tipo === "imagem-opcional") valores[campo] = dados[campo] ? await exigirImagem(env, dados[campo]) : null;
        else if (tipo === "icone") {
            if (!Object.hasOwn(ICONES, dados[campo])) throw new ErroHttp(400, "Ícone desconhecido.");
            valores[campo] = dados[campo];
        } else if (tipo === "data") {
            // Vazio é aceito (o nascimento e a idade somem da landing).
            const data = campoTexto(dados, campo, { obrigatorio });
            if (data && !/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new ErroHttp(400, "Data no formato AAAA-MM-DD.");
            valores[campo] = data;
        } else if (tipo === "ano") {
            // Vazio grava NULL.
            const texto = String(dados[campo] ?? "").trim();
            const ano = Number(texto);
            if (texto && (!Number.isInteger(ano) || ano < 1950 || ano > new Date().getUTCFullYear())) throw new ErroHttp(400, "Ano inválido.");
            valores[campo] = texto ? ano : null;
        } else if (Object.hasOwn(FAIXAS, tipo)) {
            const [minimo, maximo, mensagem] = FAIXAS[tipo];
            const valor = campoInteiro(dados, campo);
            if (valor < minimo || valor > maximo) throw new ErroHttp(400, mensagem);
            valores[campo] = valor;
        } else if (tipo === "repositorio") {
            // Nome de repositório do GitHub: letras, números, ponto, hífen e sublinhado.
            const nome = campoTexto(dados, campo, { maximo: 100, obrigatorio });
            if (!/^[A-Za-z0-9._-]*$/.test(nome)) throw new ErroHttp(400, "Nome de repositório inválido. Use o nome como aparece no GitHub, ex.: Portifolio.");
            valores[campo] = nome;
        }
    }

    return valores;
}

/** Perfil: só as colunas de PERFIL que vieram no pedido. */
export async function salvarPerfil(request, env) {
    const valores = await validarCampos(env, await lerJson(request), PERFIL);
    if (!Object.keys(valores).length) throw new ErroHttp(400, "Nada para salvar.");

    await env.DB.prepare(`UPDATE perfil SET ${Object.keys(valores).map(c => `${c} = ?`).join(", ")}, atualizado_em = datetime('now') WHERE id = 1`)
        .bind(...Object.values(valores)).run();
    return json(200, { ok: true });
}

export async function colecao(request, env, partes) {
    const [tabela, id] = partes;
    const campos = COLECOES[tabela];
    if (!campos) throw new ErroHttp(404, "Coleção desconhecida.");

    if (request.method === "POST" && id === "ordem") return reordenar(env, tabela, (await lerJson(request)).ids);

    if (request.method === "POST" && !id) {
        const valores = await validarCampos(env, await lerJson(request), campos, OBRIGATORIOS[tabela]);

        if (tabela === "habilidades") {
            if (!valores.grupo_id || !(await env.DB.prepare("SELECT 1 FROM grupos_habilidades WHERE id = ?").bind(valores.grupo_id).first())) {
                throw new ErroHttp(400, "Grupo inválido.");
            }
            valores.ordem = await proximaOrdem(env, tabela, "WHERE grupo_id = ?", valores.grupo_id);
        } else {
            valores.ordem = await proximaOrdem(env, tabela);
        }

        const colunas = Object.keys(valores);
        const linha = await env.DB.prepare(`INSERT INTO ${tabela} (${colunas.join(", ")}) VALUES (${colunas.map(() => "?").join(", ")}) RETURNING *`)
            .bind(...Object.values(valores)).first();
        return json(201, linha);
    }

    const numero = Number(id);
    if (!Number.isSafeInteger(numero)) throw new ErroHttp(404, "Não encontrado.");

    if (request.method === "PUT") {
        const valores = await validarCampos(env, await lerJson(request), campos);
        delete valores.grupo_id;
        if (!Object.keys(valores).length) throw new ErroHttp(400, "Nada para salvar.");

        for (const obrigatorio of OBRIGATORIOS[tabela] ?? []) {
            if (obrigatorio in valores && !valores[obrigatorio]) throw new ErroHttp(400, `Preencha o campo "${obrigatorio}".`);
        }

        const linha = await env.DB.prepare(`UPDATE ${tabela} SET ${Object.keys(valores).map(c => `${c} = ?`).join(", ")} WHERE id = ? RETURNING *`)
            .bind(...Object.values(valores), numero).first();
        if (!linha) throw new ErroHttp(404, "Não encontrado.");
        return json(200, linha);
    }

    if (request.method === "DELETE") {
        await env.DB.prepare(`DELETE FROM ${tabela} WHERE id = ?`).bind(numero).run();
        return json(200, { ok: true });
    }

    throw new ErroHttp(405, "Método não permitido.");
}

export async function imagensDoProjeto(request, env, projetoId, partes) {
    const projeto = await env.DB.prepare("SELECT id FROM projetos WHERE id = ?").bind(projetoId).first();
    if (!projeto) throw new ErroHttp(404, "Projeto não encontrado.");

    if (request.method === "POST" && partes[0] === "ordem") {
        const { ids } = await lerJson(request);
        if (!Array.isArray(ids)) throw new ErroHttp(400, "Lista inválida.");
        await env.DB.batch(ids.map((imagemId, ordem) =>
            env.DB.prepare("UPDATE projeto_imagens SET ordem = ? WHERE projeto_id = ? AND imagem_id = ?").bind(ordem, projetoId, imagemId)));
        return json(200, { ok: true });
    }

    if (request.method === "POST" && !partes[0]) {
        const dados = await lerJson(request);
        const imagem = await exigirImagem(env, dados.imagem_id);
        const ordem = await proximaOrdem(env, "projeto_imagens", "WHERE projeto_id = ?", projetoId);

        await env.DB.prepare("INSERT OR REPLACE INTO projeto_imagens (projeto_id, imagem_id, ordem, alt_pt, alt_en) VALUES (?, ?, ?, ?, ?)")
            .bind(projetoId, imagem, ordem, campoTexto(dados, "alt_pt", { maximo: 300 }), campoTexto(dados, "alt_en", { maximo: 300 })).run();
        return json(201, { ok: true });
    }

    if (request.method === "PUT" && partes[0]) {
        const dados = await lerJson(request);
        await env.DB.prepare("UPDATE projeto_imagens SET alt_pt = ?, alt_en = ? WHERE projeto_id = ? AND imagem_id = ?")
            .bind(campoTexto(dados, "alt_pt", { maximo: 300 }), campoTexto(dados, "alt_en", { maximo: 300 }), projetoId, partes[0]).run();
        return json(200, { ok: true });
    }

    if (request.method === "DELETE" && partes[0]) {
        await env.DB.prepare("DELETE FROM projeto_imagens WHERE projeto_id = ? AND imagem_id = ?").bind(projetoId, partes[0]).run();
        return json(200, { ok: true });
    }

    throw new ErroHttp(405, "Método não permitido.");
}

/**
 * Currículo em PDF de um idioma (curriculo_pt ou curriculo_en): o corpo do POST é o
 * próprio arquivo (application/pdf). GET devolve o PDF para conferir no painel; o
 * visitante baixa o arquivo estático gerado no build.
 */
export async function curriculoAdmin(request, env, nome) {
    if (request.method === "POST") {
        if (!(request.headers.get("content-type") || "").startsWith("application/pdf")) throw new ErroHttp(415, "Envie um arquivo PDF.");

        const dados = new Uint8Array(await request.arrayBuffer());
        if (!dados.length) throw new ErroHttp(400, "Arquivo vazio.");
        if (dados.length > MAXIMO_CURRICULO) throw new ErroHttp(413, "O PDF passa de 1,9 MB. Exporte com compressão e tente de novo.");
        // Todo PDF começa com "%PDF-".
        if (String.fromCharCode(...dados.subarray(0, 5)) !== "%PDF-") throw new ErroHttp(400, "O arquivo não é um PDF.");

        await env.DB.prepare(`INSERT INTO arquivos (nome, tipo, tamanho, dados) VALUES (?, 'application/pdf', ?, ?)
                              ON CONFLICT (nome) DO UPDATE SET tipo = excluded.tipo, tamanho = excluded.tamanho, dados = excluded.dados,
                                                               atualizado_em = datetime('now')`)
            .bind(nome, dados.length, dados).run();
        return json(201, { ok: true });
    }

    if (request.method === "GET") {
        const arquivo = await env.DB.prepare("SELECT dados FROM arquivos WHERE nome = ?").bind(nome).first();
        if (!arquivo) throw new ErroHttp(404, "Nenhum currículo enviado.");

        return new Response(new Uint8Array(arquivo.dados), {
            headers: { "content-type": "application/pdf", "content-disposition": `inline; filename=${nome}.pdf`, "cache-control": "no-store" }
        });
    }

    if (request.method === "DELETE") {
        await env.DB.prepare("DELETE FROM arquivos WHERE nome = ?").bind(nome).run();
        return json(200, { ok: true });
    }

    throw new ErroHttp(405, "Método não permitido.");
}
