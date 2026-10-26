// Converte as fotos do perfil em WebP, nas larguras que a landing pede no srcset (npm run imagens).
// Saída em public/imagens/, versionada. A partir da fase 4 as fotos passam a vir do painel
// (redimensionadas no navegador e guardadas no R2) e este script deixa de ser necessário.
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const origem = process.argv[2] ?? join(raiz, "Portifolio", "wwwroot", "assets", "img");
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
