"use client";

import React, { useState, useEffect } from "react";
import LoginCard from "@/components/LoginCard/LoginCard";
import ChatInterface from "@/components/Chat/ChatInterface";

interface UserSession {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
}

export default function Home() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isCarregandoSessao, setIsCarregandoSessao] = useState(true);

  // Recupera sessão persistida no navegador (se houver)
  useEffect(() => {
    try {
      const sessaoSalva = localStorage.getItem("apolo_user_session");
      if (sessaoSalva) {
        setUser(JSON.parse(sessaoSalva));
      }
    } catch (e) {
      console.error("Erro ao ler sessão:", e);
    } finally {
      setIsCarregandoSessao(false);
    }
  }, []);

  const handleLoginSuccess = (usuarioLogado: UserSession) => {
    setUser(usuarioLogado);
    try {
      localStorage.setItem("apolo_user_session", JSON.stringify(usuarioLogado));
    } catch (e) {
      console.error("Erro ao salvar sessão:", e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem("apolo_user_session");
    } catch (e) {
      console.error("Erro ao limpar sessão:", e);
    }
  };

  if (isCarregandoSessao) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#071E3D",
          color: "#FDE68A",
          fontFamily: "sans-serif",
          fontSize: "14px",
        }}
      >
        <span>Carregando Apolo... ☀️</span>
      </div>
    );
  }

  // Se não estiver logado, exibe a Tela de Entrada / Login
  if (!user) {
    return <LoginCard onLoginSuccess={handleLoginSuccess} />;
  }

  // Se logado, exibe a Tela de Chat
  return <ChatInterface user={user} onLogout={handleLogout} />;
}
