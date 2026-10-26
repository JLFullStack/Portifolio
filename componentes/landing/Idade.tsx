"use client";

import { useEffect, useState } from "react";
import { idade } from "@/lib/datas";

/**
 * Idade em anos completos. A landing só é gerada quando o conteúdo é publicado,
 * então o número calculado no build envelheceria depois do aniversário:
 * o navegador o recalcula ao montar. `formato` traz "{n}" no lugar do número.
 */
export function Idade({ nascimento, noBuild, formato }: { nascimento: string; noBuild: number; formato: string }) {
    const [anos, setAnos] = useState(noBuild);

    useEffect(() => setAnos(idade(nascimento, new Date())), [nascimento]);

    return <>{formato.replace("{n}", String(anos))}</>;
}
