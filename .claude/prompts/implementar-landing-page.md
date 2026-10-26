# Prompt — Implementar a landing page do Portifólio

> **Como usar na próxima sessão:** cole o conteúdo abaixo da linha, ou envie
> `Use o agente coder e siga @.claude/prompts/implementar-landing-page.md`.

---

Use o agente **coder** (`.claude/agents/coder.md`).

## Objetivo

Implementar a landing page do Portifólio na aplicação Blazor Server, o mais fiel possível ao mockup oficial `Portifolio/wwwroot/assets/img/layout-portifolio.png`.

Leia a imagem do mockup **antes de escrever qualquer código** e volte a ela a cada seção. Ela é a especificação visual — em qualquer dúvida de layout, ordem, hierarquia ou espaçamento, o mockup decide.

## Contexto obrigatório

Leia, nesta ordem, antes de começar:

1. `CLAUDE.md` — arquitetura, comandos e convenções;
2. `.claude/agents/coder.md` — seu papel, especialmente a especialização **"Landing page — a forma do produto"**;
3. `Portifolio/wwwroot/assets/img/layout-portifolio.png` — o mockup;
4. `Portifolio/wwwroot/assets/js/biblioteca.js` — o inventário de funções JS já disponíveis;
5. `Portifolio/Components/App.razor` — ordem de carregamento de CSS e JS.

Recupere o site estático legado como **referência**. A landing é construída em **Razor Components** — o markup do legado não é colado no projeto, é reescrito como componentes Blazor. O que se aproveita diretamente é **CSS, assets e o comportamento já resolvido**; o HTML serve para você não redescobrir estrutura, classes e conteúdo que já existiam:

```bash
git show HEAD:index.html
git show HEAD:assets/css/style.css
git show HEAD:assets/css/animation.css
git show HEAD:assets/css/responsive.css
git show HEAD:assets/js/script.js
git show HEAD:assets/js/animation.js
```

Assets do legado ainda **não copiados** para o novo `wwwroot` — recupere-os com `git show HEAD:<caminho> > <destino>` (use `git checkout HEAD -- <caminho>` para binários):

- `assets/svg/social-icons/{linkedin,facebook,instagram,github,whatsapp,skype}.svg`
- `assets/svg/{sun,moon,scroll}.svg`
- `assets/img/{profile-001.png,profile-002.png,img1.jpg,img2.jpg,img3.jpg,img4.jpg}`

Destino: `Portifolio/wwwroot/assets/svg/` e `Portifolio/wwwroot/assets/img/`.

## Escopo

### Dentro do escopo

- Substituir o conteúdo de template por uma landing page de página única em `/`.
- Implementar as 11 seções do mockup (tabela abaixo), na ordem, como componentes Razor.
- Estabelecer o sistema de tokens CSS (cores, espaçamentos, tipografia).
- Header fixo, navegação por âncora, responsividade, SEO e acessibilidade.
- Remover `Counter.razor` e `Weather.razor` e o layout de sidebar do template (`MainLayout.razor` / `NavMenu.razor` + seus `.razor.css`), substituindo pelo layout real.

### Fora do escopo — não faça

- **Tema claro/escuro funcional** e **troca de idioma PT/EN funcional**. O mecanismo de ambos é decisão do Architect e ainda não foi tomada. Entregue os **controles do header renderizados e estilizados**, inertes, prontos para receberem o comportamento depois. Deixe isso registrado na entrega.
- Criar `DbContext`, persistência, formulário de contato com backend ou qualquer pacote NuGet novo.
- Introduzir npm, SCSS, bundler ou substituir Bootstrap / Font Awesome Pro.
- Criar `Components/Pages/NotFound.razor`, corrigir o namespace `ProjetoBase.Blazor.Middlewares` ou mexer no `GlobalMiddleware` — são pendências conhecidas, mas de outra entrega.

## Entrega em fases

Entregue **uma fase por vez**, com build limpo ao fim de cada uma, e pare para revisão antes de seguir.

| Fase | Conteúdo |
|---|---|
| **0 — Fundação** | tokens CSS (custom properties de cor, espaçamento, tipografia); limpeza do template; `MainLayout` real; `Home.razor` com as `<section>` vazias na ordem correta; header fixo com âncoras + controles de tema/idioma (inertes); `Scroll.razor` reativado; rolagem suave |
| **1** | Hero + Biography |
| **2** | Projects + Testimonials (carrosséis) |
| **3** | Professional skills + Certification + Education + Experience |
| **4** | CTA final + Rodapé |
| **5 — Acabamento** | responsividade mobile de todas as seções, animações de entrada, SEO/Open Graph, acessibilidade, revisão de contraste e foco |

## As seções, conforme o mockup

Fundo escuro (azul-petróleo), cards em superfície levemente mais clara sem borda, **um único acento ciano**, títulos de seção alinhados à esquerda com régua horizontal fina abaixo, espaçamento vertical generoso entre blocos.

