# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

Portfólio pessoal de José Lucas Alcântara de Araújo, **V1**, publicado em `https://lucasaraujo.dev.br`: landing page de página única em pt-BR (`/`) e inglês (`/en`), com área restrita para o administrador (`/admin`) e para quem dá depoimento (`/depoimento`). Next.js 16 (`output: "export"`), React 19 e TypeScript; Cloudflare Workers com banco D1. Arquitetura e decisões em [docs/roteiro-v1.md](docs/roteiro-v1.md); mockup oficial em `docs/mockup-landing.png`.

- **O projeto é a V1.** README, docs, comentários e textos do site descrevem só a stack atual, sem citar versões ou tecnologias anteriores.
- **Custo zero**: só recursos dos planos gratuitos, nada que exija cartão (por isso não há R2; as imagens ficam no D1).
- **Desempenho da landing no celular é a prioridade nº 1** (Lighthouse mobile ≥ 90, CLS 0).
- A aplicação `X:\SEPLAN-0416\GitHub\market-pressure` é referência de arquitetura (Worker, D1, login). **Só leitura: nunca altere nada nela.**

Código, comentários e identificadores em **português** (`lerConteudo`, `ProjetosVitrine`, `usuarioDaSessao`). Mantenha a convenção.

## Comandos

```
npm run dev        # next dev em http://localhost:3000 (só a landing; sem Worker)
npm run build      # exportação estática em out/
npm run preview    # build + wrangler dev (Worker, API e D1 locais) em http://127.0.0.1:8787
npm run preview:local  # migrações locais + export do D1 local + GitHub + build + wrangler dev: a landing mostra o conteúdo do banco local (o "Publicar" local)
npm run deploy     # exporta o D1 remoto + build + wrangler deploy
npm run tipos      # tsc --noEmit
npm run icones     # regenera componentes/icones/dados.ts (lê .local/font-awesome-pro/)
npm run imagens    # regenera as fotos WebP da semente em public/imagens/
npm run banco:migrar[:remoto]    # aplica migrations/ no D1 local ou remoto
npm run banco:semente[:remoto]   # carrega conteudo/semente.json no D1 (recusa banco com conteúdo; --substituir)
npm run conteudo[:remoto]        # exporta o D1 para conteudo/conteudo.json, public/midia/ e public/curriculo-<idioma>.pdf
npm run github                   # busca os repositórios públicos para conteudo/github.json (sem a rede fab:github, a seção some)
node scripts/criar-admin.mjs [--remoto] --nome "..." --email ... [--url ...]   # cria o admin ou gera link de nova senha
```

No Windows, o `wrangler dev` segura a pasta `out/` e o `next build` falha com EBUSY: pare o preview antes de recompilar. Os scripts acessam o D1 por `wrangler d1 execute` (`scripts/d1.mjs`); o `getPlatformProxy` com binding remoto travou e não é usado. Não há testes automatizados: valide com `npm run preview`.

## Arquitetura

