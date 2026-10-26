# Plano de migração — Blazor Server → Next.js no Cloudflare

Decidido em 26/10/2026. Referência de arquitetura e publicação: a aplicação
`market-pressure` (só leitura — nada nela é alterado; cada aplicação tem o seu banco).

## Objetivos

1. **A landing carrega rápido, inclusive no celular.** É a prioridade nº 1: nenhuma
   escolha abaixo pode piorar a landing. Meta: Lighthouse mobile ≥ 90 e LCP < 2,5 s em 4G.
2. Conteúdo editável sem mexer em código: **um único administrador** (o autor) atualiza
   fotos, dados pessoais, descrições, projetos e imagens dos projetos.
3. **Depoimentos por convite**: o administrador dá acesso a uma pessoa (sem cadastro
   aberto), ela escreve o depoimento com foto e profissão, e o depoimento fica
   **pendente até a aprovação**.
4. **Dois idiomas** (pt-BR e en) em todo o conteúdo, inclusive nos depoimentos.
5. Publicação em `https://lucasaraujo.dev.br` (raiz), no Cloudflare, a partir do GitHub.
   O GitHub Pages atual é desativado.

## Arquitetura

```
                 GitHub (JLFullStack/Portifolio)
                    │ push em master  ou  "Publicar" no painel (repository_dispatch)
                    ▼
           GitHub Actions: lê o conteúdo do D1 → next build (HTML estático) → wrangler deploy
                    │
                    ▼
   Cloudflare Worker "portifolio" (lucasaraujo.dev.br)
     ├── arquivos estáticos (out/)    →  /, /en, /login, /admin/*, /depoimento/*   (sem passar pelo Worker)
     ├── worker/index.js              →  /api/*, /auth/*, e a guarda de /admin e /depoimento
     └── D1  "portifolio"             →  conteúdo, imagens (WebP), usuários, sessões, convites
```

### Por que a landing é estática (e reconstruída ao publicar)

- A landing é **HTML pronto, gerado no build**. Ela não consulta o banco em nenhuma
  visita: é a forma mais rápida possível e não gasta requisições de Worker nem de D1.
- O conteúdo editado fica no D1. Ao clicar em **Publicar**, o Worker dispara o GitHub
  Actions, que lê o D1, roda o `next build` e faz o deploy. A landing é atualizada em cerca
  de 1 a 3 minutos.
- O painel e a área do depoente são páginas estáticas com componentes de cliente que
  chamam `/api/*`, o mesmo modelo do `/db` do market-pressure. Esse código fica em rotas
  separadas e **nunca é baixado por quem só visita a landing**.
- A alternativa descartada é o Next.js rodando no Worker (`@opennextjs/cloudflare`). A
  alteração apareceria na hora, mas o Worker fica maior, a renderização depende do
  servidor e a manutenção é mais complexa. Para um portfólio, alguns minutos até
  publicar não fazem diferença.

### `wrangler.jsonc` (esboço)

```jsonc
{
  "name": "portifolio",
  "main": "worker/index.js",
  "compatibility_date": "2026-10-01",
  "assets": {
    "directory": "out",
    "binding": "ASSETS",
    "not_found_handling": "404-page",
    // Só estas rotas passam pelo Worker. A landing sai direto dos arquivos estáticos.
    "run_worker_first": ["/api/*", "/auth/*", "/admin/*", "/depoimento/*"]
  },
  "d1_databases": [{ "binding": "DB", "database_name": "portifolio", "database_id": "<novo id>" }],
  "routes": [{ "pattern": "lucasaraujo.dev.br", "custom_domain": true }],
  "observability": { "enabled": true }
}
```

## Estrutura do repositório (depois da migração)

