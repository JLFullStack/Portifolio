// Gera os ícones do site a partir de public/icone.svg (o monograma "LA"):
//   public/favicon.ico          16, 32 e 48 px (pedido automático dos navegadores)
//   public/apple-touch-icon.png 180 px, sem cantos arredondados (o iOS arredonda)
// Uso: npm run favicon
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const raiz = new URL("../public/", import.meta.url);
const svg = await readFile(new URL("icone.svg", raiz), "utf8");

const png = (fonte, tamanho) =>
    sharp(Buffer.from(fonte), { density: (72 * tamanho) / 64 * 4 })
        .resize(tamanho, tamanho)
        .png({ compressionLevel: 9 })
        .toBuffer();

// ICO com PNGs embutidos: cabeçalho (6 bytes) + uma entrada de 16 bytes por imagem.
const tamanhos = [16, 32, 48];
const imagens = await Promise.all(tamanhos.map(t => png(svg, t)));
const cabecalho = Buffer.alloc(6 + 16 * imagens.length);
cabecalho.writeUInt16LE(0, 0);
cabecalho.writeUInt16LE(1, 2);
cabecalho.writeUInt16LE(imagens.length, 4);
let deslocamento = cabecalho.length;
imagens.forEach((imagem, i) => {
    const e = 6 + 16 * i;
    cabecalho.writeUInt8(tamanhos[i], e);
    cabecalho.writeUInt8(tamanhos[i], e + 1);
    cabecalho.writeUInt16LE(1, e + 4);
    cabecalho.writeUInt16LE(32, e + 6);
    cabecalho.writeUInt32LE(imagem.length, e + 8);
    cabecalho.writeUInt32LE(deslocamento, e + 12);
    deslocamento += imagem.length;
});
await writeFile(new URL("favicon.ico", raiz), Buffer.concat([cabecalho, ...imagens]));

// Apple: fundo até a borda, com o monograma um pouco menor (margem de segurança).
const quadrado = svg
    .replace(/rx="\d+"/, 'rx="0"')
    .replace('transform="translate(-1 0)"', 'transform="translate(32 32) scale(0.86) translate(-33 -32)"');
await writeFile(new URL("apple-touch-icon.png", raiz), await png(quadrado, 180));

console.log("favicon.ico e apple-touch-icon.png gerados em public/");
