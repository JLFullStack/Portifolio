-- Acesso à área restrita: contas, sessões, convites e o histórico de publicações.
-- Sem cadastro aberto: o administrador é criado por scripts/criar-admin.mjs e os
-- depoentes, por convite no painel. Senhas e tokens só são guardados como hash.

CREATE TABLE usuarios (
    id              INTEGER PRIMARY KEY,
    nome            TEXT    NOT NULL,
    email           TEXT    NOT NULL UNIQUE,            -- sempre em minúsculas
    papel           TEXT    NOT NULL CHECK (papel IN ('admin', 'depoente')),
    senha_hash      TEXT,                                -- PBKDF2-SHA256 (hex); NULL até aceitar o convite
    senha_sal       TEXT,
    ativo           INTEGER NOT NULL DEFAULT 1,
    criado_em       TEXT    NOT NULL DEFAULT (datetime('now')),
    ultimo_acesso   TEXT
);

-- Um único administrador.
CREATE UNIQUE INDEX usuarios_um_admin ON usuarios (papel) WHERE papel = 'admin';

-- Sessão de login: o cookie leva o token; aqui fica só o SHA-256 dele.
CREATE TABLE sessoes (
    token_hash  TEXT    PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    expira_em   TEXT    NOT NULL,
    criada_em   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Link de uso único para a pessoa definir a própria senha (convite ou nova senha).
CREATE TABLE convites (
    token_hash  TEXT    PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    expira_em   TEXT    NOT NULL,
    usado_em    TEXT,
    criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Tentativas de login que falharam, para limitar força bruta por IP.
CREATE TABLE tentativas_login (
    ip      TEXT NOT NULL,
    quando  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX tentativas_login_ip ON tentativas_login (ip, quando);

-- Cada clique em Publicar: o GitHub Actions atualiza a situação ao terminar.
CREATE TABLE publicacoes (
    id          INTEGER PRIMARY KEY,
    usuario_id  INTEGER REFERENCES usuarios (id) ON DELETE SET NULL,
    pedida_em   TEXT    NOT NULL DEFAULT (datetime('now')),
    situacao    TEXT    NOT NULL DEFAULT 'pedida' CHECK (situacao IN ('pedida', 'concluida', 'falhou')),
    concluida_em TEXT,
    detalhe     TEXT
);

-- Depoimentos: a versão aprovada fica guardada em "publicado" (JSON) e é a que vai
-- para a landing. Assim, quando a pessoa edita um depoimento já aprovado, a versão
-- anterior continua no ar até a nova ser aprovada.
ALTER TABLE depoimentos ADD COLUMN publicado TEXT;

UPDATE depoimentos
   SET publicado = json_object(
           'nome', nome, 'idiomaOriginal', idioma_original,
           'texto', json_object('pt', texto_pt, 'en', texto_en),
           'profissao', json_object('pt', profissao_pt, 'en', profissao_en),
           'foto', foto),
       aprovado_em = coalesce(aprovado_em, datetime('now'))
 WHERE situacao = 'aprovado';

-- Cada pessoa tem no máximo um depoimento.
CREATE UNIQUE INDEX depoimentos_usuario ON depoimentos (usuario_id) WHERE usuario_id IS NOT NULL;
