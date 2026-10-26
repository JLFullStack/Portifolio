// Carrega conteudo/semente.json (e as fotos de public/imagens/) no banco D1.
//   npm run banco:semente           banco local (wrangler dev)
//   npm run banco:semente:remoto    banco publicado
// Só roda num banco sem perfil, para não apagar o que foi editado no painel.
// --substituir apaga todo o conteúdo e carrega a semente de novo.
//
// As imagens vão em pedaços: o D1 recusa comandos SQL acima de 100 KB, então cada
// arquivo entra com um INSERT do primeiro pedaço e UPDATEs que concatenam o resto.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ, consultar, executarArquivo, literal, remoto } from "./d1.mjs";

const PEDACO = 40 * 1024; // bytes por comando (80 KB em hexadecimal)
const substituir = process.argv.includes("--substituir");
const semente = JSON.parse(readFileSync(join(RAIZ, "conteudo", "semente.json"), "utf8"));
const destino = remoto ? "remoto" : "local";

const [[existente]] = consultar("SELECT count(*) AS n FROM perfil");
if (existente.n > 0 && !substituir) {
    console.error(`O banco ${destino} já tem conteúdo. Para apagar tudo e carregar a semente: --substituir`);
    process.exit(1);
}

const comandos = [
    // Ordem que respeita as chaves estrangeiras.
    ...["projeto_imagens", "depoimentos", "habilidades", "grupos_habilidades", "projetos", "perfil",
        "redes_sociais", "certificacoes", "formacoes", "experiencias", "imagem_arquivos", "imagens"]
        .map(tabela => `DELETE FROM ${tabela};`)
];

const valores = lista => lista.map(literal).join(", ");
const inserir = (tabela, campos) =>
    comandos.push(`INSERT INTO ${tabela} (${Object.keys(campos).join(", ")}) VALUES (${valores(Object.values(campos))});`);

/** Grava uma Foto da semente (arquivos public/imagens/<nome>-<largura>.webp) e devolve o id. */
function gravarFoto(foto) {
    const nome = foto.base.split("/").pop();
    const arquivos = foto.larguras.map(largura => ({ largura, dados: readFileSync(join(RAIZ, "public", "imagens", `${nome}-${largura}.webp`)) }));
    const hash = createHash("sha256");

    for (const arquivo of arquivos) hash.update(arquivo.dados);

    const id = hash.digest("hex").slice(0, 16);
    inserir("imagens", { id, largura: foto.largura, altura: foto.altura });

    for (const { largura, dados } of arquivos) {
        for (let inicio = 0; inicio < dados.length; inicio += PEDACO) {
            const hex = dados.subarray(inicio, inicio + PEDACO).toString("hex");

            comandos.push(inicio === 0
                ? `INSERT INTO imagem_arquivos (imagem_id, largura, dados) VALUES ('${id}', ${largura}, X'${hex}');`
                : `UPDATE imagem_arquivos SET dados = dados || X'${hex}' WHERE imagem_id = '${id}' AND largura = ${largura};`);
        }
    }

    return id;
}

const { perfil } = semente;

inserir("perfil", {
    id: 1,
    nome_curto: perfil.nomeCurto,
    nome_completo: perfil.nomeCompleto,
    nascimento: perfil.nascimento,
    email: perfil.email,
    telefone: perfil.telefone,
    whatsapp: perfil.whatsapp,
    linkedin: perfil.linkedin,
    curriculo: perfil.curriculo,
    saudacao_pt: perfil.saudacao.pt, saudacao_en: perfil.saudacao.en,
    profissao_pt: perfil.profissao.pt, profissao_en: perfil.profissao.en,
    descricao_hero_pt: perfil.descricaoHero.pt, descricao_hero_en: perfil.descricaoHero.en,
    biografia_pt: perfil.biografia.map(p => p.pt).join("\n\n"),
    biografia_en: perfil.biografia.map(p => p.en).join("\n\n"),
    endereco_pt: perfil.endereco.pt, endereco_en: perfil.endereco.en,
    chamada_convite_pt: perfil.chamadaConvite.pt, chamada_convite_en: perfil.chamadaConvite.en,
    chamada_citacao_pt: perfil.chamadaCitacao.pt, chamada_citacao_en: perfil.chamadaCitacao.en,
    chamada_autor: perfil.chamadaAutor,
    foto_hero: gravarFoto(perfil.fotoHero),
    foto_biografia: gravarFoto(perfil.fotoBiografia)
});