```
app/
  page.tsx                 landing em pt-BR  (/)
  en/page.tsx              landing em inglês (/en)
  login/page.tsx           login (aberto por um botão discreto na landing)
  admin/...                painel do administrador (componentes de cliente)
  depoimento/page.tsx      área do depoente: o próprio depoimento
  convite/page.tsx         aceitar convite e definir a senha
  not-found.tsx            vira out/404.html
componentes/
  landing/                 Apresentacao, Biografia, Projetos, Depoimentos, Habilidades,
                           Certificacoes, Educacao, Experiencia, ChamadaFinal, Rodape, Cabecalho
  admin/                   formulários, upload de imagem, lista de depoimentos
  icones/                  SVGs inline (só os ícones usados)
dicionarios/pt.json, en.json   textos fixos da interface (rótulos, navegação, acessibilidade)
conteudo/conteudo.json         gerado no build a partir do D1 (não versionado)
conteudo/semente.json          conteúdo inicial, portado dos .resx e de Dados/*.cs
worker/index.js, auth.js, api.js, imagens.js
migrations/0001_inicial.sql    esquema do D1 (wrangler d1 migrations apply)
scripts/exportar-conteudo.mjs  D1 → conteudo/conteudo.json (roda antes do next build)
scripts/criar-admin.mjs        cria a conta do administrador (como o create-user.mjs)
.github/workflows/publicar.yml
next.config.ts                 output: "export", images.unoptimized, trailingSlash
wrangler.jsonc, package.json
```

Código, comentários e identificadores continuam em **português**.

## Idiomas

- **Rotas**: `/` (pt-BR) e `/en`, as duas geradas no build a partir do mesmo componente
  `<Landing idioma="pt|en">`. O botão PT | EN é um link comum entre as duas.
- **Textos fixos da interface** (`Nav_*`, `Secao_*`, `Cabecalho_*`, `Acessibilidade_*`,
  rótulos) saem dos `.resx` para `dicionarios/pt.json` e `en.json`, versionados.
- **Conteúdo editável** fica no D1 com uma coluna por idioma (`titulo_pt`, `titulo_en`...).
  No painel, cada campo traduzível tem duas abas, PT e EN. Se o campo de um idioma estiver
  vazio, a landing usa o do outro idioma.
- **Depoimentos**: a pessoa escreve no idioma dela (`idioma_original`). Ao aprovar ou
  editar, o administrador preenche a tradução. Sem tradução, a landing mostra o original.

## Banco D1 `portifolio` (novo, separado do market-pressure)

| Tabela | Conteúdo |
|---|---|
| `perfil` | Linha única: nome, nascimento (a idade é calculada no build), e-mail, telefone, WhatsApp, `endereco_pt/en`, `saudacao_pt/en`, `profissao_pt/en`, `descricao_hero_pt/en`, `bio_paragrafo1_pt/en`, `bio_paragrafo2_pt/en`, `cta_convite_pt/en`, `cta_citacao_pt/en`, `cta_autor`, `curriculo_url_pt/en`, `foto_hero`, `foto_bio` (ids em `imagens`) |
| `redes_sociais` | ordem, nome, url, ícone |
| `projetos` | ordem, `titulo_pt/en`, `descricao_pt/en`, url, publicado |
| `imagens` | id, hash do conteúdo, largura e altura originais, bytes WebP de cada largura (BLOB) |
| `projeto_imagens` | projeto, ordem, imagem, `alt_pt/en`, largura, altura |
| `grupos_habilidades` / `habilidades` | `titulo_pt/en` do grupo; `nome_pt/en` do item (nomes próprios iguais nos dois) |
| `certificacoes` | ordem, `sigla`, `descricao_pt/en` |
| `formacoes` | ordem, `periodo_pt/en`, `titulo_pt/en`, `instituicao_pt/en` |
| `experiencias` | ordem, `periodo_pt/en`, `cargo_pt/en`, empresa, `endereco_pt/en`, `descricao_pt/en` |
| `depoimentos` | usuário, `idioma_original`, `texto_pt/en`, `profissao_pt/en`, foto, `situacao` (`pendente`, `aprovado`, `recusado`), datas de envio e de aprovação, ordem na landing |
| `usuarios` | nome, e-mail, hash da senha, `papel` (`admin`, `depoente`), ativo |
| `sessoes` | hash do token, usuário, expiração |
| `convites` | hash do token, usuário, expiração (7 dias), usado em |
| `publicacoes` | quando, por quem, situação do build (histórico do botão Publicar) |

O conteúdo inicial vem dos `.resx` e de `Dados/*.cs` atuais (`conteudo/semente.json`,
carregado por um script). Os projetos e depoimentos *placeholder* não são migrados.

## Acesso

- **Login** em `/login`, aberto por um botão discreto na landing (ícone no rodapé). A index
  continua sendo a landing. O login é por e-mail e senha, com o modelo do `auth.js` do
  market-pressure: hash PBKDF2 com `crypto.subtle`, cookie de sessão `HttpOnly`, `Secure`
  e `SameSite=Lax`, bloqueio de `Origin` estranha em métodos de escrita e limite de
  tentativas por IP.
