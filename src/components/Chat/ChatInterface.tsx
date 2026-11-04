"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./ChatInterface.module.css";
import Sidebar from "../Sidebar/Sidebar";
import MessageBubble from "../MessageBubble/MessageBubble";
import { Paperclip, Send, Settings, Sparkles } from "lucide-react";

interface UserSession {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatInterfaceProps {
  user: UserSession;
  onLogout: () => void;
}

export default function ChatInterface({ user, onLogout }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputTexto, setInputTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Carrega histórico de conversas da Karine
  useEffect(() => {
    carregarConversas();
  }, [user.id]);

  // 2. Quando seleciona conversa, carrega as mensagens
  useEffect(() => {
    if (activeConvId) {
      carregarMensagens(activeConvId);
    } else {
      // Mensagem inicial de boas-vindas do Apolo
      setMessages([
        {
          id: "msg_welcome_1",
          role: "assistant",
          content: `Olá, ${user.name}! ✨ Fico muito feliz em te ver por aqui!\n\nSou o Apolo, seu co-piloto de conteúdo e redes sociais. Como posso te apoiar hoje com as gravações do Dr. Cleverson (@drcleversonredivo)?`,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }, [activeConvId]);

  // Rola para a mensagem mais recente
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, enviando]);

  const carregarConversas = async () => {
    try {
      const res = await fetch(`/api/history?userId=${user.id}`);
      const data = await res.json();
      if (data.conversations && data.conversations.length > 0) {
        setConversations(data.conversations);
        setActiveConvId(data.conversations[0].id);
      }
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
    }
  };

  const carregarMensagens = async (convId: string) => {
    try {
      const res = await fetch(`/api/chat?conversationId=${convId}`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        setMessages([
          {
            id: "msg_init",
            role: "assistant",
            content: `Oi, ${user.name}! 🌸 Se quiser, podemos criar novos roteiros de 60s, debater temas virais de esportes/filmes ou preparar comunicados para o Canal do WhatsApp.`,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.error("Erro ao carregar mensagens:", e);
    }
  };

  const handleEnviar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textoLimpo = inputTexto.trim();
    if (!textoLimpo || enviando) return;

    setInputTexto("");
    setEnviando(true);

    // Adiciona temporariamente a mensagem do usuário na tela
    const tempUserMsg: Message = {
      id: `temp_${Date.now()}`,
      role: "user",
      content: textoLimpo,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
          userId: user.id,
          userName: user.name,
          message: textoLimpo,
        }),
      });

      const data = await res.json();
      if (res.ok && data.assistantMessage) {
        if (!activeConvId && data.conversationId) {
          setActiveConvId(data.conversationId);
          carregarConversas();
        }
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          data.userMessage,
          data.assistantMessage,
        ]);
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    } finally {
      setEnviando(false);
    }
  };

  const handleNovaConversa = () => {
    setActiveConvId(null);
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        role: "assistant",
        content: `Oi, ${user.name}! 🌸 Nova conversa iniciada. O que vamos planejar agora para o Dr. Cleverson?`,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className={styles.chatLayout}>
      {/* Sidebar de Histórico com CSS Modules */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConvId}
        onSelectConversation={(id) => setActiveConvId(id)}
        onNewConversation={handleNovaConversa}
        onLogout={onLogout}
        userName={user.name}
      />

      {/* Área Central de Conversa */}
      <main className={styles.mainChatArea}>
        <div className={styles.chatBackground} />

        {/* Top Header */}
        <header className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.avatarHeader}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FDE68A" strokeWidth="2">
                <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2" fill="rgba(253, 230, 138, 0.4)" />
                <circle cx="12" cy="12" r="3" fill="#FDE68A" />
              </svg>
            </div>
            <div className={styles.infoApolo}>
              <h2>Apolo</h2>
              <div className={styles.statusOnline}>
                <span className={styles.dotOnline} />
                <span>Online</span>
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.btnAcao}
              title="Configurações do Apolo"
              onClick={() =>
                alert("Painel do Apolo: Memória persistente ativada e conectada ao Vertex AI (Gemini).")
              }
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Feed de Mensagens */}
        <div className={styles.messagesFeed}>
          {messages.length === 1 && (
            <div className={styles.boasVindasCard}>
              <h3>☀️ Co-Piloto de Redes Sociais do Dr. Cleverson</h3>
              <p>
                Pronto para gerar roteiros com ganchos de 3 segundos, comunicados para o WhatsApp ou conectar trends de filmes e esportes!
              </p>
              <div className={styles.sugestoesRapidas}>
                <button
                  className={styles.btnSugestao}
                  onClick={() => setInputTexto("Apolo, me dê 2 ideias de vídeos virais conectando lesões de futebol com o INSS")}
                >
                  ⚽ Trend de Esportes & INSS
                </button>
                <button
                  className={styles.btnSugestao}
                  onClick={() => setInputTexto("Me gere um comunicado para o Canal do WhatsApp sobre a regra da Hérnia de Disco")}
                >
                  📢 Comunicado Canal WhatsApp
                </button>
                <button
                  className={styles.btnSugestao}
                  onClick={() => setInputTexto("Crie um roteiro de Reels de 60s desmistificando o 'CID não é incapacidade'")}
                >
                  🎬 Roteiro de Reels 60s
                </button>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role}
              content={m.content}
              createdAt={m.created_at}
            />
          ))}

          {enviando && (
            <div className={styles.typingIndicator}>
              <Sparkles size={14} color="#D97706" />
              <span>Apolo está formulando a melhor ideia...</span>
              <div className={styles.typingDots}>
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Flutuante */}
        <div className={styles.inputBarWrapper}>
          <form onSubmit={handleEnviar} className={styles.inputFloatingCard}>
            <button
              type="button"
              className={styles.btnAnexo}
              title="Anexar pauta ou arquivo"
              onClick={() => alert("Upload de briefing em PDF ou imagem disponível.")}
            >
              <Paperclip size={20} />
            </button>

            <input
              type="text"
              className={styles.inputMensagem}
              placeholder="Digite sua mensagem para o Apolo..."
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              disabled={enviando}
            />

            <button
              type="submit"
              className={styles.btnEnviar}
              disabled={enviando || !inputTexto.trim()}
              title="Enviar mensagem"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
