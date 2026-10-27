// Formulário de contato da landing (POST /contato): qualquer visitante, sem login.
// A mensagem fica na tabela "mensagens" e aparece no painel (/admin/mensagens).
//
// Antispam sem serviço externo (custo zero e nada a mais para a landing baixar):
//   - campo-isca "site", escondido de quem usa o formulário: robô que o preenche é descartado;
//   - "inicio": quando o formulário apareceu; envio em menos de 3 s não é de uma pessoa;
//   - limite por IP (só o SHA-256 dele é guardado) e um teto diário geral.
import { sha256 } from "./auth.js";
import { ErroHttp, campoTexto, dataSql, json, lerJson } from "./http.js";

const POR_IP_POR_HORA = 5;
const POR_DIA = 100;
const TEMPO_MINIMO = 3000; // ms entre abrir a página e enviar

const MENSAGENS = {
    pt: {
        invalido: "Confira os campos e tente de novo.",
        email: "Informe um e-mail válido.",
        curta: "Escreva uma mensagem com pelo menos 10 caracteres.",
        limite: "Você já enviou várias mensagens. Tente de novo mais tarde.",
        ocupado: "O formulário recebeu mensagens demais hoje. Fale comigo pelo WhatsApp ou e-mail."
    },
    en: {
        invalido: "Please check the fields and try again.",
        email: "Please enter a valid email address.",
        curta: "Please write a message of at least 10 characters.",
        limite: "You've already sent several messages. Please try again later.",
        ocupado: "The form has received too many messages today. Please reach me on WhatsApp or by email."
    }
};

export async function tratarContato(request, env) {
    if (request.method !== "POST") throw new ErroHttp(405, "Método não permitido.");

    const dados = await lerJson(request, 16 * 1024);
    const idioma = dados.idioma === "en" ? "en" : "pt";
    const m = MENSAGENS[idioma];

    // Robô: responde como se tivesse dado certo, para não ensinar o que o denunciou.
    const inicio = Number(dados.inicio);
    if (dados.site || !Number.isFinite(inicio) || Date.now() - inicio < TEMPO_MINIMO) return json(200, { ok: true });

    let nome, email, interesse, texto;
    try {
        nome = campoTexto(dados, "nome", { maximo: 120, obrigatorio: true });
        email = campoTexto(dados, "email", { maximo: 254, obrigatorio: true });
        interesse = campoTexto(dados, "interesse", { maximo: 120 });
        texto = campoTexto(dados, "texto", { maximo: 3000, obrigatorio: true });
    } catch {
        throw new ErroHttp(400, m.invalido);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErroHttp(400, m.email);
    if (texto.length < 10) throw new ErroHttp(400, m.curta);

    const ipHash = await sha256(`contato:${request.headers.get("cf-connecting-ip") ?? "desconhecido"}`);
    const [{ recentes }, { hoje }] = await Promise.all([
        env.DB.prepare("SELECT count(*) AS recentes FROM mensagens WHERE ip_hash = ? AND enviada_em > ?").bind(ipHash, dataSql(-3600)).first(),
        env.DB.prepare("SELECT count(*) AS hoje FROM mensagens WHERE enviada_em > ?").bind(dataSql(-24 * 3600)).first()
    ]);

    if (recentes >= POR_IP_POR_HORA) throw new ErroHttp(429, m.limite);
    if (hoje >= POR_DIA) throw new ErroHttp(429, m.ocupado);

    await env.DB.prepare("INSERT INTO mensagens (nome, email, interesse, texto, idioma, ip_hash) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(nome, email.toLowerCase(), interesse, texto, idioma, ipHash).run();

    return json(201, { ok: true });
}
