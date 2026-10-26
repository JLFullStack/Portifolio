"use client";

import { TrocarSenha } from "@/componentes/painel/Acesso";

export default function PaginaConta() {
    return (
        <>
            <h1 className="painel-titulo">Conta</h1>
            <p className="painel-subtitulo">
                Esqueceu a senha? Rode <code>node scripts/criar-admin.mjs --remoto --url https://lucasaraujo.dev.br</code> para gerar um link novo.
            </p>
            <TrocarSenha />
        </>
    );
}
