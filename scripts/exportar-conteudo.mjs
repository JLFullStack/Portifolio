// Exporta o conteúdo do D1 para o build da landing:
//   conteudo/conteudo.json         o conteúdo no formato de lib/conteudo.ts (Conteudo)
//   public/midia/<id>-<larg>.webp  as imagens usadas, como arquivos estáticos
//   public/curriculo-<idioma>.pdf  os currículos enviados no painel (se houver), um por idioma
// npm run conteudo (banco local) | npm run conteudo:remoto (banco publicado; o deploy usa este).
//
// Só entra o que a landing mostra: projetos publicados e a versão aprovada de cada
// depoimento (coluna "publicado", que não muda quando a pessoa edita o texto depois).
// O visitante nunca lê imagem do banco: elas viram arquivos servidos pelo Cloudflare.
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ, consultar, literal, remoto } from "./d1.mjs";

const PASTA_MIDIA = join(RAIZ, "public", "midia");
const LOTE_BYTES = 2 * 1024 * 1024; // imagens buscadas por consulta (o hexadecimal dobra o tamanho)

const CURRICULO = idioma => join(RAIZ, "public", `curriculo-${idioma}.pdf`);

const [perfis, redes, servicos, projetos, projetoImagens, depoimentos, grupos, habilidades, certificacoes, formacoes, experiencias, curriculos] = consultar(`
    SELECT * FROM perfil WHERE id = 1;
    SELECT * FROM redes_sociais ORDER BY ordem, id;
    SELECT * FROM servicos ORDER BY ordem, id;
    SELECT * FROM projetos WHERE publicado = 1 ORDER BY ordem, id;
    SELECT * FROM projeto_imagens ORDER BY projeto_id, ordem;
    SELECT id, publicado FROM depoimentos WHERE publicado IS NOT NULL ORDER BY ordem, id;
    SELECT * FROM grupos_habilidades ORDER BY ordem, id;
    SELECT * FROM habilidades ORDER BY grupo_id, ordem, id;
    SELECT * FROM certificacoes ORDER BY ordem, id;
    SELECT * FROM formacoes ORDER BY ordem, id;
    SELECT * FROM experiencias ORDER BY ordem, id;
    SELECT nome, hex(dados) AS hex FROM arquivos WHERE nome LIKE 'curriculo_%';
`);

const perfil = perfis[0];
if (!perfil) {
    console.error(`O banco ${remoto ? "remoto" : "local"} não tem perfil. Rode as migrações e carregue a semente:\n` +
        `  npm run banco:migrar${remoto ? ":remoto" : ""} && npm run banco:semente${remoto ? ":remoto" : ""}`);
    process.exit(1);
}

const t = (linha, campo) => ({ pt: linha[`${campo}_pt`] ?? "", en: linha[`${campo}_en`] ?? "" });
const lista = texto => (texto ?? "").split(",").map(item => item.trim()).filter(Boolean);

// Currículo de cada idioma enviado no painel: vira um arquivo do site e o Download CV
// daquele idioma passa a apontar para ele. Sem PDF, vale o link do perfil (e um PDF
// antigo é apagado). Campo vazio em inglês usa o do português (texto(), na landing).
const curriculo = {};
for (const idioma of ["pt", "en"]) {
    const pdf = curriculos.find(c => c.nome === `curriculo_${idioma}`);

    if (pdf) writeFileSync(CURRICULO(idioma), Buffer.from(pdf.hex, "hex"));
    else if (existsSync(CURRICULO(idioma))) rmSync(CURRICULO(idioma));

    curriculo[idioma] = pdf ? `/curriculo-${idioma}.pdf` : perfil[`curriculo_${idioma}`] ?? "";
}
const aprovados = depoimentos.map(d => ({ id: d.id, ...JSON.parse(d.publicado) }));

// Imagens usadas pela landing: perfil, primeira imagem de cada projeto e fotos dos depoimentos.
const primeiraImagem = new Map();
for (const item of projetoImagens) if (!primeiraImagem.has(item.projeto_id)) primeiraImagem.set(item.projeto_id, item);

const idsUsados = new Set([perfil.foto_hero, perfil.foto_biografia]);
for (const projeto of projetos) {
    if (primeiraImagem.has(projeto.id)) idsUsados.add(primeiraImagem.get(projeto.id).imagem_id);
    if (projeto.fundo) idsUsados.add(projeto.fundo);
}
for (const depoimento of aprovados) if (depoimento.foto) idsUsados.add(depoimento.foto);

const ids = [...idsUsados].map(literal).join(", ");
const [imagens, arquivos] = consultar(`
    SELECT id, largura, altura FROM imagens WHERE id IN (${ids});
    SELECT imagem_id, largura, length(dados) AS tamanho FROM imagem_arquivos WHERE imagem_id IN (${ids}) ORDER BY imagem_id, largura;
`);

const fotos = new Map(imagens.map(imagem => [imagem.id, {
    base: `/midia/${imagem.id}`,
    larguras: arquivos.filter(a => a.imagem_id === imagem.id).map(a => a.largura),
    largura: imagem.largura,
    altura: imagem.altura
}]));
const foto = id => (id && fotos.get(id)) || null;

