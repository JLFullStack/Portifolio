import localFont from "next/font/local";

// Inter variável (pesos 100..900), só o alfabeto latino, que cobre o português.
// Pré-carregada: é a fonte de todo o texto da primeira dobra.
export const inter = localFont({
    src: "../fontes/inter-latin-wght.woff2",
    weight: "100 900",
    display: "swap",
    variable: "--fonte-inter"
});

// Ernestone: só a assinatura do rodapé. Sem preload, para não disputar banda com a primeira dobra.
export const ernestone = localFont({
    src: "../fontes/ernestone.woff2",
    display: "swap",
    preload: false,
    variable: "--fonte-ernestone"
});
