// Acesso ao banco D1 "portifolio" pelos scripts de build (wrangler d1 execute).
// Local: o banco do wrangler dev, em .wrangler/state. Remoto (--remoto): o banco
// publicado, com o login do `wrangler login` ou, no GitHub Actions, CLOUDFLARE_API_TOKEN.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const WRANGLER = join(RAIZ, "node_modules", "wrangler", "bin", "wrangler.js");
const BANCO = "portifolio";

/** true quando o script recebeu --remoto. */
export const remoto = process.argv.includes("--remoto");

function wrangler(args) {
    const resultado = spawnSync(process.execPath, [WRANGLER, "d1", "execute", BANCO, remoto ? "--remote" : "--local", ...args], {
        cwd: RAIZ,
        encoding: "utf8",
        maxBuffer: 256 * 1024 * 1024,
        env: { ...process.env, CI: "true" }
    });
    const saida = resultado.stdout ?? "";
    const inicio = saida.indexOf("[");
    const inicioErro = saida.indexOf("{");

    // Com --json o wrangler imprime só o JSON; o resto (avisos) vai para stderr.
    if (resultado.status !== 0 || inicio < 0) {
        const detalhe = inicioErro >= 0 ? saida.slice(inicioErro) : `${saida}\n${resultado.stderr}`;
        throw new Error(`wrangler d1 execute falhou (${remoto ? "remoto" : "local"}):\n${detalhe.trim().slice(0, 2000)}`);
    }

    return JSON.parse(saida.slice(inicio));
}

/**
 * Executa um ou mais SELECTs (separados por ;) e devolve as linhas de cada um, na ordem.
 * Valores são interpolados pelo chamador: use só com dados do próprio banco ou números.
 */
export function consultar(sql) {
    return wrangler(["--json", "--command", sql]).map(resultado => resultado.results ?? []);
}

/** Executa um arquivo de comandos SQL. Cada comando precisa ter menos de 100 KB (limite do D1). */
export function executarArquivo(sql) {
    const pasta = mkdtempSync(join(tmpdir(), "portifolio-d1-"));
    const arquivo = join(pasta, "comandos.sql");

    try {
        writeFileSync(arquivo, sql);
        wrangler(["--json", "--file", arquivo]);
    } finally {
        rmSync(pasta, { recursive: true, force: true });
    }
}

/** Texto como literal SQL ('...' com aspas duplicadas). null vira NULL. */
export function literal(valor) {
    if (valor === null || valor === undefined) return "NULL";
    if (typeof valor === "number") return String(valor);

    return `'${String(valor).replaceAll("'", "''")}'`;
}
