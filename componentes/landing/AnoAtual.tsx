"use client";

import { useEffect, useState } from "react";

/**
 * Texto com o ano atual no lugar de "{ano}" (o copyright do rodapé). O HTML sai
 * com o ano do build, e o navegador o atualiza, pois a landing só é gerada
 * quando o conteúdo é publicado.
 */
export function AnoAtual({ formato, noBuild }: { formato: string; noBuild: number }) {
    const [ano, setAno] = useState(noBuild);

    useEffect(() => setAno(new Date().getFullYear()), []);

    return <>{formato.replace("{ano}", String(ano))}</>;
}
