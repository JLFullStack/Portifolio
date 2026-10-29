-- Perfil do LinkedIn de quem dá o depoimento (opcional). Entra na versão aprovada
-- ("publicado") e vira um botão no card da landing.
ALTER TABLE depoimentos ADD COLUMN linkedin TEXT NOT NULL DEFAULT '';
