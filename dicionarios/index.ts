// Textos fixos da interface (rótulos, navegação, acessibilidade) em pt e en.
// O conteúdo editável no painel
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
        servicos: "Serviços",
        biografia: "Biografia",
        projetos: "Projetos",
        github: "GitHub",
        depoimentos: "Depoimentos",
        habilidades: "Habilidades",
        certificacoes: "Certificações",
        educacao: "Educação",
        experiencia: "Experiência",
        contato: "Contato"
    },

    secaoApresentacao: "Apresentação",
    secaoServicos: "O que eu faço",
    secaoBiografia: "Biografia",
    secaoProjetos: "Projetos",
    secaoDepoimentos: "Depoimentos",
    secaoHabilidades: "Habilidades Profissionais",
    secaoCertificacoes: "Certificações",
    secaoEducacao: "Educação",
    secaoExperiencia: "Experiência",
    secaoGithub: "Código aberto",

    /** Menu lateral e cabeçalho */
    voltarAoInicio: "Voltar ao início",
    menuRedes: "Redes sociais",

    baixarCv: "Download CV",
    heroContato: "Vamos conversar",
    heroDisponivel: "Disponível para novos projetos",
    /** Palavra gigante e contornada ao fundo da hero (decorativa). */
    heroFundo: "PORTFÓLIO",
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
    numeroExperiencia: "anos de experiência",
    numeroTecnologias: "tecnologias",
    numeroFormacoes: "formações",
    numeroCertificacoes: "certificações",

    verTrabalho: "Ver Trabalho",
    verCodigo: "Ver código",
    lerMais: "Ler mais",
    lerMenos: "Ler menos",
    tecnologias: "Tecnologias",
    imagemPendente: "Imagem",
    imagemProjetoAlt: (titulo: string) => `Imagem do projeto ${titulo}`,
    linkPendente: "Link do projeto ainda não definido",
    vitrineProjetos: "Vitrine de projetos",
    ampliarImagem: (titulo: string) => `Ampliar a imagem de ${titulo}`,
    fecharImagem: "Fechar imagem",
    projetoAnterior: "Projeto anterior",
    proximoProjeto: "Próximo projeto",

    depoimentoAnterior: "Depoimento anterior",
    proximoDepoimento: "Próximo depoimento",
    fotoDepoenteAlt: (nome: string) => `Foto de ${nome}`,
    linkedinDepoente: (nome: string) => `LinkedIn de ${nome}`,

    universidade: "Universidade:",
    empresa: "Empresa:",
    endereco: "Endereço:",

    servicoContato: "Quero este serviço",

    githubRepositorios: "repositórios públicos",
    githubEstrelas: "estrelas",
    githubSeguidores: "seguidores",
    githubVerPerfil: "Ver perfil no GitHub",
    githubSemDescricao: "Sem descrição.",
    /** {data} é a data do último push, já formatada. */
    githubAtualizado: "Atualizado em {data}",

    contatoDireto: "Ou fale direto comigo",
    formTitulo: "Envie uma mensagem",
    formNome: "Seu nome",
    formEmail: "Seu e-mail",
    formInteresse: "Assunto",
    formOutro: "Outro assunto",
    formMensagem: "Mensagem",
    formEnviar: "Enviar mensagem",
    formEnviando: "Enviando…",
    formSucesso: "Mensagem enviada! Respondo o quanto antes.",
    formErro: "Não foi possível enviar agora. Tente de novo ou fale comigo pelo WhatsApp.",
    formIsca: "Deixe este campo vazio",

    /** {ano} é o ano atual, atualizado no navegador (AnoAtual.tsx). */
    copyright: "Copyright © {ano} Portifólio. Design By",
    assinaturaTitulo: "Perfil de Lucas Araújo no LinkedIn",
    entrar: "Entrar na área restrita"
};

export type Dicionario = typeof pt;

