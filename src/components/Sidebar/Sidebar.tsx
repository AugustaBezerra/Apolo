"use client";

import React from "react";
import styles from "./Sidebar.module.css";
import { MessageSquare, Plus, Clock, LogOut } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onLogout: () => void;
  userName: string;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onLogout,
  userName,
}: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.headerSidebar}>
        <div className={styles.logoIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FDE68A" strokeWidth="2">
            <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2" fill="rgba(253, 230, 138, 0.4)" />
          </svg>
        </div>
        <span className={styles.sidebarTitulo}>Apolo</span>
      </div>

      <div className={styles.secaoTitulo}>
        <MessageSquare size={13} />
        <span>Conversas</span>
      </div>

      <button onClick={onNewConversation} className={styles.btnNovaConversa}>
        <span style={{ fontSize: "14px" }}>✦</span>
        <span>Nova conversa</span>
      </button>

      <div className={styles.secaoTitulo}>
        <Clock size={13} />
        <span>Histórico</span>
      </div>

      <div className={styles.listaHistorico}>
        {conversations.length === 0 ? (
          <div style={{ fontSize: "12px", color: "#94A3B8", padding: "10px 4px" }}>
            Nenhuma conversa salva ainda.
          </div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectConversation(c.id)}
              className={`${styles.itemConversa} ${
                activeConversationId === c.id ? styles.itemAtivo : ""
              }`}
              title={c.title}
            >
              <MessageSquare size={14} style={{ flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {c.title}
              </span>
            </button>
          ))
        )}
      </div>

      <div className={styles.rodapeSidebar}>
        <div className={styles.perfilUsuario}>
          <div className={styles.avatarUser}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <span>{userName}</span>
        </div>
        <button onClick={onLogout} className={styles.btnLogout} title="Sair da conta">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