- **Rotas**: dois layouts raiz, um por idioma: `app/(pt)/` (landing `/`, `login`, `convite`, `depoimento`, `admin/*`) e `app/(en)/en/` (`/en`). A 404 é `app/global-not-found.tsx` (`experimental.globalNotFound`). Ambos usam `componentes/Documento.tsx` (html, fontes, CSS global, script inline do tema).
- **Landing**: `componentes/landing/Landing.tsx` monta as seções (Serviços logo depois da hero; GitHub depois de Projetos); cada seção é componente de servidor com `PropsSecao` (`conteudo`, `idioma`, `d`). Componentes de cliente só para estado/evento (`CabecalhoFixo`, `MenuNavegacao`, `BotaoTema`, `BotaoTopo`, `ControlesFaixa`, `ProjetosVitrine`, `LuzCartoes`, `RevelarAoRolar`, `NavegacaoTopo`, `FormularioContato`, `Idade`, `AnoAtual`; a seção atual sai de `secaoAtiva.ts`), recebendo ícones e markup prontos. Seção sem itens some, inclusive do menu.
- **Conteúdo**: `lib/conteudo.ts` lê no build `conteudo/conteudo.json` (exportado do D1 por `scripts/exportar-conteudo.mjs`, não versionado) ou, sem ele, `conteudo/semente.json`. Colunas `_pt`/`_en` viram `Texto`. Depoimentos entram pela coluna `publicado` (versão aprovada), não pelos campos editáveis. Campo novo ganha valor padrão em `lerConteudo`, para um `conteudo.json` antigo continuar valendo. O currículo é um por idioma (`curriculo_pt`/`curriculo_en`); com PDF enviado no painel, o export aponta para `/curriculo-<idioma>.pdf`.
- **Worker** (`worker/`): `index.js` roteia e guarda `/admin*` (só admin) e `/depoimento*` (qualquer sessão); `contato.js` (`POST /contato`, público: campo-isca, tempo mínimo e limite por hash do IP; grava em `mensagens`); `auth.js` (PBKDF2, sessões e convites como SHA-256, cookie `__Host-sessao`, limite de tentativas); `api.js` (painel, coleções com listas fixas de colunas, depoimentos, pessoas, mensagens, currículo em PDF, `meu-depoimento`); `imagens.js` (upload WebP, leitura e limpeza); `publicar.js` (`repository_dispatch` no GitHub). Métodos de escrita só da própria origem. Só as rotas de `run_worker_first` passam pelo Worker; a landing sai direto dos estáticos.
- **Banco**: `migrations/0001_conteudo.sql` (conteúdo e imagens), `0002_acesso.sql` (usuários, sessões, convites, tentativas, publicações, `depoimentos.publicado`) e `0003_vitrine.sql` (serviços, stack/repositório/situação de projetos, stack de experiências, selo `perfil.disponivel`, currículo por idioma, `arquivos`, `mensagens`) e `0004_fundo_projeto.sql` (`projetos.fundo`, a imagem de fundo da vitrine). Mudança de esquema = migração nova; o workflow aplica antes do deploy.
- **Área restrita**: páginas estáticas com componentes de cliente (`componentes/painel/`) que chamam a API por `lib/api.ts`. Navegação com `<a>`, **não `next/link`** (o pré-carregamento de rotas do Next pede arquivos inexistentes na exportação estática). CSS em `estilos/painel.css`, só via `Moldura.tsx`. Dados do painel tipados em `lib/painel.ts`.
- **Imagens**: reduzidas e convertidas para WebP no navegador (`componentes/painel/redimensionar.ts`), gravadas no D1 (`imagens`, `imagem_arquivos`; id = hash). O export grava as usadas em `public/midia/<id>-<largura>.webp` (cache `immutable`). Comandos SQL do D1 têm limite de 100 KB: scripts gravam imagens em pedaços.
- **Ícones**: só Font Awesome Pro 5.13, como SVG inline via `<Icone nome="fal:download" />`. O pacote Pro fica **fora do git** em `.local/` (repositório público; a licença proíbe redistribuir). Nunca o versione.
- **Estilos**: `estilos/app.css` (tokens em `:root` e `:root[data-tema="claro"]`; nada de hex literal nas regras), `animacao.css`, `responsivo.css`, embutidos no HTML (`experimental.inlineCss`). O ciano `#03a9f4` é a cor principal; violeta e os tons dos cards só a complementam. Efeitos só com `transform`/`opacity`, dentro de `prefers-reduced-motion: no-preference`; revelar ao rolar é a classe `.revelar` (IntersectionObserver em `RevelarAoRolar` marca `.visivel`). Hover em elemento com `.revelar` usa `translate`, não `transform`.
- **Publicação**: `.github/workflows/publicar.yml` (push no master, botão Publicar, manual) precisa dos segredos `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` no GitHub; o botão Publicar precisa do segredo `GITHUB_TOKEN_PUBLICAR` no Worker. `wrangler.jsonc`: domínio `lucasaraujo.dev.br`, D1 `portifolio`, `run_worker_first`. Cabeçalhos em `public/_headers`.
