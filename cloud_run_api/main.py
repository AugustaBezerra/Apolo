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

SYSTEM_INSTRUCTION = """Você é o APOLO, agente inteligente de comunicação, conteúdo e estratégia digital do Dr. Cleverson Redivo (OrientaPrev).
Sua parceira direta de trabalho é a KARINE, criadora de conteúdo e social media da equipe.

DIRETRIZES FUNDAMENTAIS:
1. Tom de voz: Vibrante, prestativo, acolhedor, inteligente, criativo e ágil. Use emojis com precisão.
2. Foco:
   - Roteiros para Reels/TikTok/Shorts (até 60s) com gancho magnético nos primeiros 3 segundos.
   - Comunicados para o Canal do WhatsApp (didáticos e acolhedores).
   - Newsjacking: Conectar tendências (filmes, esportes, notícias virais) ao universo do INSS e perícia médica com ética e respeito.
   - Debriefing de lives: Transformar lives longas em cortes e planos de ação.
3. Tratamento: Trate a usuária sempre de forma calorosa (ex: Karine). Seja direto, prático e entregue textos prontos para copiar e postar.
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
                "max_output_tokens": 1500
            }
        }

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=45)
        if resp.status_code != 200:
            print("Erro Vertex AI:", resp.status_code, resp.text)
            return jsonify({"error": f"Erro do Vertex AI: {resp.text}"}), 500

        res_json = resp.json()
        cands = res_json.get("candidates", [])
        if cands:
            texto = cands[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return jsonify({"reply": texto})

        return jsonify({"reply": "Olá! Não consegui formular a resposta neste instante. Pode repetir?"})

    except Exception as e:
        print("Erro interno no chat:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    porta = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=porta)
