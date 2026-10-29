-- Ano em que a carreira começou: base do número "Anos de experiência" da biografia.
-- NULL: vale o ano mais antigo citado nos períodos das experiências.
ALTER TABLE perfil ADD COLUMN inicio_carreira INTEGER;

-- Seção "Código aberto" (repositórios do GitHub): 1 mostra, 0 esconde.
ALTER TABLE perfil ADD COLUMN github_exibir INTEGER NOT NULL DEFAULT 1;

-- Repositórios escolhidos para a seção, na ordem da landing. Sem nenhum, entram os
-- seis mais estrelados (e, no empate, os mais recentes). nome: o do repositório no
-- GitHub; descrição vazia usa a do próprio GitHub.
CREATE TABLE github_repositorios (
    id            INTEGER PRIMARY KEY,
    ordem         INTEGER NOT NULL DEFAULT 0,
    nome          TEXT    NOT NULL,
    descricao_pt  TEXT    NOT NULL DEFAULT '',
    descricao_en  TEXT    NOT NULL DEFAULT ''
);
