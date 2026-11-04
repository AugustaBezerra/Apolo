import { NextResponse } from "next/server";
import { listUserConversations, createNewConversation } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "user_karine_01";

    const conversations = listUserConversations(userId);
    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json({ error: "Erro ao listar conversas." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, title } = await req.json();
    const novaConversa = createNewConversation(userId || "user_karine_01", title || "Nova Conversa");
    return NextResponse.json({ conversation: novaConversa });
  } catch (error: any) {
    console.error("Erro ao criar conversa:", error);
    return NextResponse.json({ error: "Erro ao iniciar nova conversa." }, { status: 500 });
  }
}
