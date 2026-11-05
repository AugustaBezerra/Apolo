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

  // Formatação rica de Markdown para o chat (negrito, itálico, listas, divisores)
  const renderInlineFormatting = (str: string) => {
    const parts: (string | React.ReactNode)[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={match.index} className={styles.boldText}>
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(
          <em key={match.index} className={styles.italicText}>
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code key={match.index} className={styles.inlineCode}>
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts.length > 0 ? parts : str;
  };

  const renderFormattedContent = (text: string) => {
    if (!text) return null;
    const blocks = text.split(/\n\n+/);

    return blocks.map((block, bIdx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      if (/^---+$|^\*\*\*+$/.test(trimmed)) {
        return <div key={bIdx} className={styles.dividerLine} />;
      }

      const lines = trimmed.split("\n");

      return (
        <div key={bIdx} className={styles.paragraphBlock}>
          {lines.map((line, lIdx) => {
            const lineTrimmed = line.trim();

            // Lista com bullets
            if (/^[\*\-]\s+/.test(lineTrimmed)) {
              const itemContent = lineTrimmed.replace(/^[\*\-]\s+/, "");
              return (
                <div key={lIdx} className={styles.bulletItem}>
                  <span className={styles.bulletDot}>•</span>
                  <div className={styles.itemText}>{renderInlineFormatting(itemContent)}</div>
                </div>
              );
            }

            // Lista numerada
            const numMatch = lineTrimmed.match(/^(\d+[\.\)])\s+(.*)/);
            if (numMatch) {
              return (
                <div key={lIdx} className={styles.numberedItem}>
                  <span className={styles.itemNumber}>{numMatch[1]}</span>
                  <div className={styles.itemText}>{renderInlineFormatting(numMatch[2])}</div>
                </div>
              );
            }

            // Título H3
            if (/^###?\s+/.test(lineTrimmed)) {
              const hText = lineTrimmed.replace(/^###?\s+/, "");
              return (
                <div key={lIdx} className={styles.headingItem}>
                  {renderInlineFormatting(hText)}
                </div>
              );
            }

            // Linha regular de parágrafo
            return (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {renderInlineFormatting(line)}
              </React.Fragment>
            );
          })}
        </div>
      );
    });
  };

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
          <div className={styles.bubbleText}>{renderFormattedContent(content)}</div>
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
