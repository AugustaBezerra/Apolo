# 🌟 Apolo — Agente de Comunicação & Estratégia Digital

Interface Web imersiva para o agente **Apolo**, desenvolvida especialmente para a equipe do **Dr. Cleverson Redivo (OrientaPrev)** com foco na gestão de conteúdos, debriefing de lives, geração de roteiros de vídeos virais e comunicados para canais e redes sociais.

---

## 🎨 Identidade Visual: *Layered Paper Craft Amazônico*
O design do Web Apolo foi concebido com uma estética de recorte em camadas de papel (*paper craft* tridimensional) homenageando a Amazônia e Manaus:
- **Teatro Amazonas** estilizado em tons terracota e dourado no topo do portal de entrada.
- **Barco Regional ("Gaiola")** navegando sobre as ondas estilizadas do **Rio Negro**.
- **Boto-cor-de-rosa** saltando entre as curvas do rio.
- **Rosa dos Ventos / Estrela-Guia Apolo** como insígnia oficial do agente.
- **Cards e Balões Texturizados**: Efeito pergaminho acolhedor com sombras suaves para as falas do Apolo e verde sálvia suave para as mensagens do usuário.
- **Separação Rigorosa de Estilos**: 100% dos estilos organizados em arquivos isolados CSS Modules (`*.module.css`), sem poluição de estilos embutidos no JSX.

---

## 🧠 Arquitetura de Memória do Apolo

O Apolo conta com uma arquitetura de memória em duas camadas:

1. **Memória Permanente & Diretrizes Editoriais (`data/apolo_memory.json`)**:
   - Guarda a persona, o tom de voz acolhedor e informativo, o histórico de aprendizado e as diretrizes clínicas de perícia médica/INSS.
   - Regras específicas para formatos: *Reels/TikTok/Shorts (até 60s)*, *Comunicados de WhatsApp*, *Newsjacking (temas em alta/virais)* e *Debriefing de Lives*.
   - Pode ser enriquecida a qualquer momento editando este arquivo JSON.

2. **Memória de Conversas e Sessões (`data/apolo.db` — SQLite Nativo Node 22)**:
   - Armazena o histórico completo de chats, mensagens e sessões de trabalho da Karine com o Apolo.
   - O banco de dados é criado e auto-configurado na primeira execução pelo motor nativo `node:sqlite`.

---

## 🔐 Controle de Acesso
O sistema possui tela de login restrita para garantir a segurança da equipe:

- **Usuário Inicial**: `karine`
- **Senha Inicial**: `Apolo2026!`

*(Outros usuários podem ser cadastrados ou alterados na tabela `users` do banco SQLite).*

---

## 🚀 Tecnologias Utilizadas
- **Framework Web**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Estilização**: CSS Modules puros com variáveis de design tokens (`globals.css`)
- **Inteligência Artificial**: Google Cloud Vertex AI — modelo `gemini-2.5-flash` via Application Default Credentials (ADC)
- **Banco de Dados**: SQLite Nativo (`node:sqlite` — Node.js 22+)
- **Ícones**: Lucide React

---

## 💻 Como Rodar o Projeto

### Pré-requisitos
- Node.js 22+ instalado
- Google Cloud SDK (`gcloud auth application-default login`)

### Instalação
```bash
# Entrar na pasta do projeto
cd /home/augusta/Documents/Comunicação/web_Apolo

# Instalar dependências
npm install
```

### Configuração de Ambiente
Crie ou verifique o arquivo `.env.local`:
```env
GOOGLE_CLOUD_PROJECT=hallowed-digit-511020-m4
GOOGLE_CLOUD_LOCATION=us-central1
```

### Execução em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse no seu navegador: `http://localhost:3000`

### Build para Produção
```bash
npm run build
npm start
```

---

## 📂 Estrutura de Arquivos
```text
web_Apolo/
├── data/
│   ├── apolo_memory.json         # Memória permanente e regras editoriais
│   └── apolo.db                  # Banco de dados SQLite (criado em runtime)
├── public/
│   └── arts/                     # Ilustrações originais Paper Craft Amazônico
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/login/       # Endpoint de autenticação
│   │   │   ├── chat/             # Endpoint de diálogo com Apolo + Vertex AI
│   │   │   └── history/          # Histórico de conversas
│   │   ├── globals.css           # Design tokens e variáveis de papel
│   │   ├── layout.tsx            # Layout raiz
│   │   └── page.tsx              # Ponto de entrada (Login ou Chat)
│   ├── components/
│   │   ├── LoginCard/            # Card de Login + LoginCard.module.css
│   │   ├── Sidebar/              # Barra lateral + Sidebar.module.css
│   │   ├── MessageBubble/        # Balões de mensagem + MessageBubble.module.css
│   │   └── Chat/                 # Interface do chat + ChatInterface.module.css
│   ├── lib/
│   │   ├── db.ts                 # Camada de banco de dados SQLite nativo
│   │   └── apolo_agent.ts        # Integração do Apolo com Vertex AI e Memória
│   └── types/
│       └── sqlite.d.ts           # Tipagens adicionais
└── README.md
```
