# Portfólio — Lucas Araújo · V1

Portfólio pessoal de José Lucas Alcântara de Araújo, desenvolvedor full-stack:
**[lucasaraujo.dev.br](https://lucasaraujo.dev.br)** (português) e
**[lucasaraujo.dev.br/en](https://lucasaraujo.dev.br/en)** (inglês).

Feito em **Next.js** com exportação estática, publicado no **Cloudflare Workers**,
com o conteúdo num banco **Cloudflare D1**. A landing é HTML pronto, gerado no build:
ela não consulta o banco a cada visita e carrega rápido mesmo no celular. Tudo roda
nos planos gratuitos.

- **Painel** (`/admin`): o administrador edita perfil, fotos, projetos com imagens,
  seções, depoimentos e pessoas, e publica o site com um botão.
- **Depoimentos por convite**: quem recebe o link cria a própria senha e escreve o
  depoimento no próprio idioma, com foto e profissão. Ele só vai ao ar depois de
  aprovado e traduzido.

Arquitetura e decisões: [docs/roteiro-v1.md](docs/roteiro-v1.md).

## Como rodar

Requer Node.js 24.

```
npm install
npm run dev        # landing com recarga: http://localhost:3000
npm run preview    # site completo com Worker, API e D1 locais: http://127.0.0.1:8787
npm run tipos      # checagem de tipos (TypeScript)
```

Banco local (para o `preview`):

```
npm run banco:migrar                                   # cria as tabelas em .wrangler/
npm run banco:semente                                  # carrega o conteúdo inicial
node scripts/criar-admin.mjs --nome "Seu Nome" --email voce@exemplo.com
                                                       # imprime o link para criar a senha
npm run conteudo                                       # exporta o banco para o build
```

No Windows, pare o `npm run preview` antes de rodar um novo build: o Wrangler
mantém a pasta `out/` aberta.

## Publicação

Automática, pelo GitHub Actions ([publicar.yml](.github/workflows/publicar.yml)):
a cada push no `master` e a cada clique em **Publicar** no painel. O workflow aplica
as migrações novas do banco, exporta o conteúdo, gera o site e publica.

Configuração (uma vez):

| Onde | Segredo | Valor |
|---|---|---|
| GitHub → Settings → Secrets and variables → Actions | `CLOUDFLARE_API_TOKEN` | token do Cloudflare (modelo "Edit Cloudflare Workers" + *D1: Edit*) |
| GitHub → Settings → Secrets and variables → Actions | `CLOUDFLARE_ACCOUNT_ID` | id da conta Cloudflare |
| Cloudflare → Worker `portifolio` → Settings → Variables and Secrets | `GITHUB_TOKEN_PUBLICAR` | token *fine-grained* do GitHub, só deste repositório, com *Contents: Read and write* |

Publicação manual, da própria máquina: `npx wrangler login` (uma vez) e `npm run deploy`.

## Estrutura

```
app/                      rotas: (pt)/ = /, login, convite, depoimento, admin/*; (en)/en/ = /en
componentes/
  landing/                uma seção da landing por arquivo
  painel/                 área restrita: login, convite, painel, depoente, imagens
  icones/                 ícones do Font Awesome Pro em SVG inline (dados.ts é gerado)
worker/                   Worker: guarda das páginas, login, API, imagens, publicação
migrations/               esquema do banco D1
conteudo/semente.json     conteúdo inicial; conteudo.json é exportado do D1 (não versionado)
dicionarios/index.ts      textos fixos da interface em pt e en
estilos/                  app.css, animacao.css, responsivo.css (landing) e painel.css
fontes/                   Inter (woff2 latino) e Ernestone (assinatura do rodapé)
lib/                      conteúdo, cliente da API, tipos do painel, metadados e datas
public/                   favicon, fotos da semente, _headers, robots.txt e sitemap.xml
scripts/                  exportar-conteudo, carregar-semente, criar-admin, gerar-icones,
                          otimizar-imagens, d1 (acesso ao banco pelo wrangler)
docs/                     roteiro da V1 e o mockup da landing
```

## Decisões que mantêm a landing leve

- **Sem framework de CSS.** Menu lateral em `<dialog>` nativo e carrosséis com
  scroll-snap.
- **Font Awesome Pro só nos ícones usados**, como SVG inline. O pacote Pro fica fora
  do repositório, por licença.
- **Componentes de servidor** para todo o conteúdo; o painel não pesa na landing.
- **CSS embutido no HTML**, fotos em WebP com `srcset`, Inter em woff2 (48 KB)
  pré-carregada.

## Convenções

Código, comentários e identificadores em **português**.
