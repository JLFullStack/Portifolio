// Converte as fotos do perfil em WebP, nas larguras que a landing pede no srcset (npm run imagens).
// Saída em public/imagens/, versionada: são as fotos da semente (conteudo/semente.json), que
// scripts/carregar-semente.mjs grava no D1. As fotos enviadas pelo painel são reduzidas no navegador.
// Origem: as fotos originais em .local/imagens-originais/ (fora do git) ou a pasta passada como argumento.
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const origem = process.argv[2] ?? join(raiz, ".local", "imagens-originais");
const destino = join(raiz, "public", "imagens");

// Larguras: 1x e 2x do maior tamanho exibido (hero até 26rem = 416px no desktop; 16rem no celular, que com densidade 1,75 a 3 pede 448 a 768px; anel da biografia até 22rem).
const FOTOS = [
    { arquivo: "perfil-hero.png", nome: "perfil-hero", larguras: [320, 480, 640, 832] },
    { arquivo: "perfil-biografia.jpg", nome: "perfil-biografia", larguras: [360, 700] }
];

mkdirSync(destino, { recursive: true });

for (const foto of FOTOS) {
    for (const largura of foto.larguras) {
        const saida = join(destino, `${foto.nome}-${largura}.webp`);
        const info = await sharp(join(origem, foto.arquivo))
            .resize({ width: largura, withoutEnlargement: true })
            .webp({ quality: 78, alphaQuality: 90, effort: 6 })
            .toFile(saida);

        console.log(`${foto.nome}-${largura}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
    }
}
