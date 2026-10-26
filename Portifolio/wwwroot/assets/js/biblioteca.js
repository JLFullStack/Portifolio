/**
 * Seleciona o primeiro elemento que corresponde ao seletor CSS fornecido.
 * @param {any} seletor
 * @returns
 */
const q = (seletor) => document.querySelector(seletor);

/**
 * Seleciona todos os elementos que correspondem ao seletor CSS fornecido.
 * @param {any} seletor
 * @returns
 */
const qa = (seletor) => document.querySelectorAll(seletor);

let debounceTimeout;

function debounce(func, delay) {
    return (...args) => {
        clearTimeout(debounceTimeout); // Limpa o timeout anterior
        debounceTimeout = setTimeout(() => func(...args), delay); // Configura um novo timeout
    };
};

// Mostra o card de mensagem no final da tela
function mostrarMensagem(msg, success = true) {
    const
        ntf_Card = q("#ntf-card"),
        ntf_CardBootstrap = bootstrap.Toast.getOrCreateInstance(ntf_Card),
        successMessage = q("#successMessage")?.textContent,
        errorMessage = q("#errorMessage")?.textContent;

    ntf_Card?.classList.remove("slide-left");
    ntf_Card?.classList.add("slide-left");

    // muda a cor da header
    if (msg && success == true) {
        ntf_Card.firstElementChild.classList.remove("bg-danger");
        ntf_Card.firstElementChild.classList.add("bg-primary");
    }
    else if (msg && success == false) {
        ntf_Card.firstElementChild.classList.remove("bg-primary");
        ntf_Card.firstElementChild.classList.add("bg-danger");
    };

    if (msg)
        ntf_Card.lastElementChild.innerHTML = `<strong>${msg}</strong>`;

    if (msg || successMessage || errorMessage)
        ntf_CardBootstrap.show();
}
mostrarMensagem();

const mostrarScroll = () => {
    const btnScroll = q("#btn-scroll");

    window.addEventListener('scroll', () => {
        window.scrollY > 150 ? btnScroll.classList.add("active") : btnScroll.classList.remove("active");
    });

    btnScroll.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });
}
mostrarScroll();

const ampliarImagem = (imagem) => {
    if (!imagem) return;

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    const imgAmpliada = document.createElement("img");
    imgAmpliada.src = imagem.src;

    overlay.appendChild(imgAmpliada);
    document.body.appendChild(overlay);

    // inicia animação de fechamento ao clicar na imagem ampliada
    overlay.addEventListener("click", function () {
        imgAmpliada.style.animation = "zoom-out 0.3s forwards, fade-out 0.3s forwards";
        overlay.style.animation = "fade-out 0.3s forwards";

        // aguarda o término da animação antes de remover
        setTimeout(() => {
            overlay.remove();
        }, 300); // tempo deve bater com o da animação
    });
}

const bloquearTeclaEnter = () => {
    window.addEventListener("keypress", (e) => {
        if (e.key === "Enter") e.preventDefault();
    });
}
bloquearTeclaEnter();

const evitarEspacoInicial = () => {
    const
        inputs = document.querySelectorAll('input[type="text"]'),
        textsarea = document.querySelectorAll('textarea');

    inputs.forEach(input => {
        input.addEventListener("input", () => {

            // Remove espaços no início da string
            if (input.value.startsWith(' '))
                input.value = input.value.trimStart();
        });
    });

    textsarea.forEach(textarea => {
        textarea.addEventListener("input", () => {

            // Remove espaços no início da string
            if (textarea.value.startsWith(' '))
                textarea.value = textarea.value.trimStart();
        });
    });
}
evitarEspacoInicial();

const ativarPopover = () => {
    const popovers = qa('[data-bs-toggle="popover"]');

    let popover;

    popovers.forEach(element => {
        element.addEventListener("click", () => {
            element.setAttribute("data-bs-custom-class", "custom-popover");
            element.setAttribute("data-bs-html", "true");
            element.setAttribute("data-bs-trigger", "hover");

            const conteudo = "TESTE POPOVER"

            element.setAttribute("data-bs-content", conteudo);

            // Remove popover antigo se já existir
            if (popover)
                popover.dispose();

            // Cria um novo popover com o conteúdo atualizado
            popover = new bootstrap.Popover(element, {
                container: element,
                sanitize: false
            });
            popover.show();
        });
    });
};
ativarPopover();

const filtrar = (input) => {
    const texto = input.value.toLowerCase().trim();
    const elementos = qa(`.${input.dataset.filtro}`);

    elementos.forEach(elemento => {
        // Verifica apenas elementos que têm texto
        const contemTexto = Array.from(elemento.querySelectorAll("*"))
            .some(filho => typeof filho.innerText === "string" && filho.innerText.toLowerCase().includes(texto));

        // Exibe ou oculta o elemento
        if (contemTexto) {
            elemento.style.display = "";
        }
        else {
            elemento.style.display = "none";
        };
    });
};

