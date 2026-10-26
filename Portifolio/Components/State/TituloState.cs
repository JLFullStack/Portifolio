namespace ProjetoBase.Blazor.State
{
    public class TituloState
    {
        public string Titulo { get; set; }
        public string Subtitulo { get; set; }
        public string ClasseIcone { get; set; }

        public TituloState(string titulo, string subtitulo = "", string classe_icone = "")
        {
            Titulo = titulo;
            Subtitulo = subtitulo;
            ClasseIcone = classe_icone;
        }
    }
}
