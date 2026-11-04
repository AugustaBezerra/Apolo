import { NextResponse } from "next/server";
import {
  getConversationMessages,
  saveMessage,
  updateConversationTitle,
  createNewConversation,
} from "@/lib/db";
import { responderComApolo } from "@/lib/apolo_agent";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ messages: [] });
    }

    const messages = getConversationMessages(conversationId);
    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Erro ao buscar mensagens:", error);
    return NextResponse.json({ error: "Erro ao buscar mensagens." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { conversationId, userId, message, userName } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Mensagem vazia." }, { status: 400 });
    }

    let convId = conversationId;
    let isNovaConversa = false;

    // Se não tiver conversa ativa, cria uma nova
    if (!convId) {
      const nova = createNewConversation(userId || "user_karine_01", message.substring(0, 35) + "...");
      convId = nova.id;
      isNovaConversa = true;
    }

    // 1. Salva a mensagem do usuário no SQLite
    const userMsg = saveMessage(convId, "user", message.trim());

    // 2. Busca histórico recente para dar contexto à IA
    const historicoAtual = getConversationMessages(convId);
    const historicoFormatado = historicoAtual.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Invoca o Agente Apolo (Gemini + Memória)
    const respostaTexto = await responderComApolo(historicoFormatado, userName || "Karine");

    // 4. Salva a resposta do Apolo no SQLite
    const assistantMsg = saveMessage(convId, "assistant", respostaTexto);

    // 5. Se foi a primeira mensagem, atualiza o título da conversa com inteligência
    if (isNovaConversa || historicoAtual.length <= 2) {
      const tituloLimpo = message.length > 30 ? message.substring(0, 30) + "..." : message;
      updateConversationTitle(convId, tituloLimpo);
    }

    return NextResponse.json({
      conversationId: convId,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
  } catch (error: any) {
    console.error("Erro no chat do Apolo:", error);
    return NextResponse.json(
      { error: "Erro ao processar mensagem com o Apolo." },
      { status: 500 }
    );
  }
}
