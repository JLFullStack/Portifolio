"use client";

import { Icone } from "@/componentes/icones/Icone";
import { TrocarEmail, TrocarSenha } from "@/componentes/painel/Acesso";
import { Avatar } from "@/componentes/painel/Avatar";
import { usePainel } from "@/componentes/painel/PainelAdmin";

export default function PaginaConta() {
    const { dados, recarregar } = usePainel();
    const admin = dados.usuarios.find(u => u.papel === "admin");

    return (
        <>
            <h1 className="painel-titulo">Conta</h1>
            <p className="painel-subtitulo">Seu acesso ao painel: e-mail de login e senha.</p>

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

            {admin && <TrocarEmail atual={admin.email} aoTrocar={() => recarregar()} />}
            <TrocarSenha />

            <p className="cartao-nota conta-dica">
                <Icone nome="fal:info-circle" /> Esqueceu a senha? Em <a href="/admin/pessoas">Pessoas</a>, gere um link para nova senha.
            </p>
        </>
    );
}