const en: Dicionario = {
    paginaTitulo: "Portfolio — José Lucas Alcântara de Araújo",
    paginaDescricao: "Portfolio of Lucas Araújo, full-stack developer: projects, experience, education, and testimonials.",

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
        servicos: "Services",
        biografia: "Biography",
        projetos: "Projects",
        github: "GitHub",
        depoimentos: "Testimonials",
        habilidades: "Skills",
        certificacoes: "Certifications",
        educacao: "Education",
        experiencia: "Experience",
        contato: "Contact"
    },

    secaoApresentacao: "Introduction",
    secaoServicos: "What I do",
    secaoBiografia: "Biography",
    secaoProjetos: "Projects",
    secaoDepoimentos: "Testimonials",
    secaoHabilidades: "Professional skills",
    secaoCertificacoes: "Certifications",
    secaoEducacao: "Education",
    secaoExperiencia: "Experience",
    secaoGithub: "Open source",

    voltarAoInicio: "Back to top",
    menuRedes: "Social media",

    baixarCv: "Download CV",
    heroContato: "Let's talk",
    heroDisponivel: "Available for new projects",
    heroFundo: "PORTFOLIO",
    fotoHeroAlt: "Lucas Araújo, full-stack developer",

    bioNome: "Name:",
    bioNascimento: "Date of birth:",
    bioIdade: "Age:",
    bioEndereco: "Address:",
    bioTelefone: "Phone:",
    bioEmail: "Email:",
    bioFotoAlt: "Portrait of Lucas Araújo",
    anos: "{n} years",
    numeroExperiencia: "years of experience",
    numeroTecnologias: "technologies",
    numeroFormacoes: "degrees",
    numeroCertificacoes: "certifications",

    verTrabalho: "View Work",
    verCodigo: "View code",
    lerMais: "Read more",
    lerMenos: "Read less",
    tecnologias: "Tech stack",
    imagemPendente: "Image",
    imagemProjetoAlt: (titulo: string) => `Screenshot of ${titulo}`,
    linkPendente: "Project link not set yet",
    vitrineProjetos: "Project showcase",
    ampliarImagem: (titulo: string) => `Enlarge the image of ${titulo}`,
    fecharImagem: "Close image",
    projetoAnterior: "Previous project",
    proximoProjeto: "Next project",

    depoimentoAnterior: "Previous testimonial",
    proximoDepoimento: "Next testimonial",
    fotoDepoenteAlt: (nome: string) => `Photo of ${nome}`,
    linkedinDepoente: (nome: string) => `${nome} on LinkedIn`,

    universidade: "University:",
    empresa: "Company:",
    endereco: "Address:",

    servicoContato: "I'm interested",

    githubRepositorios: "public repositories",
    githubEstrelas: "stars",
    githubSeguidores: "followers",
    githubVerPerfil: "View GitHub profile",
    githubSemDescricao: "No description.",
    githubAtualizado: "Updated {data}",

    contatoDireto: "Or reach me directly",
    formTitulo: "Send a message",
    formNome: "Your name",
    formEmail: "Your email",
    formInteresse: "Subject",
    formOutro: "Something else",
    formMensagem: "Message",
    formEnviar: "Send message",
    formEnviando: "Sending…",
    formSucesso: "Message sent! I'll get back to you soon.",
    formErro: "Your message couldn't be sent. Please try again or reach me on WhatsApp.",
    formIsca: "Leave this field empty",

    copyright: "Copyright © {ano} Portfolio. Designed by",
    assinaturaTitulo: "Lucas Araújo’s LinkedIn profile",
    entrar: "Sign in to the restricted area"
};

export const DICIONARIOS: Record<Idioma, Dicionario> = { pt, en };

/** Atributo lang do <html> e locale do Intl de cada idioma. */
export const LOCALE: Record<Idioma, string> = { pt: "pt-BR", en: "en" };

/** Endereço da landing em cada idioma. */
export const ROTA: Record<Idioma, string> = { pt: "/", en: "/en" };
