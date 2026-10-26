using Microsoft.AspNetCore.Localization;
using Serilog;
using Portifolio.Components;
using ProjetoBase.Blazor.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// Idiomas oferecidos pelo Portifólio. O primeiro é o padrão.
string[] culturasSuportadas = ["pt-BR", "en"];

// Razor Components (Blazor Server)
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Localização: os textos vivem em Recursos/Textos.resx e Recursos/Textos.en.resx
builder.Services.AddLocalization();

// Serilog
builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext();
});

var app = builder.Build();

// Pipeline HTTP
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseHttpsRedirection();

// Define a cultura da requisição antes de qualquer renderização.
// Ordem padrão dos provedores: query string, cookie e Accept-Language do navegador.
app.UseRequestLocalization(new RequestLocalizationOptions()
    .SetDefaultCulture(culturasSuportadas[0])
    .AddSupportedCultures(culturasSuportadas)
    .AddSupportedUICultures(culturasSuportadas));

app.UseAntiforgery();
app.MapStaticAssets();
app.UseMiddleware<GlobalMiddleware>();

// Troca de idioma: grava o cookie de cultura e devolve o visitante à página de origem.
// É um GET porque os botões PT | EN são links simples, sem interatividade Blazor.
app.MapGet("/idioma", (string cultura, string? retorno, HttpContext contexto) =>
{
    if (!culturasSuportadas.Contains(cultura))
        return Results.BadRequest("Idioma não suportado.");

    contexto.Response.Cookies.Append(
        CookieRequestCultureProvider.DefaultCookieName,
        CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(cultura)),
        new CookieOptions
        {
            Expires = DateTimeOffset.UtcNow.AddYears(1),
            IsEssential = true,
            Path = "/",
            SameSite = SameSiteMode.Lax
        });

    // Só aceita caminho relativo do próprio site, para não virar redirecionamento aberto.
    var destino = !string.IsNullOrEmpty(retorno)
                  && retorno.StartsWith('/')
                  && !retorno.StartsWith("//")
                  && Uri.IsWellFormedUriString(retorno, UriKind.Relative)
        ? retorno
        : "/";

    return Results.LocalRedirect(destino);
});

// Blazor
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