semente.redes.forEach((rede, ordem) => inserir("redes_sociais", { ordem, nome: rede.nome, url: rede.url, icone: rede.icone }));

semente.projetos.forEach((projeto, ordem) => {
    inserir("projetos", {
        id: projeto.id, ordem,
        titulo_pt: projeto.titulo.pt, titulo_en: projeto.titulo.en,
        descricao_pt: projeto.descricao.pt, descricao_en: projeto.descricao.en,
        url: projeto.url, exemplo: projeto.exemplo ? 1 : 0
    });

    if (projeto.imagem) inserir("projeto_imagens", { projeto_id: projeto.id, imagem_id: gravarFoto(projeto.imagem), ordem: 0 });
});

semente.depoimentos.forEach((depoimento, ordem) => {
    const foto = depoimento.foto ? gravarFoto(depoimento.foto) : null;

    // Já aprovados: "publicado" guarda a versão que vai para a landing (migrations/0002).
    inserir("depoimentos", {
        id: depoimento.id, ordem,
        nome: depoimento.nome,
        idioma_original: depoimento.idiomaOriginal,
        texto_pt: depoimento.texto.pt, texto_en: depoimento.texto.en,
        profissao_pt: depoimento.profissao.pt, profissao_en: depoimento.profissao.en,
        foto,
        situacao: "aprovado",
        publicado: JSON.stringify({
            nome: depoimento.nome, idiomaOriginal: depoimento.idiomaOriginal,
            texto: depoimento.texto, profissao: depoimento.profissao, foto
        }),
        exemplo: depoimento.exemplo ? 1 : 0
    });
});

semente.habilidades.forEach((grupo, ordem) => {
    const grupoId = ordem + 1;

    inserir("grupos_habilidades", { id: grupoId, ordem, titulo_pt: grupo.titulo.pt, titulo_en: grupo.titulo.en });
    grupo.itens.forEach((item, posicao) => inserir("habilidades", {
        grupo_id: grupoId, ordem: posicao,
        nome_pt: typeof item === "string" ? item : item.pt,
        nome_en: typeof item === "string" ? "" : item.en
    }));
});

semente.certificacoes.forEach((c, ordem) => inserir("certificacoes", { ordem, sigla: c.sigla, descricao_pt: c.descricao.pt, descricao_en: c.descricao.en }));

semente.formacoes.forEach((f, ordem) => inserir("formacoes", {
    ordem,
    periodo_pt: f.periodo.pt, periodo_en: f.periodo.en,
    titulo_pt: f.titulo.pt, titulo_en: f.titulo.en,
    instituicao_pt: f.instituicao.pt, instituicao_en: f.instituicao.en
}));

semente.experiencias.forEach((e, ordem) => inserir("experiencias", {
    ordem,
    periodo_pt: e.periodo.pt, periodo_en: e.periodo.en,
    cargo_pt: e.cargo.pt, cargo_en: e.cargo.en,
    empresa_pt: e.empresa.pt, empresa_en: e.empresa.en,
    endereco_pt: e.endereco.pt, endereco_en: e.endereco.en,
    descricao_pt: e.descricao.pt, descricao_en: e.descricao.en
}));

executarArquivo(comandos.join("\n"));
console.log(`Semente carregada no banco ${destino}: ${comandos.length} comandos.`);