// Grava em public/midia só o que falta: o nome tem o hash do conteúdo, então
// um arquivo já existente é sempre o mesmo.
mkdirSync(PASTA_MIDIA, { recursive: true });
const nomeArquivo = a => `${a.imagem_id}-${a.largura}.webp`;
const esperados = new Set(arquivos.map(nomeArquivo));

for (const existente of readdirSync(PASTA_MIDIA)) if (!esperados.has(existente)) rmSync(join(PASTA_MIDIA, existente));

const faltando = arquivos.filter(a => !existsSync(join(PASTA_MIDIA, nomeArquivo(a))));
let lote = [];
let bytesLote = 0;

const baixarLote = () => {
    if (!lote.length) return;

    const condicao = lote.map(a => `(imagem_id = ${literal(a.imagem_id)} AND largura = ${a.largura})`).join(" OR ");
    const [linhas] = consultar(`SELECT imagem_id, largura, hex(dados) AS hex FROM imagem_arquivos WHERE ${condicao};`);

    for (const linha of linhas) writeFileSync(join(PASTA_MIDIA, nomeArquivo(linha)), Buffer.from(linha.hex, "hex"));

    lote = [];
    bytesLote = 0;
};

for (const arquivo of faltando) {
    if (bytesLote + arquivo.tamanho > LOTE_BYTES) baixarLote();
    lote.push(arquivo);
    bytesLote += arquivo.tamanho;
}
baixarLote();

const conteudo = {
    perfil: {
        nomeCurto: perfil.nome_curto,
        nomeCompleto: perfil.nome_completo,
        nascimento: perfil.nascimento,
        email: perfil.email,
        telefone: perfil.telefone,
        whatsapp: perfil.whatsapp,
        linkedin: perfil.linkedin,
        curriculo,
        saudacao: t(perfil, "saudacao"),
        profissao: t(perfil, "profissao"),
        descricaoHero: t(perfil, "descricao_hero"),
        biografia: paragrafos(perfil.biografia_pt, perfil.biografia_en),
        endereco: t(perfil, "endereco"),
        chamadaConvite: t(perfil, "chamada_convite"),
        chamadaCitacao: t(perfil, "chamada_citacao"),
        chamadaAutor: perfil.chamada_autor,
        fotoHero: foto(perfil.foto_hero),
        fotoBiografia: foto(perfil.foto_biografia),
        disponivel: Boolean(perfil.disponivel)
    },
    redes: redes.map(rede => ({ nome: rede.nome, url: rede.url, icone: rede.icone })),
    servicos: servicos.map(servico => ({ icone: servico.icone, titulo: t(servico, "titulo"), descricao: t(servico, "descricao") })),
    projetos: projetos.map(projeto => ({
        id: projeto.id,
        titulo: t(projeto, "titulo"),
        descricao: t(projeto, "descricao"),
        url: projeto.url || null,
        repositorio: projeto.repositorio || null,
        stack: lista(projeto.stack),
        situacao: t(projeto, "situacao"),
        imagem: foto(primeiraImagem.get(projeto.id)?.imagem_id),
        fundo: foto(projeto.fundo)
    })),
    depoimentos: aprovados.map(depoimento => ({
        id: depoimento.id,
        nome: depoimento.nome,
        idiomaOriginal: depoimento.idiomaOriginal,
        texto: depoimento.texto,
        profissao: depoimento.profissao,
        foto: foto(depoimento.foto)
    })),
    habilidades: grupos.map(grupo => ({
        titulo: t(grupo, "titulo"),
        itens: habilidades.filter(h => h.grupo_id === grupo.id).map(h => (h.nome_en ? { pt: h.nome_pt, en: h.nome_en } : h.nome_pt))
    })),
    certificacoes: certificacoes.map(c => ({ sigla: c.sigla, descricao: t(c, "descricao") })),
    formacoes: formacoes.map(f => ({ periodo: t(f, "periodo"), titulo: t(f, "titulo"), instituicao: t(f, "instituicao") })),
    experiencias: experiencias.map(e => ({
        periodo: t(e, "periodo"), cargo: t(e, "cargo"), empresa: t(e, "empresa"), endereco: t(e, "endereco"), descricao: t(e, "descricao"),
        stack: lista(e.stack)
    }))
};

writeFileSync(join(RAIZ, "conteudo", "conteudo.json"), JSON.stringify(conteudo, null, 2));
console.log(`Conteúdo exportado do banco ${remoto ? "remoto" : "local"}: ${projetos.length} projetos, ${depoimentos.length} depoimentos, ` +
    `${arquivos.length} arquivos de imagem (${faltando.length} baixados), ${curriculos.length} currículo(s) em PDF.`);

/** Parágrafos da biografia (separados por linha em branco) pareados entre os idiomas. */
function paragrafos(pt, en) {
    const dividir = texto => (texto ?? "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const [listaPt, listaEn] = [dividir(pt), dividir(en)];

    return Array.from({ length: Math.max(listaPt.length, listaEn.length) }, (_, i) => ({ pt: listaPt[i] ?? "", en: listaEn[i] ?? "" }));
}
