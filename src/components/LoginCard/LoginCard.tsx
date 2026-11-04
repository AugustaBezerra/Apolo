"use client";

import React, { useState } from "react";
import styles from "./LoginCard.module.css";
import { User, Lock, Eye, EyeOff, UserPlus, AlertCircle } from "lucide-react";
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

  const basePath = process.env.NODE_ENV === "production" ? "/Apolo" : "";

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
        throw new Error(
          error.message === "Invalid login credentials"
            ? "Credenciais incorretas. Verifique seu usuário e senha."
            : error.message
        );
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
    <div className={styles.pageWrapper}>
      {/* Moldura do Card Paper Craft */}
      <div className={styles.cardFrame}>
        {/* Camada de Background com a Obra de Arte Amazônica */}
        <div
          className={styles.cardBackground}
          style={{
            backgroundImage: `url('${basePath}/arts/apolo_login_bg.png')`,
          }}
        />

        {/* Conteúdo sobreposto */}
        <div className={styles.cardContent}>
          {/* Header Superior no Céu Noturno */}
          <div className={styles.headerSky}>
            <div className={styles.starLogo}>
              <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                {/* Anel de Órbita Elíptico */}
                <ellipse
                  cx="24"
                  cy="24"
                  rx="21"
                  ry="8"
                  stroke="rgba(253, 230, 138, 0.75)"
                  strokeWidth="1.6"
                  transform="rotate(-26 24 24)"
                />
                {/* Estrela Guia de 4 Pontas */}
                <path
                  d="M24 3 L26.8 19 L42 24 L26.8 29 L24 45 L21.2 29 L6 24 L21.2 19 Z"
                  fill="#FFFBEB"
                  stroke="#FDE68A"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <h1 className={styles.brandTitle}>Apolo</h1>
            <p className={styles.brandSubtitle}>
              Seu agente de conversação, sempre por perto.
            </p>
            <div className={styles.dividerStar}>✦</div>
          </div>

          {/* Seção Inferior no Pergaminho */}
          <div className={styles.formSection}>
            <h2 className={styles.welcomeTitle}>Bem-vindo(a)!</h2>
            <p className={styles.welcomeSubtitle}>
              Entre para conversar com o Apolo
              <br />e explorar novas ideias.
            </p>

            <div className={styles.formDivider}>
              <span>✦</span>
            </div>

            {erro && (
              <div className={styles.errorBox}>
                <AlertCircle size={15} />
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.loginForm}>
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
                  className={styles.btnEye}
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                className={styles.btnEntrar}
                disabled={carregando}
              >
                <span>✦</span>
                <span>{carregando ? "Entrando..." : "Entrar"}</span>
              </button>
            </form>

            <div className={styles.dividerOu}>
              <span>ou</span>
            </div>

            <button
              type="button"
              className={styles.btnCriarConta}
              onClick={() =>
                alert(
                  "Acesso restrito à Karine e equipe de comunicação. As credenciais pré-configuradas são: Usuário: karine | Senha: Apolo2026!"
                )
              }
            >
              <UserPlus size={16} />
              <span>Criar uma conta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
