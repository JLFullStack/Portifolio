namespace Portifolio.Dados
{
    /// <summary>
    /// Uma rede social do autor. <paramref name="ClasseIcone"/> é a classe do
    /// Font Awesome Pro já versionado em wwwroot/vendor.
    /// </summary>
    public record RedeSocial(string Nome, string Url, string ClasseIcone);

    /// <summary>
    /// Dados de contato do autor, em um só lugar.
    ///
    /// A biografia e o rodapé exibem a mesma lista de redes sociais; manter dois
    /// blocos de markup em sincronia seria uma fonte silenciosa de divergência.
    ///
    /// Os valores vieram do index.html do site legado (recuperável por
    /// <c>git show HEAD:index.html</c>). Não são texto traduzível — são endereços.
    /// </summary>
    public static class Contato
    {
        public const string Email = "jledicao@gmail.com";
        public const string EmailUrl = "mailto:jledicao@gmail.com";

        public const string Telefone = "+55 13 98144-4022";
        public const string TelefoneUrl = "tel:+5513981444022";

        /// <summary>Conversa no WhatsApp — destino do botão CONTATO da chamada final.</summary>
        public const string WhatsApp = "https://wa.me/5513981444022";

        /// <summary>Perfil no LinkedIn — assinatura do rodapé.</summary>
        public const string LinkedIn = "https://www.linkedin.com/in/lucas-ara%C3%BAjo-95b312181/";

        /// <summary>Link do currículo no Google Drive, herdado do site legado.</summary>
        public const string Curriculo = "https://drive.google.com/file/d/1nFcJppo1Oi0R_pzhCFTUMQq9U6nOth4_/view";

        /// <summary>
        /// Na ordem em que aparecem no arco inferior da foto da biografia,
        /// da esquerda para a direita — que é também a ordem de tabulação.
        /// </summary>
        public static readonly RedeSocial[] Redes =
        [
            new("LinkedIn",  LinkedIn,                                                   "fab fa-linkedin-in"),
            new("Facebook",  "https://www.facebook.com/LuhOficialPerfil",                "fab fa-facebook-f"),
            new("Instagram", "https://www.instagram.com/lucas._luh/",                    "fab fa-instagram"),
            new("GitHub",    "https://github.com/JLFullStack",                           "fab fa-github"),
            new("WhatsApp",  WhatsApp,                                                   "fab fa-whatsapp"),
            new("Skype",     "skype:live:fuscalca?chat",                                 "fab fa-skype")
        ];

        /// <summary>Data de nascimento, usada para calcular a idade exibida na biografia.</summary>
        public static readonly DateOnly Nascimento = new(1991, 9, 2);

        /// <summary>
        /// Idade em anos completos. O site legado tinha "32 anos" escrito à mão,
        /// que envelhece sozinho e fica errado — aqui é calculado a cada render.
        /// </summary>
        public static int Idade(DateOnly hoje)
        {
            var idade = hoje.Year - Nascimento.Year;

            if (hoje < Nascimento.AddYears(idade))
                idade--;

            return idade;
        }
    }
}
