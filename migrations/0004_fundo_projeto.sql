-- Imagem de fundo de cada projeto: aparece bem apagada atrás da seção Projetos,
-- como papel de parede, enquanto o projeto está ativo na vitrine. É separada das
-- imagens do card (projeto_imagens) porque tem outra proporção (paisagem, 16:9).
-- NULL: o projeto não tem fundo.
ALTER TABLE projetos ADD COLUMN fundo TEXT REFERENCES imagens (id);
