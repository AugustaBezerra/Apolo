import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.auth
from google.auth.transport.requests import Request as GoogleRequest

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "hallowed-digit-511020-m4")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
MODEL = "gemini-2.5-flash"

SYSTEM_INSTRUCTION = """Você é o APOLO (☀️), copiloto de estratégia de conteúdo, radar de tendências virais e braço direito criativo da KARINE (@cr.equipe02 / Karine) e do Dr. Cleverson Redivo (@drcleversonredivo).

MISSÃO PRINCIPAL: RADAR DE TRENDS E CONTEÚDO MAGNÉTICO
1. VOCÊ É LIVRE E ANTENADO NO AGORA (TEMPO REAL):
   - Você tem acesso à busca na internet em tempo real via Google Search. Sempre que a Karine pedir tendências, pautas quentes, vídeos virais, memes, formatos em alta ou notícias, pesquise o que está acontecendo AGORA (semana e mês atual de 2026).
   - NUNCA traga dados antigos ou roteiros genéricos de anos passados (como 2024).
   - NÃO SE LIMITE A INSS OU PERÍCIA! O seu papel com a Karine é ser um radar cultural e digital completo: traga assuntos que estão realmente bombando nas redes sociais (TikTok, Instagram Reels, X/Twitter, YouTube, realities, futebol/esportes, cinema, séries, comportamento, memes, curiosidades e vida real).
2. COMO TRABALHAR AS IDEIAS COM A KARINE:
   - Se ela pedir "trends gerais", "o que está viralizando" ou "ideias de vídeos": entregue as tendências reais mais fortes do momento, explicando por que estão engajando e como criadores estão usando.
   - Conexão Inteligente (Newsjacking): Quando fizer sentido (ou se ela pedir), mostre como o Dr. Cleverson pode "pegar carona" na trend de forma natural, leve ou bem-humorada (sem forçar a barra nem parecer chato/acadêmico).
   - Variedade de Formatos: Sugira formatos virais que funcionam (reacts com tela dividida, ganchos contrários que quebram expectativa, histórias e casos curiosos, debates, bastidores, mitos populares).
   - Se ela pedir um roteiro pronto: entregue com estrutura irresistível: Gancho de 3 segundos (fala + ação visual), Desenvolvimento dinâmico de 30 segundos, Ponto alto/opinião forte de 15 segundos e CTA envolvente.
3. COMPORTAMENTO CONVERSACIONAL (CHAT HUMANO):
   - Converse como um colega de trabalho próximo, prestativo, ágil, alto-astral e super criativo.
   - NUNCA dê respostas robóticas ou cuspa manuais sem que ela peça.
   - Se ela só mandar um "oi" ou fizer um teste, responda de forma leve, curta e acolhedora.
   - Sempre conclua todas as frases e raciocínios até o final.
   - Tom de voz: Vibrante, empático, conhecedor de redes sociais e comportamento humano, com emojis na medida certa. Trate a Karine com carinho, entusiasmo e parceria.
"""

def obter_token_vertex():
    credentials, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    credentials.refresh(GoogleRequest())
    return credentials.token

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Apolo Vertex AI Cloud API"})

@app.route("/chat", methods=["POST"])
def chat():
    try:
        dados = request.get_json(force=True) or {}
        mensagem = dados.get("message", "").strip()
        historico = dados.get("history", [])
        user_name = dados.get("userName", "Karine")

        if not mensagem:
            return jsonify({"error": "Mensagem vazia"}), 400

        token = obter_token_vertex()
        url = f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent"

        contents = []
        for h in historico:
            role = "user" if h.get("role") == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": h.get("content", "")}]
            })

        # Adiciona a mensagem atual se não estiver no histórico
        if not contents or contents[-1].get("parts", [{}])[0].get("text") != mensagem:
            contents.append({
                "role": "user",
                "parts": [{"text": mensagem}]
            })

        payload = {
            "system_instruction": {
                "parts": [{"text": f"{SYSTEM_INSTRUCTION}\n\nVocê está conversando com: {user_name}."}]
            },
            "contents": contents,
            "tools": [{"googleSearch": {}}],
            "generation_config": {
                "temperature": 0.7,
                "max_output_tokens": 4096
            }
        }

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        if resp.status_code != 200:
            print("Erro Vertex AI:", resp.status_code, resp.text)
            return jsonify({"error": f"Erro do Vertex AI: {resp.text}"}), 500

        res_json = resp.json()
        cands = res_json.get("candidates", [])
        usage = res_json.get("usageMetadata", {})
        print(f"📊 [Vertex AI] Sucesso! Tokens consumidos -> Prompt: {usage.get('promptTokenCount')}, Resposta: {usage.get('candidatesTokenCount')}, Total: {usage.get('totalTokenCount')}")

        if cands:
            parts = cands[0].get("content", {}).get("parts", [])
            texto = "".join([p.get("text", "") for p in parts if "text" in p])
            if not texto:
                texto = cands[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return jsonify({
                "reply": texto,
                "usage": usage,
                "model": f"{MODEL} (Google Cloud Vertex AI + Google Search)"
            })

        return jsonify({"reply": "Olá! Não consegui formular a resposta neste instante. Pode repetir?"})

    except Exception as e:
        print("Erro interno no chat:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    porta = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=porta)
