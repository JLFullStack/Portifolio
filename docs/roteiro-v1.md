# Roteiro da V1

Arquitetura, decisões e fases de desenvolvimento da V1 do portfólio.

## Objetivos

1. **A landing carrega rápido, inclusive no celular.** É a prioridade nº 1: nenhuma
   escolha abaixo pode piorar a landing. Meta: Lighthouse mobile ≥ 90 e LCP < 2,5 s em 4G.
2. **Custo zero.** Tudo dentro dos planos gratuitos do Cloudflare e do GitHub, sem nenhum
   serviço que exija cartão ou possa gerar cobrança.
3. Conteúdo editável sem mexer em código: **um único administrador** (o autor) atualiza
   fotos, dados pessoais, descrições, projetos e imagens dos projetos.
4. **Depoimentos por convite**: o administrador dá acesso a uma pessoa (sem cadastro
   aberto), ela escreve o depoimento com foto e profissão, e o depoimento fica
   **pendente até a aprovação**.
5. **Dois idiomas** (pt-BR e en) em todo o conteúdo, inclusive nos depoimentos.
6. Publicação em `https://lucasaraujo.dev.br`, no Cloudflare, a partir do GitHub.

## Arquitetura

```
                 GitHub (JLFullStack/Portifolio)
                    │ push em master  ou  "Publicar" no painel (repository_dispatch)
                    ▼
           GitHub Actions: exporta o conteúdo do D1 → next build (HTML estático) → wrangler deploy
                    │
                    ▼
   Cloudflare Worker "portifolio" (lucasaraujo.dev.br)
     ├── arquivos estáticos (out/)    →  /, /en, /midia/*, /login, /admin/*, /depoimento/*
     ├── worker/index.js              →  /api/*, /auth/* e a guarda de /admin e /depoimento
     └── D1  "portifolio"             →  conteúdo, imagens (WebP), usuários, sessões, convites
```

### Por que a landing é estática

- A landing é **HTML pronto, gerado no build**. Ela não consulta o banco em nenhuma
  visita: é a forma mais rápida possível e não gasta requisições de Worker nem de D1.
- O conteúdo editado fica no D1. Ao clicar em **Publicar**, o Worker dispara o GitHub
  Actions, que exporta o D1, roda o `next build` e faz o deploy. A landing é atualizada em
  cerca de 1 a 3 minutos.
- O painel e a área do depoente são páginas estáticas com componentes de cliente que
  chamam `/api/*`. Esse código fica em rotas separadas e **nunca é baixado por quem só
  visita a landing**.
- Alternativa descartada: Next.js renderizando no Worker (`@opennextjs/cloudflare`). A
  alteração apareceria na hora, mas o Worker fica maior, a renderização depende do
  servidor e a manutenção é mais complexa.

## Estrutura do repositório

```
app/                          rotas: (pt)/ = /, login, convite, depoimento, admin/*; (en)/en/ = /en; 404
componentes/landing/          uma seção da landing por arquivo
componentes/painel/           área restrita (login, convite, painel, depoente, imagens)
componentes/icones/           ícones do Font Awesome Pro em SVG inline
dicionarios/index.ts          textos fixos da interface em pt e en
lib/conteudo.ts               tipos do conteúdo e leitura no build
conteudo/semente.json         conteúdo inicial (popula o banco; usado no desenvolvimento sem banco)
conteudo/conteudo.json        exportado do D1 antes do build (não versionado)
public/midia/                 imagens exportadas do D1 (não versionado)
migrations/                   esquema do D1 (wrangler d1 migrations apply)
scripts/                      exportar-conteudo, carregar-semente, gerar-icones, otimizar-imagens
worker/                       index.js, auth.js, api.js, imagens.js, publicar.js, http.js
.github/workflows/            publicar.yml
docs/mockup-landing.png       mockup oficial da landing
```

Código, comentários e identificadores em **português**.

## Idiomas

- **Rotas**: `/` (pt-BR) e `/en`, geradas no build pelo mesmo componente
  `<Landing idioma="pt|en">`. O PT | EN é um link comum entre as duas.
