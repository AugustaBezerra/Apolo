"use client";

import React from "react";
import styles from "./Sidebar.module.css";
import { MessageSquare, Plus, Clock, LogOut, Trash2 } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onNewConversation: () => void;
  onLogout: () => void;
  userName: string;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  onLogout,
  userName,
}: SidebarProps) {
  const basePath = process.env.NODE_ENV === "production" ? "/Apolo" : "";

  return (
    <aside className={styles.sidebar}>
      <div className={styles.headerSidebar}>
        <div className={styles.logoIcon}>
          <img
            src={`${basePath}/arts/apolo_avatar.png`}
            alt="Apolo"
            className={styles.avatarSidebarImg}
          />
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
            <div
              key={c.id}
              className={`${styles.itemConversaContainer} ${
                activeConversationId === c.id ? styles.itemAtivo : ""
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectConversation(c.id)}
                className={styles.itemConversaBtn}
                title={c.title}
              >
                <MessageSquare size={14} style={{ flexShrink: 0 }} />
                <span className={styles.itemConversaTexto}>
                  {c.title}
                </span>
              </button>
              {onDeleteConversation && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(c.id);
                  }}
                  className={styles.btnDeleteConversa}
                  title="Apagar esta conversa"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
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
