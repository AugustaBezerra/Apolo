import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "apolo.db");

// Garante que a pasta data/ existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initDatabase(dbInstance);
  }
  return dbInstance;
}

function initDatabase(db: DatabaseSync) {
  // 1. Tabela de Usuários (Controle de acesso da Karine)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'creator',
      created_at TEXT NOT NULL
    );
  `);

  // 2. Tabela de Conversas
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Tabela de Mensagens do Chat
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );
  `);

  // 4. Seed da Karine (Acesso Oficial)
  const checkKarine = db.prepare("SELECT id FROM users WHERE username = ?");
  const existe = checkKarine.get("karine");

  if (!existe) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("Apolo2026!", salt);
    const insertUser = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertUser.run(
      "user_karine_01",
      "karine",
      "cr.equipe02@gmail.com",
      hash,
      "Karine",
      "creator",
      new Date().toISOString()
    );
    console.log("✅ [DB] Usuário da Karine inicializado com sucesso (karine / Apolo2026!).");
  }
}

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: string;
}

export interface ConversationRecord {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export function findUserByIdentifier(identifier: string): UserRecord | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM users 
    WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
  `);
  const user = stmt.get(identifier.trim(), identifier.trim()) as any;
  return user || null;
}

export function listUserConversations(userId: string): ConversationRecord[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM conversations 
    WHERE user_id = ? 
    ORDER BY updated_at DESC
  `);
  return stmt.all(userId) as any[];
}

export function createNewConversation(userId: string, title: string = "Nova Conversa"): ConversationRecord {
  const db = getDb();
  const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO conversations (id, user_id, title, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, title, now, now);
  return { id, user_id: userId, title, created_at: now, updated_at: now };
}

export function getConversationMessages(conversationId: string): MessageRecord[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ? 
    ORDER BY created_at ASC
  `);
  return stmt.all(conversationId) as any[];
}

export function saveMessage(conversationId: string, role: "user" | "assistant", content: string): MessageRecord {
  const db = getDb();
  const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO messages (id, conversation_id, role, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, conversationId, role, content, now);

  // Atualiza timestamp da conversa
  const updateConv = db.prepare(`
    UPDATE conversations SET updated_at = ? WHERE id = ?
  `);
  updateConv.run(now, conversationId);

  return { id, conversation_id: conversationId, role, content, created_at: now };
}

export function updateConversationTitle(conversationId: string, title: string) {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?
  `);
  stmt.run(title, new Date().toISOString(), conversationId);
}