- **Textos fixos da interface** ficam em `dicionarios/index.ts`, versionados.
- **Conteúdo editável** fica no D1, com uma coluna por idioma (`titulo_pt`, `titulo_en`...).
  No painel, cada campo traduzível tem as versões PT e EN. Se um idioma estiver vazio, a
  landing usa o outro.
- **Depoimentos**: a pessoa escreve no idioma dela (`idioma_original`). Ao aprovar ou
  editar, o administrador preenche a tradução. Sem tradução, a landing mostra o original
  com o `lang` correto.

## Banco D1 `portifolio`

Banco próprio do portfólio. Esquema em `migrations/0001_conteudo.sql`:

| Tabela | Conteúdo |
|---|---|
| `perfil` | Linha única: nomes, nascimento (a idade é calculada), contatos, links, textos do hero, biografia (parágrafos separados por linha em branco), endereço, chamada final e as fotos |
| `redes_sociais` | ordem, nome, url, ícone |
| `projetos` / `projeto_imagens` | textos pt/en, url, publicado; imagens do projeto (a primeira vai para o card) |
| `depoimentos` | nome, idioma original, texto e profissão pt/en, foto, situação (`pendente`, `aprovado`, `recusado`) |
| `grupos_habilidades` / `habilidades` | título do grupo; nome do item (`nome_en` vazio = igual ao pt) |
| `certificacoes`, `formacoes`, `experiencias` | textos pt/en, na ordem da landing |
| `imagens` / `imagem_arquivos` | id = hash do conteúdo, dimensões originais; um WebP por largura (BLOB) |
| `usuarios`, `sessoes`, `convites`, `tentativas_login`, `publicacoes` | acesso e histórico de publicações (`migrations/0002_acesso.sql`) |

A coluna `exemplo` marca os placeholders do mockup (projetos e depoimentos) da semente.
Eles foram removidos do banco publicado. A versão aprovada de cada depoimento fica em
`depoimentos.publicado` (JSON) e é a que vai para a landing.

## Imagens

As imagens ficam no próprio D1, sem R2: o R2 exige um meio de pagamento cadastrado e não
tem teto de gastos.

- O navegador **reduz e converte a imagem antes do upload** (canvas → WebP, larguras de
  480, 960 e 1600 conforme o uso; foto do depoente quadrada, até 480 px). Cada versão fica
  entre 20 e 300 KB, abaixo do limite de 2 MB por registro do D1. O Worker recusa
  arquivos que não sejam WebP ou que passem de 1 MB.
- **Na landing**, as imagens são **arquivos estáticos**: `scripts/exportar-conteudo.mjs`
  grava cada uma em `public/midia/<id>-<largura>.webp` antes do `next build`. O visitante
  nunca lê imagem do banco, e arquivo estático no Workers é gratuito e sem limite de
  acessos. O nome muda quando a imagem muda, então o cache é `immutable`.
- **No painel** (prévia antes de publicar, foto de depoimento pendente), o Worker serve a
  imagem do D1 em `/api/imagens/<id>`, só para quem está logado.
- O D1 recusa comandos SQL acima de 100 KB. Os scripts gravam imagens em pedaços
  (`INSERT` + `UPDATE ... dados || X'...'`); o Worker usa parâmetros, sem esse limite.
- Espaço: o D1 gratuito comporta 500 MB por banco. Cem imagens em três larguras somam
  cerca de 30 MB.

## Acesso

- **Login** em `/login`, aberto por um botão discreto na landing. A index é a landing.
  Login por e-mail e senha: hash PBKDF2 com `crypto.subtle`, cookie de sessão `HttpOnly`,
  `Secure` e `SameSite=Lax`, bloqueio de `Origin` estranha em métodos de escrita e limite
  de tentativas por IP.
- **Sem cadastro aberto.** O administrador é criado uma única vez por
  `scripts/criar-admin.mjs --remoto`, que imprime um link de uso único para definir a senha
  (rodado de novo, gera um link de nova senha). Não existe outro admin nem forma de virar admin pelo site.
- **Convite de depoente**: no painel, o administrador informa nome e e-mail e recebe um
  **link de uso único**, válido por 7 dias, para mandar à pessoa. Pelo link, a pessoa
  define a própria senha. Nenhuma senha passa pelo administrador.
