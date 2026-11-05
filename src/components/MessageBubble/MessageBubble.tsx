import React from "react";
import styles from "./MessageBubble.module.css";
import { User, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export default function MessageBubble({ role, content, createdAt }: MessageBubbleProps) {
  const isAssistant = role === "assistant";

  // Formata hora (ex: 14:32)
  const formatarHora = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const basePath = process.env.NODE_ENV === "production" ? "/Apolo" : "";
  const horaFormatada = formatarHora(createdAt) || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`${styles.messageRow} ${isAssistant ? styles.rowAssistant : styles.rowUser}`}>
      <div className={styles.messageWrapper}>
        {isAssistant && (
          <div className={styles.avatarApolo} title="Apolo">
            <img
              src={`${basePath}/arts/apolo_avatar.png`}
              alt="Apolo"
              className={styles.avatarBubbleImg}
            />
          </div>
        )}

        <div className={`${styles.bubble} ${isAssistant ? styles.bubbleAssistant : styles.bubbleUser}`}>
          <div className={styles.bubbleText}>{content}</div>
          <div className={styles.bubbleFooter}>
            <span>{horaFormatada}</span>
            {!isAssistant && (
              <span className={styles.checkmarks} title="Entregue">
                <CheckCheck size={14} />
              </span>
            )}
          </div>
        </div>

        {!isAssistant && (
          <div className={styles.avatarUser} title="Você">
            <User size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
