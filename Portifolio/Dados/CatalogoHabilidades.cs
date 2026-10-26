namespace Portifolio.Dados
{
    /// <summary>
    /// Um item de habilidade.
    ///
    /// Nomes próprios de tecnologia (Javascript, C#, Git, Figma) são iguais em
    /// qualquer idioma e vão como texto literal. Só o que muda entre pt-BR e en
    /// — "Banco de Dados", "API Rest", "Pacote Adobe" — leva
    /// <paramref name="Traduzir"/> = true, e aí <paramref name="Texto"/> é a
    /// chave no Textos.resx.
    /// </summary>
    public record Habilidade(string Texto, bool Traduzir = false);

    /// <summary>Um dos cinco cards de Habilidades Profissionais.</summary>
    public record GrupoHabilidades(string ChaveTitulo, Habilidade[] Itens);

    /// <summary>
    /// Conteúdo da seção Habilidades Profissionais, na ordem do mockup.
    ///
    /// A lista segue o mockup, não o site legado: o legado trazia
    /// "Microsoft TFS" e "microsserviços", que o mockup não exibe, e não
    /// trazia "Figma", que o mockup exibe.
    /// </summary>
    public static class CatalogoHabilidades
    {
        public static readonly GrupoHabilidades[] Grupos =
        [
            new("Skills_FrontEnd",
            [
                new("Javascript"),
                new("HTML5"),
                new("CSS3")
            ]),

            new("Skills_BackEnd",
            [
                new("C#"),
                new(".NET Framework"),
                new(".NET Core")
            ]),

            new("Skills_Banco",
            [
                new("SQL Server")
            ]),

            new("Skills_DevOps",
            [
                new("Git"),
                new("GitHub"),
                new("TFS"),
                new("Figma")
            ]),

            new("Skills_Outras",
            [
                new("Skills_ApiRest", Traduzir: true),
                new("Clean Architecture"),
                new("UML"),
                new("Scrum"),
                new("Skills_PacoteAdobe", Traduzir: true),
                new("Skills_PacoteOffice", Traduzir: true)
            ])
        ];
    }
}
