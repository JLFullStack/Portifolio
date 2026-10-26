namespace ProjetoBase.Blazor.Middlewares
{
    public class GlobalMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalMiddleware> _logger;

        public GlobalMiddleware(
        RequestDelegate next,
        ILogger<GlobalMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);

                // Ignora requisições técnicas do navegador
                if (context.Request.Path.StartsWithSegments("/.well-known"))
                    return;

                if (context.Response.StatusCode == StatusCodes.Status404NotFound && !context.Response.HasStarted)
                {
                    _logger.LogWarning(
                    "404 - Recurso não encontrado. Path: {Path}",
                    context.Request.Path);

                    await NotFoundAsync(context);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                ex,
                "Erro não tratado. Path: {Path}, TraceId: {TraceId}",
                context.Request.Path,
                context.TraceIdentifier);

                await ExceptionAsync(context, ex);
            }
        }

        #region Métodos auxiliares privados

        /// <summary>
        /// Redireciona requisições 404 para a página NotFound.
        /// </summary>
        private static Task NotFoundAsync(HttpContext context)
        {
            context.Response.Clear();
            context.Response.Redirect("/NotFound");
            return Task.CompletedTask;
        }

        /// <summary>
        /// Trata exceções não capturadas e retorna a view de erro 500.
        /// </summary>
        private static Task ExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.Clear();
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            context.Response.Redirect("/error");

            return Task.CompletedTask;
        }

        #endregion
    }
}
