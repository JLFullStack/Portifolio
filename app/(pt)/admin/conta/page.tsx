"use client";

import { Icone } from "@/componentes/icones/Icone";
import { TrocarSenha } from "@/componentes/painel/Acesso";
import { Avatar } from "@/componentes/painel/Avatar";
import { usePainel } from "@/componentes/painel/PainelAdmin";

export default function PaginaConta() {
    const { dados } = usePainel();
    const admin = dados.usuarios.find(u => u.papel === "admin");

    return (
        <>
            <h1 className="painel-titulo">Conta</h1>
            <p className="painel-subtitulo">Seu acesso ao painel e a troca de senha.</p>

            {admin && (
                <section className="cartao conta-perfil">
                    <Avatar nome={admin.nome} grande />
                    <div>
                        <h2>{admin.nome}</h2>
                        <p className="cartao-nota">{admin.email}</p>
                        <span className="selo selo-destaque"><Icone nome="fal:shield-check" /> Administrador</span>
                    </div>
                </section>
            )}

            <TrocarSenha />

            <p className="cartao-nota conta-dica">
                <Icone nome="fal:info-circle" /> Esqueceu a senha? Em <a href="/admin/pessoas">Pessoas</a>, gere um link para nova senha.
            </p>
        </>
    );
}
