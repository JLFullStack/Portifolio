// Cria a conta do administrador (só existe uma) e imprime um link de uso único para
// definir a senha. Nenhuma senha passa pelo terminal: ela é criada na página /convite.
//
//   node scripts/criar-admin.mjs --nome "Lucas Araújo" --email voce@exemplo.com --url https://lucasaraujo.dev.br --remoto
//
// Se o administrador já existe, gera um link novo para ele trocar a senha (esqueceu a senha).
// Sem --remoto, usa o banco local (wrangler dev) e o endereço http://127.0.0.1:8787.
import { createHash, randomBytes } from "node:crypto";
import { consultar, executarArquivo, literal, remoto } from "./d1.mjs";

const argumento = nome => {
    const i = process.argv.indexOf(`--${nome}`);
    return i > 0 ? process.argv[i + 1] : undefined;
};

const url = (argumento("url") ?? (remoto ? "https://lucasaraujo.dev.br" : "http://127.0.0.1:8787")).replace(/\/$/, "");
const [[admin]] = consultar("SELECT id, nome, email FROM usuarios WHERE papel = 'admin'");
let usuarioId = admin?.id;

if (!admin) {
    const nome = argumento("nome");
    const email = argumento("email")?.trim().toLowerCase();

    if (!nome || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.error('Informe --nome "Seu Nome" e --email voce@exemplo.com.');
        process.exit(1);
    }

    executarArquivo(`INSERT INTO usuarios (nome, email, papel) VALUES (${literal(nome)}, ${literal(email)}, 'admin');`);
    [[{ id: usuarioId }]] = consultar("SELECT id FROM usuarios WHERE papel = 'admin'");
    console.log(`Administrador criado: ${nome} <${email}>`);
} else {
    console.log(`O administrador já existe (${admin.nome} <${admin.email}>): gerando um link novo para definir a senha.`);
}

// Mesmo formato de worker/auth.js: token base64url de 32 bytes; o banco guarda o SHA-256 em hex.
const token = randomBytes(32).toString("base64url");
const hash = createHash("sha256").update(token).digest("hex");

executarArquivo([
    `DELETE FROM convites WHERE usuario_id = ${usuarioId} AND usado_em IS NULL;`,
    `INSERT INTO convites (token_hash, usuario_id, expira_em) VALUES ('${hash}', ${usuarioId}, datetime('now', '+7 days'));`
].join("\n"));

console.log(`\nAbra este link para definir a senha (vale por 7 dias, uma única vez):\n${url}/convite?token=${token}\n`);
