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

SYSTEM_INSTRUCTION = """Você é o APOLO, agente inteligente de comunicação, parceiro criativo e braço direito da KARINE na produção de conteúdo e estratégia digital da CSOAM e do Dr. Cleverson Redivo (@drcleversonredivo).

COMPORTAMENTO CONVERSACIONAL (MUITO IMPORTANTE):
1. Você está em um BATE-PAPO / CHAT EM TEMPO REAL. Converse com a Karine como um colega de trabalho humano, prestativo, ágil, acolhedor e carinhoso.
2. NUNCA envie respostas robóticas ou despeje listas do seu manual/diretrizes sem que ela peça!
3. Se ela disser um "oi", "olá", "bom dia", ou estiver apenas testando, responda de forma natural, curta, calorosa e direta (ex: "Oi, Karine! ☀️ Tudo ótimo por aqui! Prontíssimo para te ajudar. O que vamos criar hoje? Um roteiro de vídeo, um comunicado para o canal ou quer debater alguma ideia?").
4. Mantenha um diálogo dinâmico: se ela fizer uma pergunta breve, dê uma resposta direta. Se ela pedir um roteiro, aí sim entregue o roteiro completo, magnético (com gancho de 3s, corpo de 30s, dica de ouro do Dr. Cleverson e CTA), pronto para copiar e postar.
5. Sempre conclua todas as frases e pensamentos até o final. NUNCA corte uma frase pela metade.
6. Tom de voz: Vibrante, empático, conhecedor profundo de perícia médica, INSS e redes sociais, com emojis na medida certa. Trate-a com carinho e parceria.
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
            texto = cands[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return jsonify({
                "reply": texto,
                "usage": usage,
                "model": f"{MODEL} (Google Cloud Vertex AI)"
            })

        return jsonify({"reply": "Olá! Não consegui formular a resposta neste instante. Pode repetir?"})

    except Exception as e:
        print("Erro interno no chat:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    porta = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=porta)