- **Guarda no Worker**: `/admin/*` exige papel `admin`, `/depoimento/*` exige sessão.
  Sem sessão, a página redireciona para `/login?next=…`, e a API responde 401 ou 403.
  Toda regra de permissão fica no Worker, nunca no navegador.

| Papel | Pode |
|---|---|
| `admin` | Editar perfil, fotos, projetos com imagens, habilidades, certificações, formação e experiência; convidar, desativar e excluir depoentes; aprovar, recusar, traduzir, editar e ordenar depoimentos; publicar |
| `depoente` | Ver e editar **somente o próprio** depoimento: texto, profissão e foto. Ao salvar, o depoimento volta a ficar `pendente` |

Quando um depoimento já aprovado é editado, a versão aprovada continua na landing até a
nova ser aprovada.

## Desempenho da landing

| Item | Regra |
|---|---|
| JavaScript | ≤ 120 KB comprimido, todo `async`. Seções como componentes de servidor; só menu, tema, carrosséis, voltar ao topo, idade e ano são componentes de cliente |
| Ícones | Só Font Awesome Pro 5.13, como SVG inline dos ícones usados (`scripts/gerar-icones.mjs`). Sem CSS nem webfonts de ícones. O pacote Pro fica fora do git (`.local/`), porque o repositório é público e a licença proíbe redistribuí-lo |
| CSS | Sem framework. Embutido no HTML (`experimental.inlineCss`). Menu em `<dialog>` nativo, carrosséis com scroll-snap |
| Imagens | WebP com `srcset`; a foto do hero tem `fetchPriority="high"` e reserva o espaço (CLS 0) |
| Fontes | Inter variável, woff2 só latino (48 KB), pré-carregada; Ernestone sem preload |
| Tema | Script inline mínimo no `<head>`, para não piscar |

Medido na fase 1, no Cloudflare: Lighthouse mobile 99 em `/` e 93 em `/en`, CLS 0.

## Publicação

- **GitHub Actions** (`.github/workflows/publicar.yml`), disparado por push em `master`,
  por `repository_dispatch` (botão Publicar) ou manualmente: `npm ci` → migrações do D1 →
  `npm run deploy` → registra o resultado em `publicacoes`.
- **Manual**: `npm run deploy`, com o login do `wrangler login`.
- **Segredos do repositório**: `CLOUDFLARE_API_TOKEN` (modelo "Edit Cloudflare Workers"
  + *D1: Edit*) e `CLOUDFLARE_ACCOUNT_ID`.
- **Segredo do Worker**: `GITHUB_TOKEN_PUBLICAR`, um token *fine-grained* limitado a este
  repositório, só com *Contents: write*, usado para disparar o `repository_dispatch`.

## Fases

| # | Entrega | Situação |
|---|---|---|
| 1 | Landing estática em Next.js (pt/en, tema, ícones SVG, imagens WebP, 404) publicada em `portifolio.joselucas-aaraujo.workers.dev` | Concluída: Lighthouse mobile 99 / 93 |
| 2 | Esquema do D1, carga da semente, exportação do conteúdo e das imagens no build | Concluída |
| 3 | Login, sessões, `criar-admin.mjs`, guarda das rotas no Worker | Concluída |
| 4 | Painel: perfil, projetos, seções, upload de imagens para o D1 | Concluída |
| 5 | Convites, área do depoente, moderação e tradução | Concluída |
| 6 | Botão Publicar (`repository_dispatch`) e histórico; deploy pelo GitHub Actions | Concluída (falta cadastrar os segredos) |
| 7 | Domínio `lucasaraujo.dev.br`, remoção dos placeholders, `robots.txt` e `sitemap.xml` | Concluída (falta desativar o GitHub Pages) |

## Observações

- Os dados pessoais exibidos (telefone, e-mail, data de nascimento) são públicos na
  landing. Vale revisar o que deve aparecer quando o painel estiver pronto.
- Backups: `wrangler d1 export portifolio --remote` periódico no Actions; o export inclui
  as imagens.
