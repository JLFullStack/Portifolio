# Portfólio — Lucas Araújo

Portfólio pessoal de José Lucas Alcântara de Araújo, desenvolvedor full-stack:
**[lucasaraujo.dev.br](https://lucasaraujo.dev.br)** (português) e
**[lucasaraujo.dev.br/en](https://lucasaraujo.dev.br/en)** (inglês).

Feito em **Next.js 16** (React 19, TypeScript) com exportação estática, publicado no
**Cloudflare Workers**, com o conteúdo num banco **Cloudflare D1**. A landing é HTML
pronto, gerado no build: ela não consulta o banco a cada visita e carrega rápido mesmo
no celular. Tudo roda nos planos gratuitos, sem cartão de crédito.

## O que tem

- **Landing de página única**: apresentação, serviços, biografia, projetos (vitrine com
  imagem de fundo, stack e situação), código aberto, experiência, habilidades,
  certificações, educação, depoimentos, formulário de contato e rodapé. Tema claro e
  escuro; seção sem itens some, inclusive do menu.
- **Código aberto**: os repositórios públicos do GitHub entram no build. No painel dá
  para escolher quais aparecem (com ordem e descrição) ou esconder a seção.
- **Contato**: o formulário grava a mensagem no banco, com proteção contra robôs
  (campo-isca, tempo mínimo de preenchimento e limite por IP); o administrador lê no painel.
- **Currículo em PDF**, um por idioma, enviado pelo painel.
- **Painel** (`/admin`): o administrador edita perfil, fotos, serviços, projetos com
  imagens, seções, depoimentos e pessoas, lê as mensagens, troca senha e e-mail e
  publica o site com um botão.
- **Depoimentos por convite** (`/depoimento`): quem recebe o link cria a própria senha
  e escreve o depoimento no próprio idioma, com foto, profissão e LinkedIn. Ele só vai
  ao ar depois de aprovado e traduzido.

Arquitetura e decisões: [roteiro do projeto](docs/roteiro-v1.md).

## Como rodar

Requer Node.js 24.

```
npm install
npm run dev        # landing com recarga: http://localhost:3000 (sem Worker nem banco)
npm run preview    # site completo com Worker, API e D1 locais: http://127.0.0.1:8787
npm run tipos      # checagem de tipos (TypeScript)
```

Banco local (para o `preview`):

```
npm run banco:migrar                                   # cria as tabelas em .wrangler/
npm run banco:semente                                  # carrega o conteúdo inicial
node scripts/criar-admin.mjs --nome "Seu Nome" --email voce@exemplo.com
                                                       # imprime o link para criar a senha
npm run preview:local                                  # migra, exporta o banco e o GitHub,
                                                       # gera e sobe: o "Publicar" local
```

Sem banco exportado, o build usa `conteudo/semente.json`.

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run conteudo[:remoto]` | exporta o D1 para `conteudo/conteudo.json`, `public/midia/` e os currículos em PDF |
| `npm run github` | busca os repositórios públicos para `conteudo/github.json` (sem rede social do GitHub, a seção some) |
| `npm run banco:migrar:remoto` | aplica as migrações no D1 de produção |
| `npm run icones` | regenera `componentes/icones/dados.ts` a partir do Font Awesome Pro em `.local/` |
| `npm run imagens` | regenera as fotos WebP da semente em `public/imagens/` |
| `node scripts/criar-admin.mjs --remoto ...` | cria o admin em produção ou gera um link de nova senha |

No Windows, pare o `npm run preview` antes de rodar um novo build: o Wrangler
mantém a pasta `out/` aberta.

## Publicação

Automática, pelo GitHub Actions ([publicar.yml](.github/workflows/publicar.yml)):
a cada push no `master` e a cada clique em **Publicar** no painel. O workflow aplica
as migrações novas do banco, exporta o conteúdo e os repositórios do GitHub, gera o
site e publica. O painel mostra se a publicação terminou ou falhou.

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
worker/                   index (rotas e guarda), auth, api, contato, imagens, publicar
migrations/               esquema do banco D1 (0001 a 0006)
conteudo/semente.json     conteúdo inicial; conteudo.json e github.json são gerados (não versionados)
dicionarios/index.ts      textos fixos da interface em pt e en
estilos/                  app.css, animacao.css, responsivo.css (landing) e painel.css
fontes/                   Inter (woff2 latino) e Ernestone (assinatura do rodapé)
lib/                      conteúdo, cliente da API, tipos do painel, metadados e datas
public/                   favicon, fotos da semente, _headers, robots.txt e sitemap.xml
scripts/                  exportar-conteudo, exportar-github, carregar-semente, criar-admin,
                          gerar-icones, otimizar-imagens, d1 (acesso ao banco pelo wrangler)
docs/                     roteiro do projeto e o mockup da landing
```

## Decisões que mantêm a landing leve

- **Sem framework de CSS.** Menu lateral em `<dialog>` nativo e carrosséis com
  scroll-snap.
- **Font Awesome Pro só nos ícones usados**, como SVG inline. O pacote Pro fica fora
  do repositório, por licença.
- **Componentes de servidor** para todo o conteúdo; componentes de cliente só onde há
  estado ou evento. O painel não pesa na landing.
- **CSS embutido no HTML**, fotos em WebP com `srcset` e cache `immutable`, Inter em
  woff2 (48 KB) pré-carregada.
- **Animações só com `transform` e `opacity`**, e só quando o sistema não pede menos
  movimento.
- **Imagens no D1**, convertidas para WebP no navegador antes do envio: sem armazenamento
  pago.

## Convenções

Código, comentários e identificadores em **português**.
