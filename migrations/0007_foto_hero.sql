-- Como a foto do topo aparece na hero, ajustado no painel. hero_tamanho: de 50 a 100, em %
-- do maior tamanho que ela alcança. Opacidade por tema: de 10 a 100, em %; em 100 a foto
-- fica nítida, e valores menores a integram ao fundo da página. hero_esmaecer: de 0 a 100,
-- em %, quanto o lado esquerdo da foto se dissolve no fundo; hero_esmaecer_direita, o mesmo
-- do lado direito. hero_luz_direita: de -100 a 100, em %; negativo escurece e positivo
-- clareia o lado direito da foto.
ALTER TABLE perfil ADD COLUMN hero_tamanho INTEGER NOT NULL DEFAULT 100;
ALTER TABLE perfil ADD COLUMN hero_opacidade_escuro INTEGER NOT NULL DEFAULT 70;
ALTER TABLE perfil ADD COLUMN hero_opacidade_claro INTEGER NOT NULL DEFAULT 93;
ALTER TABLE perfil ADD COLUMN hero_esmaecer INTEGER NOT NULL DEFAULT 60;
ALTER TABLE perfil ADD COLUMN hero_esmaecer_direita INTEGER NOT NULL DEFAULT 0;
ALTER TABLE perfil ADD COLUMN hero_luz_direita INTEGER NOT NULL DEFAULT 0;