const limparFiltro = (btn) => {
    const input = btn.closest('.input-group').querySelector('input[type="search"]');
    const elementos = qa(`.${input.dataset.filtro}`);

    input.value = "";
    input.focus();

    elementos.forEach(elemento => elemento.style.display = "");
};

const ativarSpinner = async () => {
    const
        spinner = q(".spinner"),
        backdrop = document.createElement("div"),
        body = q("body");

    if (!spinner || q(".backdrop")) return;

    spinner.style.display = 'block';

    // adiciona o pano de fundo para evitar qualquer evento de clique
    backdrop.classList.add("backdrop");
    body.appendChild(backdrop);

    await new Promise(resolve => setTimeout(resolve, 10));
};

const desativarSpinner = () => {
    const
        spinner = q(".spinner"),
        backdrops = qa(".backdrop");

    if (spinner)
        spinner.style.display = 'none';

    backdrops.forEach(backdrop => backdrop.remove());
};

const ativarSpinnerDebounce = debounce(ativarSpinner, 700);
const desativarSpinnerDebounce = debounce(desativarSpinner, 700);

window.addEventListener('beforeunload', () => ativarSpinnerDebounce()); // Ativa o spinner ao recarregar ou redirecionar a página
window.addEventListener('pageshow', () => desativarSpinnerDebounce()); // Desativa o spinner ao voltar para a página anterior

// #region Máscaras

const cpf = () => {
    qa(".cpf").forEach((cpf) =>
        cpf.addEventListener("input", (e) => {
            const input = e.target;
            let value = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos

            if (value.length > 11) value = value.slice(0, 11); // limita para 11 caracteres

            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); // aplica a máscara de CPF

            input.value = value;
        })
    );
};
cpf();

const rg = () => {
    qa(".rg").forEach((rg) =>
        rg.addEventListener("input", (e) => {
            const input = e.target;

            // Remove tudo que não seja letra ou número
            let value = input.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
            let arr = value.split('');

            // Se houver mais de um caractere, só o último pode ser letra
            if (arr.length > 1) {
                // Todos, exceto o último, devem ser dígitos
                for (let i = 0; i < arr.length - 1; i++) {
                    arr[i] = arr[i].replace(/\D/g, '');
                }
            }

            // Reconstrói a string
            let numeros = arr.join('');

            // Se tiver 9 ou mais caracteres, insere o traço antes do último
            if (arr.length >= 9) {
                const parte1 = numeros.slice(0, -1);
                const parte2 = numeros.slice(-1);
                value = `${parte1}-${parte2}`;
            } else {
                value = numeros;
            }

            input.value = value;
        })
    );
};
rg();

const telefone = () => {
    qa(".telefone").forEach((tel) =>
        tel.addEventListener("input", function (e) {
            const input = e.target;
            const value = input.value;

            input.value = value
                .replace(/\D+/g, "")
                .replace(/(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{4})(\d)/, "$1-$2")
                .replace(/(\d{4})-(\d)(\d{4})/, "$1$2-$3")
                .replace(/(-\d{4})\d+?$/, "$1");
        })
    );
}
telefone();

const cep = () => {
    qa(".cep").forEach((cep) =>
        cep.addEventListener("input", (e) => {
            const
                input = e.target,
                cep = input.value,
                limparCep = cep.replace(/\D/g, ''), // remove todos os caracteres não numéricos
                mascararCep = aplicarMascara(limparCep); // aplica a máscara

            input.setAttribute("maxlength", "9");

            input.value = mascararCep; // Define o valor mascarado de volta para o campo de entrada

            function aplicarMascara(cep) {
                const cepRegex = /^(\d{0,5})(\d{0,3})$/;
                const mascararCep = cep.replace(cepRegex, (match, part1, part2) => {
                    if (part2) {
                        return `${part1}-${part2}`;
                    } else {
                        return part1;
                    }
                });
                return mascararCep;
            };
        })
    );
};
cep();

const numerosInteiros = () => {
    document.querySelectorAll(".inteiro").forEach((number) =>
        number.addEventListener("input", function (e) {
            const input = e.target;
            const value = input.value;

            if (value === "-1") input.value = "0";
            else input.value = value.replace(/\D/g, "");
        })
    );
}
numerosInteiros();

const numerosDecimais = () => {
    document.querySelectorAll(".decimal").forEach((number) =>
        number.addEventListener("input", function (e) {
            const input = e.target;
            let value = input.value;

            // Substitui caracteres não numéricos, exceto a vírgula
            value = value.replace(/[^\d,]/g, "");

            // Impede mais de um ponto decimal
            const decimalParts = value.split(",");

            if (decimalParts.length > 2)
                value = decimalParts[0] + "," + decimalParts.slice(1).join("");

            // Limita a duas casas decimais após a vírgula
            if (decimalParts[1] && decimalParts[1].length > 2)
                value = decimalParts[0] + "," + decimalParts[1].substring(0, 2);

            input.value = value;
        })
    );
};
numerosDecimais();

// #endregion Máscaras