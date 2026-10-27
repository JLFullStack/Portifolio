-- Vitrine da landing: projetos mais completos, serviços, selo de disponibilidade,
-- currículo em PDF guardado no próprio banco e as mensagens do formulário de contato.

-- Projetos: tecnologias usadas, link do código-fonte e uma etiqueta de situação
-- ("Em produção", "Projeto pessoal"...). stack: nomes separados por vírgula.
ALTER TABLE projetos ADD COLUMN stack TEXT NOT NULL DEFAULT '';
ALTER TABLE projetos ADD COLUMN repositorio TEXT;
ALTER TABLE projetos ADD COLUMN situacao_pt TEXT NOT NULL DEFAULT '';
ALTER TABLE projetos ADD COLUMN situacao_en TEXT NOT NULL DEFAULT '';

-- Experiências: as tecnologias de cada cargo, também separadas por vírgula.
ALTER TABLE experiencias ADD COLUMN stack TEXT NOT NULL DEFAULT '';

-- Selo "Disponível para novos projetos" no topo da landing (1 = mostra).
ALTER TABLE perfil ADD COLUMN disponivel INTEGER NOT NULL DEFAULT 0;

-- Um currículo por idioma: o link atual passa a ser o do português.
-- curriculo_en vazio: a página em inglês usa o do português.
ALTER TABLE perfil RENAME COLUMN curriculo TO curriculo_pt;
ALTER TABLE perfil ADD COLUMN curriculo_en TEXT NOT NULL DEFAULT '';

-- Seção "O que eu faço": um card por serviço. icone: nome em componentes/icones/dados.ts.
CREATE TABLE servicos (
    id            INTEGER PRIMARY KEY,
    ordem         INTEGER NOT NULL DEFAULT 0,
    icone         TEXT    NOT NULL,
    titulo_pt     TEXT    NOT NULL DEFAULT '',
    titulo_en     TEXT    NOT NULL DEFAULT '',
    descricao_pt  TEXT    NOT NULL DEFAULT '',
    descricao_en  TEXT    NOT NULL DEFAULT '',
    exemplo       INTEGER NOT NULL DEFAULT 0
);

-- Sugestões iniciais, marcadas como exemplo para revisar no painel.
INSERT INTO servicos (ordem, icone, titulo_pt, titulo_en, descricao_pt, descricao_en, exemplo) VALUES
    (0, 'fal:server', 'APIs e integrações', 'APIs and integrations',
     'APIs REST seguras e documentadas que conectam sistemas, bancos de dados e serviços externos.',
     'Secure, well-documented REST APIs that connect systems, databases, and external services.', 1),
    (1, 'fal:laptop-code', 'Sistemas web', 'Web applications',
     'Aplicações web completas, do banco de dados à interface, com foco em desempenho e usabilidade.',
     'End-to-end web applications, from the database to the interface, built for performance and usability.', 1),
    (2, 'fal:sync-alt', 'Modernização de sistemas', 'System modernization',
     'Evolução de sistemas legados para arquiteturas limpas, testáveis e fáceis de manter.',
     'Modernizing legacy systems into clean, testable, and maintainable architectures.', 1),
    (3, 'fal:tools', 'Manutenção e suporte', 'Maintenance and support',
     'Correções, melhorias contínuas e acompanhamento para o sistema seguir estável em produção.',
     'Bug fixes, continuous improvements, and monitoring to keep your system stable in production.', 1);

-- Arquivos para download servidos pela landing: o currículo em PDF, um por idioma.
-- No build, scripts/exportar-conteudo.mjs grava cada um em public/curriculo-<idioma>.pdf.
-- Até 1,9 MB (o D1 aceita 2 MB por registro).
CREATE TABLE arquivos (
    nome           TEXT    PRIMARY KEY CHECK (nome IN ('curriculo_pt', 'curriculo_en')),
    tipo           TEXT    NOT NULL,
    tamanho        INTEGER NOT NULL,
    dados          BLOB    NOT NULL,
    atualizado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Mensagens do formulário de contato da landing (POST /contato, worker/contato.js).
-- ip_hash: SHA-256 do IP, só para limitar envios repetidos; o IP em si não é guardado.
CREATE TABLE mensagens (
    id          INTEGER PRIMARY KEY,
    nome        TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    interesse   TEXT    NOT NULL DEFAULT '',
    texto       TEXT    NOT NULL,
    idioma      TEXT    NOT NULL DEFAULT 'pt' CHECK (idioma IN ('pt', 'en')),
    ip_hash     TEXT    NOT NULL,
    lida        INTEGER NOT NULL DEFAULT 0,
    enviada_em  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX mensagens_ip ON mensagens (ip_hash, enviada_em);
