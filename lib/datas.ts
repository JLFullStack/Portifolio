// Cálculos de data usados no build e no navegador (sem dependências de servidor).

/** Idade em anos completos numa data. `nascimento` no formato AAAA-MM-DD. */
export function idade(nascimento: string, hoje: Date): number {
    const [ano, mes, dia] = nascimento.split("-").map(Number);
    let anos = hoje.getFullYear() - ano;

    if (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)) anos--;

    return anos;
}