- **Sem cadastro aberto.** O administrador é criado uma única vez por
  `scripts/criar-admin.mjs --remote`. Não existe outro admin nem forma de virar admin pelo site.
- **Convite de depoente**: no painel, o administrador informa nome e e-mail e recebe um
  **link de uso único**, válido por 7 dias, para mandar à pessoa (por WhatsApp, por
  exemplo). Pelo link, a pessoa define a própria senha. Nenhuma senha passa pelo
  administrador.
- **Guarda no Worker**: `/admin/*` exige papel `admin`, `/depoimento/*` exige sessão.
  Sem sessão, a página redireciona para `/login?next=…`, e a API responde 401 ou 403.
  Toda regra de permissão fica no Worker, nunca no navegador.

| Papel | Pode |
|---|---|
| `admin` | Editar perfil, fotos, projetos com imagens, habilidades, certificações, formação e experiência; convidar, desativar e excluir depoentes; aprovar, recusar, traduzir, editar e ordenar depoimentos; publicar |
| `depoente` | Ver e editar **somente o próprio** depoimento: texto, profissão e foto. Ao salvar, o depoimento volta a ficar `pendente` |

Quando um depoimento já aprovado é editado, a versão aprovada continua na landing até a
nova ser aprovada: o depoimento guarda uma cópia do que foi publicado.

## Imagens (no D1, sem R2)

Decisão de 26/10/2026: **sem R2**, para a publicação ser totalmente gratuita. O R2 exige um
meio de pagamento cadastrado e não tem teto de gastos. As imagens ficam no próprio D1.

- O navegador **reduz e converte a imagem antes do upload** (canvas → WebP, larguras de
  480, 960 e 1600 conforme o uso; foto do depoente quadrada, até 480 px). Cada versão fica
  entre 20 e 300 KB, abaixo do limite de 2 MB por registro do D1. O Worker recusa
  arquivos que não sejam WebP ou que passem de 1 MB.
- Tabela `imagens`: id, largura, altura, os bytes de cada largura (BLOB) e um hash do
  conteúdo. O nome publicado muda quando a imagem muda, então o cache pode ser `immutable`.
- **Na landing**, as imagens são **arquivos estáticos**: `scripts/exportar-conteudo.mjs`
  grava cada uma em `public/midia/<hash>-<largura>.webp` antes do `next build`. O visitante
  nunca lê imagem do banco, e arquivo estático no Workers é gratuito e sem limite de acessos.
- **No painel** (prévia antes de publicar, foto de depoimento pendente), o Worker serve a
  imagem do D1 em `/api/imagens/<id>`, só para quem está logado.
- Espaço: o D1 gratuito comporta 500 MB por banco. Cem imagens em três larguras somam
  cerca de 30 MB.

## Desempenho da landing (orçamento)

Medição do Blazor atual: só a foto do hero (`perfil-hero.png`) tem **1,9 MB**, e a landing
carrega Font Awesome Pro (174 KB de CSS + fontes de 77 a 190 KB cada), Bootstrap
(233 KB de CSS + 81 KB de JS) e Bootstrap Icons, para usar **11 ícones** e um carrossel.

| Item | Regra |
|---|---|
| JavaScript da landing | ≤ 120 KB comprimido. Seções como Server Components; só carrossel, menu e tema são componentes de cliente |
| Ícones | **Só o Font Awesome Pro 5.13** (o Bootstrap Icons não é usado). Para não baixar o CSS (174 KB) nem as webfonts (77 a 190 KB cada), `scripts/gerar-icones.mjs` extrai dos arquivos `js/light.js`, `solid.js` e `brands.js` do pacote versionado apenas os ícones usados (`[largura, altura, …, path]`) e gera `componentes/icones/` com `<Icone nome="download" estilo="fal" />` em SVG inline. O visual é o mesmo do Font Awesome. Usados hoje: `fal` arrow-right, bars, chevron-left/right, download, file-certificate, times; `fas` arrow-up, moon, sun, user; `fab` das redes sociais. Um ícone novo no painel (redes sociais) é escolhido de uma lista e entra no próximo build |
| Bootstrap | **Não é usado** (nem CSS, nem JS). O que ele faz hoje é substituído: menu lateral (`offcanvas` do `Cabecalho`) → `<dialog>` nativo; carrossel de depoimentos → scroll-snap, como o de Projetos; `Toast` → componente próprio; utilitárias (`d-flex`, `gap-2`, `m-0`, `mb-5`, `text-center`...) → classes do próprio CSS |
| Foto do hero | WebP/AVIF com `srcset`, `fetchpriority="high"`, na faixa de 60 a 120 KB |
| Fontes | Só woff2, com `font-display: swap`, preload apenas da fonte da primeira dobra |
| Tema claro/escuro | Script inline mínimo no `<head>` para não piscar |
| Animações | CSS com `IntersectionObserver` (como o `observeReveal` do market-pressure), respeitando `prefers-reduced-motion` |