1. **Header fixo** — canto superior direito: ícone de tema (sol/lua) + alternador `PT | EN` com o ativo em destaque ciano. Minimalista, sem menu de texto no desktop.
2. **Hero** — à esquerda: "Olá, meu nome é" (pequeno), **Lucas Araújo** (display grande, branco), **Full-Stack Developer** (ciano), parágrafo curto de apresentação, botão ciano **Download CV**. À direita: foto de perfil. Ao fundo: linhas curvas finas em ciano (SVG, não imagem raster).
3. **Biography** — à esquerda: foto circular com anel ciano e **ícones sociais dispostos ao redor do arco inferior do círculo**. À direita: título "Biography", dois parágrafos justificados e o bloco de dados em duas colunas — Nome, Nascimento, Idade, Endereço | Telefone, E-mail (e-mail como link ciano).
4. **Projects** — à esquerda: título do projeto em display grande, descrição, botão ciano **View Work →**. À direita: cards de imagem em carrossel, o ativo maior e em destaque, os seguintes menores e recuados, sangrando na borda direita. Controles `‹ ›` centralizados abaixo dos cards. Use o carrossel do Bootstrap já versionado em `wwwroot/vendor/`.
5. **Testimonials** — dois cards por vez: avatar circular à esquerda, depoimento à direita, nome em negrito e cargo abaixo. Controles `‹ ›` centralizados.
6. **Professional skills** — cinco cards lado a lado, cabeçalho centralizado e lista com marcadores: **Front-end** (Javascript, HTML5, CSS3) · **Back-end** (C#, .NET Framework, .NET Core) · **Database** (SQL Server) · **DevOps** (Git, GitHub, TFS, Figma) · **Others** (API Rest, Clean Architecture, UML, Scrum, Adobe package, Office package).
7. **Certification** — card único com ícone de certificado à esquerda: **SFPC** / "Scrum Foundation Professional Certificate (SFPC) - 2019".
8. **Education** — timeline vertical central com marcadores, cards alternando lados. Esquerda: "Studying - forecast January 2024" / **Postgraduate degree in DevOps Engineering** (ciano) / "University: Faculdade Focus (EAD)". Direita: "December 2014" / **Bachelor's Degree in Information Systems** / "University: Faculdade do Litoral Sul Paulista (FALS)".
9. **Experience** — mesma timeline. Esquerda: "2022 - 2023" / **Computer Programmer** / Company: Prefeitura da Estância Balneária de Praia Grande — Secretaria de Planejamento / Address / parágrafo descritivo. Direita: "2013" / **Trainee** / Company: mesma prefeitura — Secretaria de Educação / Address / parágrafo descritivo.
10. **CTA final** — faixa/card com **"Let's work together!"**, a citação *"Details matter, it's worth waiting to get it right"* — **Steve Jobs**, e botão ciano **CONTACT** à direita.
11. **Rodapé** — ícones sociais em círculos contornados de ciano, linha de copyright "Copyright © 2023 Portifolio. Design By **Lucas Araújo**" com o nome na fonte manuscrita **Ernestone** (é para isso que ela existe no projeto). Botão circular ciano de voltar ao topo no canto inferior direito.

## Conteúdo textual

O conteúdo real do autor está no `index.html` legado — extraia dali em vez de transcrever do mockup ou inventar. Onde o mockup usa *lorem ipsum* (descrições de projeto e depoimentos), mantenha placeholder e **sinalize na entrega** que o texto definitivo depende do autor.

Os textos da interface devem ficar em **português (pt-BR)**, coerentes com `<html lang="pt-br">` — o mockup está em inglês porque foi capturado com o idioma EN ativo.

## Restrições técnicas

- **One-page**: cada seção é um componente em `Components/Shared/` consumido por `Home.razor`. Nenhuma seção vira `@page` própria.
- **Sem `@rendermode InteractiveServer`**, salvo se for realmente inevitável — carrosséis, header e âncoras devem ser resolvidos por Bootstrap + CSS + JS de `wwwroot`. Se algum ponto exigir interatividade Blazor, justifique antes de aplicar.
- **Cores sempre em custom properties** (`--cor-fundo`, `--cor-superficie`, `--cor-acento`, `--cor-texto`, `--cor-texto-suave`…). Nenhum hex literal em regra de componente — o tema claro será portado trocando esses tokens.
- **Reutilize `biblioteca.js`**: `q`/`qa`, `debounce`, `mostrarScroll` (`#btn-scroll` já implementado em `Scroll.razor`), `ampliarImagem`, `ativarPopover`, `ativarSpinner`. Não reimplemente nada desse inventário. Código novo específico da página vai em `app.js`, que está vazio.
- **Preserve os seletores** consumidos pelo JS: `#ntf-card`, `#btn-scroll`, `.spinner`, `.backdrop`, `#successMessage`, `#errorMessage`, e os keyframes de `animacao.css`.
- CSS novo em `animacao.css` (animação) ou `responsivo.css` (breakpoints); o global do layout em `app.css`, respeitando a ordem de cascata declarada em `App.razor`.
- Imagens com `width`/`height` explícitos e `loading="lazy"` abaixo da dobra.
- No mobile, **as timelines de Education e Experience colapsam para coluna única**, todos os cards do mesmo lado.

## Validação

Não há testes automatizados. Antes de declarar uma fase concluída:

```powershell
dotnet build Portifolio.sln
dotnet run --project Portifolio    # https://localhost:58564
```

Confira no navegador:

- rolagem completa da página, do header ao rodapé, comparando com o mockup;
- cada âncora do header leva à seção correta, sem que o header fixo cubra o título;
- largura mobile (~375px) além do desktop;
- navegação por teclado: foco visível, carrossel operável, ícones sociais com `aria-label`;
- botão de voltar ao topo aparecendo após rolar e funcionando.

## Formato da entrega

Siga o formato de resposta definido em `.claude/agents/coder.md`, informando obrigatoriamente:

- seções implementadas e **seções ainda pendentes**;
- desvios em relação ao mockup, com justificativa;
- custom properties de cor criadas;
- assets recuperados do legado;
- render modes aplicados (e por quê, se algum);
- pontos que dependem de decisão do autor (conteúdo) ou do Architect (tema, i18n).
