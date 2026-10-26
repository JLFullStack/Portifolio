# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

Portfólio pessoal de José Lucas Alcântara de Araújo: landing page de página única em pt-BR (`/`) e inglês (`/en`).

O repositório está **em migração de Blazor Server para Next.js**, publicado no Cloudflare Workers. O plano, as decisões e as fases estão em [docs/plano-migracao-nextjs.md](docs/plano-migracao-nextjs.md); leia-o antes de mudar a arquitetura. Fase atual: **1** (landing estática, sem banco).

- **Nova stack** (raiz do repositório): Next.js 16 com `output: "export"`, React 19, TypeScript, Wrangler.
- **`Portifolio/`** é o app Blazor antigo, mantido **só como referência visual** (marcação, CSS e comentários das seções em `Portifolio/Components/Shared/`, textos em `Portifolio/Recursos/*.resx`) até a fase 7, quando sai do repositório. Não desenvolva nele.
- A aplicação `X:\SEPLAN-0416\GitHub\market-pressure` é a referência de arquitetura e publicação (Worker, D1, login). **Só leitura: nunca altere nada nela.**

Código, comentários e identificadores em **português** (`lerConteudo`, `ProjetosVitrine`, `SeparadorSecao`). Mantenha a convenção.

## Comandos

```
npm run dev        # next dev em http://localhost:3000
npm run build      # exportação estática em out/
npm run preview    # build + wrangler dev (versão publicada local) em http://127.0.0.1:8787
npm run deploy     # build + wrangler deploy
npm run tipos      # tsc --noEmit
npm run icones     # regenera componentes/icones/dados.ts
npm run imagens    # regenera as fotos WebP em public/imagens/
```

No Windows, o `wrangler dev` segura a pasta `out/` e o `next build` falha com EBUSY: pare o preview antes de recompilar. Não há testes automatizados nem CI ainda.

## Arquitetura

- **Rotas**: dois layouts raiz, um por idioma, para o `<html lang>` sair certo no HTML estático: `app/(pt)/` → `/` e `app/(en)/en/` → `/en`. A 404 é `app/global-not-found.tsx` (`experimental.globalNotFound`), exportada como `out/404.html`. Os dois layouts usam `componentes/Documento.tsx` (html, fontes, CSS global, script inline do tema).
- **Landing**: `componentes/landing/Landing.tsx` monta as seções na ordem do mockup; cada seção é um componente de servidor que recebe `PropsSecao` (`conteudo`, `idioma`, `d`). Seção sem itens não aparece, nem no menu.
- **Componentes de cliente** (`"use client"`): `CabecalhoFixo`, `MenuNavegacao` (`<dialog>` nativo), `BotaoTema`, `BotaoTopo`, `ControlesFaixa`, `ProjetosVitrine`, `Idade`, `AnoAtual`. Recebem ícones e markup prontos do servidor como `children`/props. Mantenha o resto como componente de servidor: o desempenho da landing no celular é a prioridade nº 1.
- **Conteúdo**: `lib/conteudo.ts` (tipos e `lerConteudo()`, só no build) lê `conteudo/conteudo.json` (exportado do D1 a partir da fase 2, não versionado) ou, sem ele, `conteudo/semente.json`. Campos traduzíveis são `Texto` (`{ pt, en }`); `texto(valor, idioma)` usa o outro idioma quando um está vazio. Itens com `"exemplo": true` são placeholders do mockup.
- **Textos fixos da interface**: `dicionarios/index.ts` (`DICIONARIOS.pt`/`.en`, mesmo formato tipado). `{n}` e `{ano}` são preenchidos no navegador (`Idade`, `AnoAtual`), porque a landing só é regerada quando o conteúdo é publicado.
- **Ícones**: só Font Awesome Pro 5.13, como SVG inline via `<Icone nome="fal:download" />`. `componentes/icones/dados.ts` é gerado por `scripts/gerar-icones.mjs` a partir de `Portifolio/wwwroot/vendor/font-awesome-pro/pro-5.13.0/js/` (lista em `ICONES` no script). Nada de webfont, Bootstrap ou Bootstrap Icons.
- **Estilos**: `estilos/app.css` (tokens de cor em `:root` e `:root[data-tema="claro"]`; nenhuma regra usa hex literal), `animacao.css`, `responsivo.css`, embutidos no HTML (`experimental.inlineCss`). Tema no `data-tema` do `<html>`, gravado em `localStorage` (`portifolio-tema`).
- **Imagens**: `<img>` com `srcset` de WebP pré-gerados (`Foto`: `base`, `larguras`); `images.unoptimized` (sem otimizador do Next). A foto do hero é o LCP: `fetchPriority="high"`, sem lazy.
- **Publicação**: `wrangler.jsonc` (Worker `portifolio`, assets de `out/`, `not_found_handling: "404-page"`, binding D1 `DB` → banco `portifolio`, próprio do portfólio). Cabeçalhos de segurança e cache em `public/_headers`.
