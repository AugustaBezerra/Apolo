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
  const panoramaUrl = `${basePath}/arts/Amazon%20River%20Papercraft%20Panorama.png`;
  const mobileBgUrl = `${basePath}/arts/apolo_login_bg.png`;

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
    <div
      className={styles.pageWrapper}
      style={
        {
          "--bg-panorama": `url('${panoramaUrl}')`,
          "--bg-mobile": `url('${mobileBgUrl}')`,
        } as React.CSSProperties
      }
    >
      {/* Moldura do Card Paper Craft */}
      <div className={styles.cardFrame}>
        {/* Camada de Background específica para Mobile */}
        <div className={styles.cardBackgroundMobile} />

        {/* Conteúdo sobreposto */}
        <div className={styles.cardContent}>
          {/* Header Superior no Céu Noturno */}
          <div className={styles.headerSky}>
            <div className={styles.avatarLogo}>
              <img
                src={`${basePath}/arts/apolo_avatar.png`}
                alt="Mascote Apolo"
                className={styles.avatarImg}
              />
            </div>
            <h1 className={styles.brandTitle}>Apolo</h1>
            <p className={styles.brandSubtitle}>
              Seu agente de comunicação.
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
