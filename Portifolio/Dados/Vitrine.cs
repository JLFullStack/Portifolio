namespace Portifolio.Dados
{
    /// <summary>
    /// Um projeto da vitrine.
    ///
    /// <paramref name="Imagem"/> e <paramref name="Url"/> são nulos enquanto o
    /// autor não definir o conteúdo real: com imagem nula o card desenha a
    /// caixa cinza "Imagem" do mockup, e com URL nula o botão não vira um link
    /// morto — vira um botão inerte com explicação.
    /// </summary>
    public record Projeto(int Numero, string? Imagem = null, string? Url = null);

    /// <summary>
    /// Um depoimento. O texto e o nome saem dos recursos de placeholder;
    /// <paramref name="ChaveCargo"/> é a chave do cargo no Textos.resx.
    /// </summary>
    public record Depoimento(int Numero, string ChaveCargo);

    /// <summary>
    /// Conteúdo das seções Projetos e Depoimentos.
    ///
    /// ATENÇÃO — tudo aqui é placeholder. O autor informou que as imagens do
    /// site legado (img1..img4.jpg) eram apenas de teste e não correspondem a
    /// projetos reais; os depoimentos do legado também eram lorem ipsum.
    /// Substituir por conteúdo real é decisão editorial do autor.
    /// </summary>
    public static class Vitrine
    {
        /// <summary>Três projetos, como no mockup.</summary>
        public static readonly Projeto[] Projetos =
        [
            new(1),
            new(2),
            new(3)
        ];

        /// <summary>
        /// Quatro depoimentos: o carrossel mostra dois por vez, então são duas
        /// páginas — o suficiente para os controles ‹ › terem o que fazer.
        /// </summary>
        public static readonly Depoimento[] Depoimentos =
        [
            new(1, "Hero_Profissao"),
            new(2, "Depoimentos_CargoFrontEnd"),
            new(3, "Depoimentos_CargoFrontEnd"),
            new(4, "Hero_Profissao")
        ];

        /// <summary>Quantidade de depoimentos exibidos por página do carrossel.</summary>
        public const int DepoimentosPorPagina = 2;
    }
}
