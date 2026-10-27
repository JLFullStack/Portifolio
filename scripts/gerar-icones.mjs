// Gera componentes/icones/dados.ts com os desenhos dos ícones do Font Awesome Pro usados no site
// (npm run icones). Cada ícone vira um SVG inline (componentes/icones/Icone.tsx): a landing não baixa
// o CSS do Font Awesome nem as webfonts, só os poucos paths que usa.
//
// Os desenhos são lidos dos arquivos js/light.js, solid.js e brands.js do pacote Font Awesome Pro
// (5.13.0), onde cada ícone é "nome": [largura, altura, [ligaduras], "unicode", "path"].
// O pacote fica em .local/font-awesome-pro/, fora do git: a licença Pro proíbe redistribuí-lo
// num repositório público. O arquivo gerado (só os paths usados) é versionado, então o build
// não depende do pacote.
//
// Para usar um ícone novo: acrescente-o em ICONES e rode npm run icones.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const pacote = process.argv[2] ?? join(raiz, ".local", "font-awesome-pro", "pro-5.13.0", "js");

// Estilo (prefixo do Font Awesome) → arquivo do pacote.
const ARQUIVOS = { fal: "light.js", fas: "solid.js", fab: "brands.js" };

const ICONES = {
    fal: ["arrow-right", "bars", "chevron-left", "chevron-right", "download", "file-certificate", "times", "sign-in",
        // Ícones decorativos da landing: dados da biografia, grupos de habilidades e timelines.
        "id-card", "calendar-alt", "birthday-cake", "map-marker-alt", "mobile-alt", "envelope",
        "laptop-code", "server", "database", "infinity", "layer-group", "code", "graduation-cap", "briefcase"],
    fas: ["arrow-up", "moon", "sun", "user", "quote-left"],
    // Redes sociais: também são as opções do painel ao cadastrar uma rede.
    fab: ["linkedin-in", "facebook-f", "instagram", "github", "whatsapp", "skype", "twitter", "youtube", "behance", "dribbble", "medium", "telegram", "discord", "gitlab", "stack-overflow"]
};

const escapar = texto => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const linhas = [];
const faltando = [];

for (const [estilo, nomes] of Object.entries(ICONES)) {
    const fonte = readFileSync(join(pacote, ARQUIVOS[estilo]), "utf8");

    for (const nome of nomes) {
        const encontrado = fonte.match(new RegExp(`"${escapar(nome)}": \\[(\\d+), (\\d+), \\[[^\\]]*\\], "[0-9a-f]+", "([^"]+)"\\]`));

        if (!encontrado) {
            faltando.push(`${estilo}:${nome}`);
            continue;
        }

        const [, largura, altura, path] = encontrado;
        linhas.push(`    "${estilo}:${nome}": [${largura}, ${altura}, "${path}"],`);
    }
}

writeFileSync(join(raiz, "componentes", "icones", "dados.ts"), `// Gerado por scripts/gerar-icones.mjs (npm run icones) a partir do Font Awesome Pro 5.13.0. Não editar.
// Cada ícone: [largura, altura, path do SVG].

export const ICONES = {
${linhas.join("\n")}
} as const satisfies Record<string, readonly [number, number, string]>;

export type NomeIcone = keyof typeof ICONES;
`);

console.log(`componentes/icones/dados.ts: ${linhas.length} ícones`);
if (faltando.length) console.log(`Não existem no Font Awesome 5.13: ${faltando.join(", ")}`);
