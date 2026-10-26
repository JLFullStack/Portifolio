# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

Portfólio pessoal de José Lucas Alcântara de Araújo. O repositório está **em migração**: a versão publicada (GitHub Pages, `jlfullstack.github.io/Portifolio`) é um site estático (`index.html` + `assets/`), ainda rastreado no git mas removido da árvore de trabalho. O desenvolvimento atual acontece em `Portifolio/`, um app **Blazor Server (.NET 9)** recém-criado a partir do template padrão. Ao portar comportamento, o site estático antigo é a referência de design — recupere-o com `git show HEAD:index.html` / `git show HEAD:assets/js/script.js`.

Código, comentários e nomes de identificadores são em **português** (`TituloPagina`, `mostrarMensagem`, `ativarSpinner`, `animacao.css`). Mantenha essa convenção.

## Comandos

```powershell
dotnet run --project Portifolio            # https://localhost:58564 / http://localhost:58570
dotnet build Portifolio.sln
dotnet watch --project Portifolio          # hot reload
```

Não há projeto de testes nem workflow de CI (`.github/` está vazio). SDK em uso: .NET 9.0.304.

## Arquitetura

- **`Portifolio/Program.cs`** — pipeline mínimo: Razor Components com `InteractiveServerRenderMode`, Serilog via `UseSerilog`/`ReadFrom.Configuration`, e `GlobalMiddleware` registrado **depois** de `MapStaticAssets()`.
- **`Portifolio/Middlewares/GlobalMiddleware.cs`** — captura exceções não tratadas (redireciona para `/error`) e respostas 404 (redireciona para `/NotFound`). Atenção a dois pontos: o namespace é `ProjetoBase.Blazor.Middlewares` (resquício do template base, não `Portifolio.Middlewares`), e **a rota `/NotFound` ainda não existe** — criar `Components/Pages/NotFound.razor` antes de confiar nesse caminho.
- **Logging** — Serilog grava em arquivo apenas em Development (`appsettings.Development.json`: `Logs/Desenvolvimento/log-.txt`, rolagem diária, 30 dias). Não há sink de arquivo configurado para produção. Os logs ficam versionados sob `Portifolio/Logs/`.
- **`Components/`** — `App.razor` é o host HTML (declara CSS/JS globais e a ordem dos scripts), `Routes.razor` o router, `Layout/` o layout padrão, `Pages/` as rotas (`/`, `/counter`, `/weather`, `/Error` — as três primeiras ainda são do template), `Shared/` os componentes reutilizáveis.

### Ponte Razor ↔ JavaScript

O front-end não usa JS interop tipado: `wwwroot/assets/js/biblioteca.js` é uma biblioteca de funções globais que manipulam o DOM procurando **IDs e classes fixos** renderizados pelos componentes de `Components/Shared/`. Ao editar um desses componentes, verifique o seletor correspondente em `biblioteca.js`:

| Componente | Seletor | Funções |
|---|---|---|
| `Toast.razor` | `#ntf-card`, `#successMessage`, `#errorMessage` | `mostrarMensagem(msg, success)` |
| `Scroll.razor` | `#btn-scroll` | `mostrarScroll()` |
| `Loader.razor` | `.spinner` + `.backdrop` injetado | `ativarSpinner` / `desativarSpinner` (+ variantes `*Debounce`) |

`biblioteca.js` também expõe `q`/`qa` (atalhos de `querySelector`), `debounce`, máscaras (`cpf`, `rg`, `telefone`, `cep`, `numerosInteiros`, `numerosDecimais`), `filtrar`/`limparFiltro`, `ampliarImagem` e `ativarPopover`. Várias funções são **auto-invocadas na carga** do script — cuidado ao adicionar comportamento global. `app.js` está vazio e é o lugar para código específico da aplicação.

`TituloPagina.razor` está inteiramente comentado; depende de um tipo `TituloState` ainda não criado.

### Assets

- `wwwroot/vendor/` — Bootstrap 5, Bootstrap Icons e Font Awesome Pro versionados no repositório (sem npm/package.json). Não há build de front-end.
- `wwwroot/assets/css/` — `app.css` (base do template), `animacao.css`, `responsivo.css`, todos referenciados em `App.razor`.
- Fontes locais em `wwwroot/assets/font/` (Arimo, Ernestone herdadas do site antigo; Inter adicionada).

## Dependências notáveis

`Microsoft.EntityFrameworkCore.Design` está referenciado no `.csproj` mas **não há DbContext, provider nem connection string** — persistência ainda não foi iniciada.
