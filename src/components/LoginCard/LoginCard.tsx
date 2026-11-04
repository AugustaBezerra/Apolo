"use client";

import React, { useState } from "react";
import styles from "./LoginCard.module.css";
import { User, Lock, Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";

import { supabase } from "@/lib/supabase";

interface LoginCardProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginCard({ onLoginSuccess }: LoginCardProps) {
  const [identifier, setIdentifier] = useState("karine");
  const [password, setPassword] = useState("Apolo2026!");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const emailToUse =
        identifier.trim().toLowerCase() === "karine"
          ? "cr.equipe02@gmail.com"
          : identifier.trim();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password,
      });

      if (error) {
        throw new Error(error.message === "Invalid login credentials"
          ? "Credenciais incorretas. Verifique seu usuário e senha."
          : error.message);
      }

      if (!data.user) {
        throw new Error("Não foi possível autenticar o usuário.");
      }

      const userObj = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || "Karine",
        role: data.user.user_metadata?.role || "creator",
      };

      onLoginSuccess(userObj);
    } catch (err: any) {
      setErro(err.message || "Erro de conexão ao autenticar.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Background ilustrado estilo Paper Craft Amazônico */}
      <div className={styles.decoracaoBackground} />
      <div className={styles.decoracaoOverlay} />

      <div className={styles.loginCardContainer}>
        {/* Header Apolo */}
        <div className={styles.headerApolo}>
          <div className={styles.logoApolo}>
            {/* Ícone Bússola/Estrela Guia */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FDE68A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2" fill="rgba(253, 230, 138, 0.2)" />
              <circle cx="12" cy="12" r="3" fill="#FDE68A" />
            </svg>
          </div>
          <h1 className={styles.tituloApolo}>Apolo</h1>
          <p className={styles.subtituloApolo}>
            Seu agente de conversação, sempre por perto.
          </p>
        </div>

        {/* Card em Pergaminho Tátil */}
        <div className={styles.cardPergaminho}>
          <h2 className={styles.cardTitulo}>Bem-vindo(a)!</h2>
          <p className={styles.cardDescricao}>
            Entre para conversar com o Apolo e explorar novas ideias.
          </p>

          {erro && (
            <div className={styles.mensagemErro}>
              <AlertCircle size={16} />
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.formLogin}>
            <div className={styles.inputGroup}>
              <User className={styles.inputIcon} size={18} />
              <input
                type="text"
                className={styles.inputField}
                placeholder="Usuário ou e-mail"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className={styles.inputGroup}>
              <Lock className={styles.inputIcon} size={18} />
              <input
                type={mostrarSenha ? "text" : "password"}
                className={styles.inputField}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.btnOlho}
                onClick={() => setMostrarSenha(!mostrarSenha)}
                title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className={styles.botaoEntrar}
              disabled={carregando}
            >
              <Sparkles size={18} />
              <span>{carregando ? "Entrando..." : "Entrar"}</span>
            </button>
          </form>

          <div className={styles.divisorOu}>
            <span>ou</span>
          </div>

          <button
            type="button"
            className={styles.rodapeLink}
            onClick={() =>
              alert(
                "Acesso exclusivo para Karine e equipe de comunicação da CSOAM. Entre em contato com a coordenação caso precise de novas credenciais."
              )
            }
          >
            Criar uma conta
          </button>

          <div className={styles.dicaAcesso}>
            🔑 <b>Acesso Inicial Pré-configurado:</b><br/>
            Usuário: <code>karine</code> | Senha: <code>Apolo2026!</code>
          </div>
        </div>
      </div>
    </div>
  );
}