## Publicação

- **GitHub Actions** (`.github/workflows/publicar.yml`), disparado por push em `master`,
  por `repository_dispatch` (botão Publicar) ou manualmente: `npm ci` →
  `scripts/exportar-conteudo.mjs` (`wrangler d1 execute portifolio --remote --json`) →
  `next build` → `wrangler deploy`.
- O deploy roda no Actions, e não no Workers Builds, porque o build precisa ler o D1.
- **Segredos do repositório**: `CLOUDFLARE_API_TOKEN` (permissões de Workers e D1) e
  `CLOUDFLARE_ACCOUNT_ID`.
- **Segredo do Worker**: `GITHUB_TOKEN_PUBLICAR`, um token *fine-grained* limitado a este
  repositório, só com *Contents: write*, usado para disparar o `repository_dispatch`.
- **Desenvolvimento local**: `npm run dev` (Next, com `conteudo/semente.json`) para a
  landing, e `npx wrangler dev` para testar o Worker e o D1 locais em `.wrangler/`.

## Configuração única no Cloudflare

1. Storage & Databases → D1 → Create → `portifolio` → copiar o id para o `wrangler.jsonc`.
2. Criar um API Token (Workers Scripts e D1: Edit) para o GitHub Actions.
3. O primeiro deploy cria o Worker `portifolio` e o domínio próprio `lucasaraujo.dev.br`.
   A zona já está ativa por causa do market-pressure.
4. Worker → Settings → Variables and Secrets → `GITHUB_TOKEN_PUBLICAR`.

## Fases

| # | Entrega | Critério de pronto |
|---|---|---|
| 0 | Branch `migracao-nextjs`; D1 e token criados no Cloudflare (sem R2) | Recursos existem |
| 1 | Next.js + Worker servindo a landing estática com `semente.json` (sem banco), ícones do Font Awesome em SVG inline, sem Bootstrap nem Bootstrap Icons, imagens otimizadas, pt/en, tema | **Lighthouse mobile ≥ 90** num deploy de teste (`*.workers.dev`). É o ponto de decisão do Next.js: se a meta não for atingida, revisamos antes de seguir |
| 2 | Esquema D1 + `exportar-conteudo.mjs` + carga inicial | Landing gerada a partir do D1 |
| 3 | Login, sessões, `criar-admin.mjs`, guarda das rotas | Só o admin entra em `/admin` |
| 4 | Painel: perfil, projetos, seções, upload de imagens para o D1 | Editar, publicar e ver na landing |
| 5 | Convites, área do depoente, moderação e tradução | Fluxo completo de um depoimento |
| 6 | Botão Publicar (`repository_dispatch`) + histórico | Publicar pelo painel sem abrir o GitHub |
| 7 | Virada: domínio `lucasaraujo.dev.br`, GitHub Pages desativado, remoção do Blazor (`Portifolio/`, `Portifolio.sln`) e dos arquivos do site antigo, atualização do `CLAUDE.md` e do `README.md` | Site novo no ar, repositório só com a nova stack |

O Blazor continua no repositório até a fase 7 como referência visual (CSS, marcação e
comentários das seções).

## Riscos e observações

- Links antigos para `jlfullstack.github.io/Portifolio` deixam de funcionar quando o
  GitHub Pages for desativado.
- O GitHub Pages pode ficar alguns minutos com o conteúdo antigo em cache depois de
  desativado.
- Os dados pessoais exibidos hoje (telefone, e-mail, data de nascimento) continuam
  públicos na landing. Vale revisar o que deve aparecer quando o painel estiver pronto.
- Backups: `wrangler d1 export portifolio --remote` periódico no Actions (mesmo espírito
  do `mp_backup` do market-pressure). O export do D1 inclui as imagens.
