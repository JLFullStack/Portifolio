// Reduz e converte a imagem no navegador antes do upload: o Worker só recebe WebP pequeno
// (até 1 MB por versão) e grava no D1 sem processar nada. Uma versão por largura pedida,
// nunca maior que a original.
import { api } from "@/lib/api";
import type { InfoImagem } from "@/lib/painel";
import type { Recorte } from "./EditorRecorte";

export type ImagemEnviada = InfoImagem & { id: string };

const QUALIDADE = 0.82;

function paraWebp(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolver, rejeitar) => canvas.toBlob(blob => {
        if (!blob || blob.type !== "image/webp") {
            rejeitar(new Error("Este navegador não gera imagens WebP. Use Chrome, Edge ou Firefox atualizados."));
        } else {
            resolver(blob);
        }
    }, "image/webp", QUALIDADE));
}

/**
 * Prepara e envia uma imagem. `recorte`: a parte da original escolhida no EditorRecorte
 * (sem ele, a imagem inteira, como a foto recortada do topo).
 * Devolve o id da imagem no banco e as larguras geradas.
 */
export async function enviarImagem(arquivo: File, larguras: number[], recorteEscolhido?: Recorte): Promise<ImagemEnviada> {
    if (!arquivo.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");

    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
    } catch {
        throw new Error("Não foi possível ler esta imagem. Tente JPG, PNG ou WebP.");
    }

    // O recorte veio da prévia (<img>, com a mesma orientação EXIF do bitmap): só garante que cabe na imagem.
    const recorte = recorteEscolhido
        ? {
            x: Math.max(0, recorteEscolhido.x),
            y: Math.max(0, recorteEscolhido.y),
            largura: Math.min(recorteEscolhido.largura, bitmap.width - Math.max(0, recorteEscolhido.x)),
            altura: Math.min(recorteEscolhido.altura, bitmap.height - Math.max(0, recorteEscolhido.y))
        }
        : { x: 0, y: 0, largura: bitmap.width, altura: bitmap.height };

    // Larguras maiores que a imagem viram uma só, do tamanho original.
    const alvo = [...new Set(larguras.map(l => Math.min(l, recorte.largura)))].sort((a, b) => a - b);
    const formulario = new FormData();

    formulario.set("largura", String(Math.round(recorte.largura)));
    formulario.set("altura", String(Math.round(recorte.altura)));

    for (const largura of alvo) {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(largura);
        canvas.height = Math.round((largura * recorte.altura) / recorte.largura);

        const contexto = canvas.getContext("2d");
        if (!contexto) throw new Error("Não foi possível processar a imagem.");

        contexto.imageSmoothingQuality = "high";
        contexto.drawImage(bitmap, recorte.x, recorte.y, recorte.largura, recorte.altura, 0, 0, canvas.width, canvas.height);

        const blob = await paraWebp(canvas);
        if (blob.size > 1024 * 1024) throw new Error("A imagem continua grande demais depois de reduzida. Tente outra.");

        formulario.append(`arquivo-${canvas.width}`, blob, `${canvas.width}.webp`);
    }

    bitmap.close();
    return api<ImagemEnviada>("POST", "/api/imagens", formulario);
}
