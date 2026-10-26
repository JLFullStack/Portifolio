-- Conteúdo editável da landing (banco D1 "portifolio").
-- Campos traduzíveis têm uma coluna por idioma (_pt, _en). Campo vazio num idioma
-- faz a landing usar o do outro (lib/conteudo.ts, texto()).
-- A coluna "ordem" define a posição na landing; "exemplo" = 1 marca os placeholders
-- do mockup, para o painel identificá-los e permitir excluí-los.

-- Imagens: WebP já reduzido no navegador (ou por scripts/carregar-semente.mjs).
-- O id é o hash do conteúdo, então muda quando a imagem muda e o cache pode ser imutável.
-- No build, scripts/exportar-conteudo.mjs grava cada largura em public/midia/<id>-<largura>.webp.
CREATE TABLE imagens (
    id         TEXT    PRIMARY KEY,
    largura    INTEGER NOT NULL,          -- da imagem original, para a proporção do <img>
    altura     INTEGER NOT NULL,
    criada_em  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Um arquivo WebP por largura gerada. Até 1 MB cada (o D1 aceita 2 MB por registro).
CREATE TABLE imagem_arquivos (
    imagem_id  TEXT    NOT NULL REFERENCES imagens (id) ON DELETE CASCADE,
    largura    INTEGER NOT NULL,
    dados      BLOB    NOT NULL,
    PRIMARY KEY (imagem_id, largura)
);

-- Linha única com os dados pessoais e os textos fixos do perfil.
CREATE TABLE perfil (
    id                  INTEGER PRIMARY KEY CHECK (id = 1),
    nome_curto          TEXT NOT NULL,
    nome_completo       TEXT NOT NULL,
    nascimento          TEXT NOT NULL,     -- AAAA-MM-DD; a idade é calculada
    email               TEXT NOT NULL,
    telefone            TEXT NOT NULL,
    whatsapp            TEXT NOT NULL,
    linkedin            TEXT NOT NULL,
    curriculo           TEXT NOT NULL,
    saudacao_pt         TEXT NOT NULL DEFAULT '',
    saudacao_en         TEXT NOT NULL DEFAULT '',
    profissao_pt        TEXT NOT NULL DEFAULT '',
    profissao_en        TEXT NOT NULL DEFAULT '',
    descricao_hero_pt   TEXT NOT NULL DEFAULT '',
    descricao_hero_en   TEXT NOT NULL DEFAULT '',
    biografia_pt        TEXT NOT NULL DEFAULT '',   -- parágrafos separados por linha em branco
    biografia_en        TEXT NOT NULL DEFAULT '',
    endereco_pt         TEXT NOT NULL DEFAULT '',
    endereco_en         TEXT NOT NULL DEFAULT '',
    chamada_convite_pt  TEXT NOT NULL DEFAULT '',
    chamada_convite_en  TEXT NOT NULL DEFAULT '',
    chamada_citacao_pt  TEXT NOT NULL DEFAULT '',
    chamada_citacao_en  TEXT NOT NULL DEFAULT '',
    chamada_autor       TEXT NOT NULL DEFAULT '',
    foto_hero           TEXT NOT NULL REFERENCES imagens (id),
    foto_biografia      TEXT NOT NULL REFERENCES imagens (id),
    atualizado_em       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE redes_sociais (
    id     INTEGER PRIMARY KEY,
    ordem  INTEGER NOT NULL DEFAULT 0,
    nome   TEXT    NOT NULL,
    url    TEXT    NOT NULL,
    icone  TEXT    NOT NULL                 -- nome em componentes/icones/dados.ts, ex.: fab:github
);

CREATE TABLE projetos (
    id            INTEGER PRIMARY KEY,
    ordem         INTEGER NOT NULL DEFAULT 0,
    titulo_pt     TEXT    NOT NULL DEFAULT '',
    titulo_en     TEXT    NOT NULL DEFAULT '',
    descricao_pt  TEXT    NOT NULL DEFAULT '',
    descricao_en  TEXT    NOT NULL DEFAULT '',
    url           TEXT,
    publicado     INTEGER NOT NULL DEFAULT 1,
    exemplo       INTEGER NOT NULL DEFAULT 0
);

-- Imagens de cada projeto; a de menor ordem é a do card na landing.
CREATE TABLE projeto_imagens (
    projeto_id  INTEGER NOT NULL REFERENCES projetos (id) ON DELETE CASCADE,
    imagem_id   TEXT    NOT NULL REFERENCES imagens (id),
    ordem       INTEGER NOT NULL DEFAULT 0,
    alt_pt      TEXT    NOT NULL DEFAULT '',
    alt_en      TEXT    NOT NULL DEFAULT '',
    PRIMARY KEY (projeto_id, imagem_id)
);

-- Depoimentos. A pessoa escreve no próprio idioma (idioma_original) e o administrador
-- completa a tradução ao aprovar. Só os aprovados vão para a landing.
-- usuario_id é ligado às contas na fase 3.
CREATE TABLE depoimentos (
    id               INTEGER PRIMARY KEY,
    usuario_id       INTEGER,
    ordem            INTEGER NOT NULL DEFAULT 0,
    nome             TEXT    NOT NULL,
    idioma_original  TEXT    NOT NULL CHECK (idioma_original IN ('pt', 'en')),
    texto_pt         TEXT    NOT NULL DEFAULT '',
    texto_en         TEXT    NOT NULL DEFAULT '',
    profissao_pt     TEXT    NOT NULL DEFAULT '',
    profissao_en     TEXT    NOT NULL DEFAULT '',
    foto             TEXT    REFERENCES imagens (id),
    situacao         TEXT    NOT NULL DEFAULT 'pendente' CHECK (situacao IN ('pendente', 'aprovado', 'recusado')),
    enviado_em       TEXT    NOT NULL DEFAULT (datetime('now')),
    aprovado_em      TEXT,
    exemplo          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE grupos_habilidades (
    id         INTEGER PRIMARY KEY,
    ordem      INTEGER NOT NULL DEFAULT 0,
    titulo_pt  TEXT    NOT NULL DEFAULT '',
    titulo_en  TEXT    NOT NULL DEFAULT ''
);

-- nome_en vazio: o mesmo do português (nomes próprios como C# ou Git).
CREATE TABLE habilidades (
    id        INTEGER PRIMARY KEY,
    grupo_id  INTEGER NOT NULL REFERENCES grupos_habilidades (id) ON DELETE CASCADE,
    ordem     INTEGER NOT NULL DEFAULT 0,
    nome_pt   TEXT    NOT NULL,
    nome_en   TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE certificacoes (
    id            INTEGER PRIMARY KEY,
    ordem         INTEGER NOT NULL DEFAULT 0,
    sigla         TEXT    NOT NULL,
    descricao_pt  TEXT    NOT NULL DEFAULT '',
    descricao_en  TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE formacoes (
    id              INTEGER PRIMARY KEY,
    ordem           INTEGER NOT NULL DEFAULT 0,
    periodo_pt      TEXT    NOT NULL DEFAULT '',
    periodo_en      TEXT    NOT NULL DEFAULT '',
    titulo_pt       TEXT    NOT NULL DEFAULT '',
    titulo_en       TEXT    NOT NULL DEFAULT '',
    instituicao_pt  TEXT    NOT NULL DEFAULT '',
    instituicao_en  TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE experiencias (
    id            INTEGER PRIMARY KEY,
    ordem         INTEGER NOT NULL DEFAULT 0,
    periodo_pt    TEXT    NOT NULL DEFAULT '',
    periodo_en    TEXT    NOT NULL DEFAULT '',
    cargo_pt      TEXT    NOT NULL DEFAULT '',
    cargo_en      TEXT    NOT NULL DEFAULT '',
    empresa_pt    TEXT    NOT NULL DEFAULT '',
    empresa_en    TEXT    NOT NULL DEFAULT '',
    endereco_pt   TEXT    NOT NULL DEFAULT '',
    endereco_en   TEXT    NOT NULL DEFAULT '',
    descricao_pt  TEXT    NOT NULL DEFAULT '',
    descricao_en  TEXT    NOT NULL DEFAULT ''
);
