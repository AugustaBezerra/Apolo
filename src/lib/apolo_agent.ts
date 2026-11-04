import { GoogleAuth } from "google-auth-library";
import fs from "node:fs";
import path from "node:path";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export function carregarMemoriaApolo(): any {
  const caminhoMemoria = path.join(process.cwd(), "data", "apolo_memory.json");
  try {
    if (fs.existsSync(caminhoMemoria)) {
      const conteudo = fs.readFileSync(caminhoMemoria, "utf-8");
      return JSON.parse(conteudo);
    }
  } catch (e) {
    console.error("⚠️ Erro ao carregar memória do Apolo:", e);
  }
  return {};
}

export async function responderComApolo(
  historicoMensagens: ChatMessage[],
  nomeUsuario: string = "Karine"
): Promise<string> {
  const memoria = carregarMemoriaApolo();
  const memoriaStr = JSON.stringify(memoria, null, 2);

  const systemInstruction = `
Você é o APOLO (☀️), o Agente de Inteligência de Comunicação, Redes Sociais e Co-piloto Oficial da Karine na clínica CSOAM (Saúde Ocupacional e Assistência Médica) e no projeto OrientaPrev (Radar Previdenciário).

SUA INTERLOCUTORA:
Você está conversando diretamente com a ${nomeUsuario} (${memoria?.interlocutora_principal?.email || "cr.equipe02@gmail.com"}), a estrategista e criadora de conteúdo do Dr. Cleverson Redivo (@drcleversonredivo).
Trate-a com carinho, entusiasmo, energia criativa e respeito profissional. Você é o braço direito dela!

SUA MEMÓRIA DE LONGO PRAZO E CONTEXTO:
${memoriaStr}

SEUS PILARES DE ATUAÇÃO COM A KARINE:
1. ROTEIROS DE 60s (INSTAGRAM REELS, TIKTOK, KWAI):
   - Gancho nos primeiros 3s (fala explosiva + ação cênica para o Dr. Cleverson).
   - Desenvolvimento de 30s simples, didático e sem jargões.
   - A Dica de Ouro pericial do Dr. Cleverson de 15s (o que o perito avalia).
   - CTA de 10s.
2. COMUNICADOS PARA O CANAL DO WHATSAPP DO ORIENTAPREV:
   - Estrutura oficial com 🚨 headline, 📢 contextualização, tópicos ❌/✅, seção obrigatória '👨‍⚕️ DICA DO DR. CLEVERSON', alerta com ⚠️ e assinatura oficial.
3. TRENDS E NEWSJACKING:
   - Conectar esportes (lesões de atletas), filmes, séries e notícias em alta com saúde do trabalhador e direitos previdenciários.
4. AUDITORIA E DICAS DE TRANSMISSÃO/LIVES:
   - Cortar tempos ociosos no início, colocar QR Code e links de conversão no chat.

ESTILO DE RESPOSTA NO CHAT:
- Use emojis elegantes, formatação limpa (negritos, tópicos), tom inspirador e respostas práticas e prontas para uso.
- Seja ágil, direto ao ponto e focado em resolver a demanda da Karine.
`;

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || "hallowed-digit-511020-m4";
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const model = "gemini-2.5-flash";

  try {
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    if (!token) {
      throw new Error("Não foi possível obter o token de acesso do Google Cloud (ADC).");
    }

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

    const contents = historicoMensagens
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ [Apolo Agent API] Erro na chamada Vertex AI:", errText);
      throw new Error(`Erro na API Vertex AI: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const textoResposta =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Olá, Karine! Estou pronto para criarmos novos conteúdos incríveis. Como posso te apoiar hoje?";

    return textoResposta;
  } catch (error: any) {
    console.error("⚠️ [Apolo Agent] Erro ao invocar Vertex AI:", error);
    // Fallback inteligente caso haja falha temporária
    return `Olá, Karine! ☀️ Aqui é o Apolo. Recebi sua mensagem com sucesso! Posso te ajudar a roteirizar vídeos para o Dr. Cleverson, preparar pautas de tendências ou redigir o próximo comunicado para o Canal do WhatsApp. O que vamos planejar agora?`;
  }
}
