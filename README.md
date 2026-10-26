# Portfólio — Lucas Araújo

Portfólio pessoal de José Lucas Alcântara de Araújo, desenvolvedor full-stack.
Landing page de página única em português (`/`) e inglês (`/en`).

O site é feito em **Next.js** com exportação estática e publicado no
**Cloudflare Workers**. A landing é HTML pronto, gerado no build: ela não
consulta banco nenhum a cada visita e carrega rápido mesmo no celular.

> Em migração do Blazor Server para Next.js. Plano completo e fases:
> [docs/plano-migracao-nextjs.md](docs/plano-migracao-nextjs.md). Estamos na
> fase 1 (landing estática). A pasta `Portifolio/` é o app Blazor antigo,
> mantido como referência visual até a fase 7.

## Como rodar

Requer Node.js 24.

```
npm install
npm run dev        # desenvolvimento com recarga: http://localhost:3000
npm run preview    # build + versão publicada local (Wrangler): http://127.0.0.1:8787
npm run tipos      # checagem de tipos (TypeScript)
```

No Windows, pare o `npm run preview` antes de rodar um novo build: o Wrangler
mantém a pasta `out/` aberta.

## Publicação (Cloudflare)

```
npx wrangler login   # uma vez
npm run deploy       # next build + wrangler deploy
```

- Worker `portifolio`, servindo os arquivos estáticos de `out/`
  ([wrangler.jsonc](wrangler.jsonc)). A rota inexistente recebe `out/404.html`.
- Cabeçalhos de segurança e cache em [public/_headers](public/_headers).
- Banco D1 `portifolio`, próprio do portfólio: entra em uso na fase 2.
- Até a virada (fase 7) o site fica em `https://portifolio.<conta>.workers.dev`.
  Depois, em `https://lucasaraujo.dev.br`.

## Estrutura

```
app/                      rotas: (pt)/ = /, (en)/en/ = /en, global-not-found = 404
componentes/
  Documento.tsx           <html> comum: idioma, fontes, estilos e script do tema
  landing/                uma seção por arquivo (Apresentacao, Biografia, Projetos...)
  icones/                 ícones do Font Awesome Pro em SVG inline (dados.ts é gerado)
conteudo/semente.json     conteúdo da landing (a partir da fase 2, exportado do D1)
dicionarios/index.ts      textos fixos da interface em pt e en
estilos/                  app.css (tokens e seções), animacao.css, responsivo.css
fontes/                   Inter (woff2 latino) e Ernestone (assinatura do rodapé)
lib/                      leitura do conteúdo, metadados (SEO) e datas
public/                   favicon, fotos em WebP e _headers
scripts/
  gerar-icones.mjs        npm run icones: extrai os ícones usados do Font Awesome Pro
  otimizar-imagens.mjs    npm run imagens: gera as fotos em WebP nas larguras do srcset
```

## Decisões que mantêm a landing leve

- **Sem Bootstrap e sem Bootstrap Icons.** Menu lateral em `<dialog>` nativo e
  carrosséis com scroll-snap.
- **Font Awesome Pro só nos ícones usados**, como SVG inline: sem o CSS de
  174 KB nem as webfonts.
- **Componentes de servidor** para todo o conteúdo. Só menu, tema, carrosséis,
  voltar ao topo, idade e ano são componentes de cliente.
- **CSS embutido no HTML** (`experimental.inlineCss`), fotos em WebP com `srcset`,
  Inter em woff2 (48 KB) pré-carregada.

Lighthouse mobile da fase 1 (build local): performance 98 em `/` e 95 em `/en`,
CLS 0, cerca de 308 KB no total.

## Convenções

Código, comentários e identificadores em **português**.
