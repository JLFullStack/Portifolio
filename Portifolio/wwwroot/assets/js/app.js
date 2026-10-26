/**
 * Comportamento específico da landing page do Portifólio.
 *
 * Carregado depois de biblioteca.js (ver a ordem em App.razor), portanto
 * pode usar os atalhos q/qa e as demais funções da biblioteca.
 */

/**
 * Aplica a classe .rolado no cabeçalho fixo assim que a página sai do topo,
 * dando fundo sólido a ele para o conteúdo não passar por trás ilegível.
 *
 * Não usa o debounce de biblioteca.js de propósito: aquele debounce guarda o
 * timeout em escopo de módulo, compartilhado com ativarSpinnerDebounce e
 * desativarSpinnerDebounce — um listener de scroll frequente cancelaria os
 * timers do spinner. Aqui um alternador simples de classe já é barato.
 */
const destacarCabecalhoAoRolar = () => {
    const cabecalho = q("#cabecalho");

    if (!cabecalho) return;

    const atualizar = () => cabecalho.classList.toggle("rolado", window.scrollY > 10);

    window.addEventListener("scroll", atualizar, { passive: true });
    atualizar();
};
destacarCabecalhoAoRolar();

// #region Tema claro / escuro

const CHAVE_TEMA = "portifolio-tema";
const TEMA_PADRAO = "escuro";

/**
 * Lê o tema já aplicado ao <html>. Quem escreve o atributo pela primeira vez é
 * o script inline de App.razor, que roda antes da primeira pintura para o
 * visitante não ver o tema escuro piscar antes do claro.
 */
const temaAtual = () =>
    document.documentElement.getAttribute("data-tema") === "claro" ? "claro" : TEMA_PADRAO;

/**
 * Aplica o tema ao documento e atualiza o rótulo acessível do botão.
 * Os dois rótulos vêm traduzidos do servidor em data-rotulo-claro /
 * data-rotulo-escuro, então o JS não precisa saber o idioma ativo.
 */
const aplicarTema = (tema, botao) => {
    document.documentElement.setAttribute("data-tema", tema);

    if (!botao) return;

    // O botão anuncia a AÇÃO: no tema escuro, ele leva ao claro.
    const rotulo = tema === "claro"
        ? botao.dataset.rotuloEscuro
        : botao.dataset.rotuloClaro;

    if (rotulo) {
        botao.setAttribute("aria-label", rotulo);
        botao.setAttribute("title", rotulo);
    }
};

const alternarTema = () => {
    const botao = q("#btn-tema");

    if (!botao) return;

    // O servidor renderiza sempre o rótulo do tema padrão; se o visitante já
    // tinha escolhido o claro, corrige o rótulo na carga.
    aplicarTema(temaAtual(), botao);

    botao.addEventListener("click", () => {
        const novo = temaAtual() === "claro" ? "escuro" : "claro";

        aplicarTema(novo, botao);

        try {
            localStorage.setItem(CHAVE_TEMA, novo);
        } catch (e) {
            // Armazenamento bloqueado: o tema vale só para esta visita.
        }
    });
};
alternarTema();

// #endregion Tema claro / escuro

// #region Faixa de projetos

/**
 * Liga os controles ‹ › às faixas de rolagem (seção Projetos).
 * Cada botão declara em data-faixa o seletor da faixa e em data-direcao
 * o sentido (-1 anterior, 1 próximo). Rola exatamente um card por clique.
 */
const ligarControlesDeFaixa = () => {
    qa(".controle-faixa[data-faixa]").forEach(botao => {
        botao.addEventListener("click", () => {
            const faixa = q(botao.dataset.faixa);

            if (!faixa) return;

            const card = faixa.querySelector(".projeto-card");
            const espaco = parseFloat(getComputedStyle(faixa).columnGap) || 0;
            const passo = card ? card.getBoundingClientRect().width + espaco : faixa.clientWidth;

            faixa.scrollBy({ left: passo * Number(botao.dataset.direcao), behavior: "smooth" });
        });
    });
};
ligarControlesDeFaixa();

/**
 * Mantém o texto da esquerda em sincronia com o card que a faixa está
 * mostrando: o card mais próximo da borda esquerda é o ativo.
 *
 * Os textos de todos os projetos já vêm no HTML renderizado pelo servidor —
 * aqui só se alterna a classe .ativo. Sem JavaScript, o primeiro projeto
 * continua visível e a seção segue legível.
 */
const sincronizarProjetos = () => {
    const faixa = q("#projetos-faixa");

    if (!faixa) return;

    const cards = faixa.querySelectorAll(".projeto-card");
    const textos = qa(".projeto-info");

    if (!cards.length) return;

    const ativar = () => {
        let ativo = cards[0];
        let menorDistancia = Infinity;

        // Distância medida entre as bordas visíveis: offsetLeft seria relativo
        // ao offsetParent, não à faixa, e o cálculo erraria o card ativo.
        const bordaDaFaixa = faixa.getBoundingClientRect().left;

        cards.forEach(card => {
            const distancia = Math.abs(card.getBoundingClientRect().left - bordaDaFaixa);

            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                ativo = card;
            }
        });

        const numero = ativo.dataset.projeto;

        cards.forEach(card => card.classList.toggle("ativo", card.dataset.projeto === numero));
        textos.forEach(texto => texto.classList.toggle("ativo", texto.dataset.projeto === numero));
    };

    faixa.addEventListener("scroll", ativar, { passive: true });
    ativar();
};
sincronizarProjetos();

// #endregion Faixa de projetos
