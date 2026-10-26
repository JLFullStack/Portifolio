// Textos fixos da interface (rótulos, navegação, acessibilidade), portados de
// Portifolio/Recursos/Textos.resx e Textos.en.resx. O conteúdo editável no painel
// (biografia, projetos, depoimentos...) não fica aqui: vem de lib/conteudo.ts.
import type { Idioma } from "@/lib/conteudo";

const pt = {
    paginaTitulo: "Portifólio — José Lucas Alcântara de Araújo",
    paginaDescricao: "Portfólio de Lucas Araújo, desenvolvedor full-stack: projetos, experiência, formação e depoimentos.",

    pularConteudo: "Pular para o conteúdo",
    voltarAoTopo: "Voltar ao topo da página",

    abrirMenu: "Abrir menu de navegação",
    fecharMenu: "Fechar menu",
    navegar: "Navegar",
    navegacaoSecoes: "Navegação entre as seções",
    idiomaDoSite: "Idioma do site",
    idiomaPortugues: "Português",
    idiomaIngles: "Inglês",
    temaParaClaro: "Mudar para o tema claro",
    temaParaEscuro: "Mudar para o tema escuro",

    nav: {
        apresentacao: "Início",
        biografia: "Biografia",
        projetos: "Projetos",
        depoimentos: "Depoimentos",
        habilidades: "Habilidades",
        certificacoes: "Certificações",
        educacao: "Educação",
        experiencia: "Experiência",
        contato: "Contato"
    },

    secaoApresentacao: "Apresentação",
    secaoBiografia: "Biografia",
    secaoProjetos: "Projetos",
    secaoDepoimentos: "Depoimentos",
    secaoHabilidades: "Habilidades Profissionais",
    secaoCertificacoes: "Certificações",
    secaoEducacao: "Educação",
    secaoExperiencia: "Experiência",

    baixarCv: "Download CV",
    fotoHeroAlt: "Lucas Araújo, desenvolvedor full-stack",

    bioNome: "Nome:",
    bioNascimento: "Nascimento:",
    bioIdade: "Idade:",
    bioEndereco: "Endereço:",
    bioTelefone: "Celular:",
    bioEmail: "E-mail:",
    bioFotoAlt: "Retrato de Lucas Araújo",
    /** {n} é a idade, calculada no navegador (Idade.tsx). */
    anos: "{n} anos",

    verTrabalho: "Ver Trabalho",
    imagemPendente: "Imagem",
    imagemProjetoAlt: (titulo: string) => `Imagem do projeto ${titulo}`,
    linkPendente: "Link do projeto ainda não definido",
    vitrineProjetos: "Vitrine de projetos",
    projetoAnterior: "Projeto anterior",
    proximoProjeto: "Próximo projeto",

    depoimentoAnterior: "Depoimento anterior",
    proximoDepoimento: "Próximo depoimento",
    fotoDepoenteAlt: (nome: string) => `Foto de ${nome}`,

    universidade: "Universidade:",
    empresa: "Empresa:",
    endereco: "Endereço:",

    contato: "CONTATO",

    /** {ano} é o ano atual, atualizado no navegador (AnoAtual.tsx). */
    copyright: "Copyright © {ano} Portifólio. Design By",
    assinaturaTitulo: "Perfil de Lucas Araújo no LinkedIn",
    entrar: "Entrar na área restrita"
};

export type Dicionario = typeof pt;

const en: Dicionario = {
    paginaTitulo: "Portfolio — José Lucas Alcântara de Araújo",
    paginaDescricao: "Portfolio of Lucas Araújo, full-stack developer: projects, experience, education and testimonials.",

    pularConteudo: "Skip to content",
    voltarAoTopo: "Back to top",

    abrirMenu: "Open navigation menu",
    fecharMenu: "Close menu",
    navegar: "Navigate",
    navegacaoSecoes: "Section navigation",
    idiomaDoSite: "Site language",
    idiomaPortugues: "Portuguese",
    idiomaIngles: "English",
    temaParaClaro: "Switch to the light theme",
    temaParaEscuro: "Switch to the dark theme",

    nav: {
        apresentacao: "Home",
        biografia: "Biography",
        projetos: "Projects",
        depoimentos: "Testimonials",
        habilidades: "Skills",
        certificacoes: "Certifications",
        educacao: "Education",
        experiencia: "Experience",
        contato: "Contact"
    },

    secaoApresentacao: "Presentation",
    secaoBiografia: "Biography",
    secaoProjetos: "Projects",
    secaoDepoimentos: "Testimonials",
    secaoHabilidades: "Professional skills",
    secaoCertificacoes: "Certifications",
    secaoEducacao: "Education",
    secaoExperiencia: "Experience",

    baixarCv: "Download CV",
    fotoHeroAlt: "Lucas Araújo, full-stack developer",

    bioNome: "Name:",
    bioNascimento: "Birthday:",
    bioIdade: "Age:",
    bioEndereco: "Address:",
    bioTelefone: "Phone:",
    bioEmail: "E-mail:",
    bioFotoAlt: "Portrait of Lucas Araújo",
    anos: "{n} years",

    verTrabalho: "View Work",
    imagemPendente: "Image",
    imagemProjetoAlt: (titulo: string) => `${titulo} image`,
    linkPendente: "Project link not set yet",
    vitrineProjetos: "Project showcase",
    projetoAnterior: "Previous project",
    proximoProjeto: "Next project",

    depoimentoAnterior: "Previous testimonial",
    proximoDepoimento: "Next testimonial",
    fotoDepoenteAlt: (nome: string) => `Photo of ${nome}`,

    universidade: "University:",
    empresa: "Company:",
    endereco: "Address:",

    contato: "CONTACT",

    copyright: "Copyright © {ano} Portfolio. Design By",
    assinaturaTitulo: "Lucas Araújo’s LinkedIn profile",
    entrar: "Sign in to the restricted area"
};

export const DICIONARIOS: Record<Idioma, Dicionario> = { pt, en };

/** Atributo lang do <html> e locale do Intl de cada idioma. */
export const LOCALE: Record<Idioma, string> = { pt: "pt-BR", en: "en" };

/** Endereço da landing em cada idioma. */
export const ROTA: Record<Idioma, string> = { pt: "/", en: "/en" };
