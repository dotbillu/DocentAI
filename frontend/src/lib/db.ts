import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ChatDB extends DBSchema {
  chats: {
    key: string;
    value: {
      id: string;
      title: string;
      createdAt: Date;
    };
    indexes: { 'by-date': Date };
  };
  messages: {
    key: number;
    value: {
      chatId: string;
      role: 'user' | 'ai';
      content: string;
      sources?: string[];
      createdAt: Date;
    };
    indexes: { 'by-chat': string };
  };
}

// Lazy Singleton: Only initialize when needed and ONLY in the browser
let _dbPromise: Promise<IDBPDatabase<ChatDB>> | null = null;

function getDB() {
  if (typeof window === "undefined") return null; // Server guard

  if (!_dbPromise) {
    _dbPromise = openDB<ChatDB>('docent-ai-db', 1, {
      upgrade(db) {
        const chatStore = db.createObjectStore('chats', { keyPath: 'id' });
        chatStore.createIndex('by-date', 'createdAt');

        const msgStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        msgStore.createIndex('by-chat', 'chatId');
      },
    });
  }
  return _dbPromise;
}

export const db = {
  async createChat(id: string, title: string) {
    const database = await getDB();
    if (!database) return;
    return database.put('chats', { id, title, createdAt: new Date() });
  },
  
  async getChats() {
    const database = await getDB();
    if (!database) return [];
    return database.getAllFromIndex('chats', 'by-date');
  },
  
  async addMessage(chatId: string, message: any) {
    const database = await getDB();
    if (!database) return;
    return database.add('messages', { ...message, chatId, createdAt: new Date() });
  },
  
  async getMessages(chatId: string) {
    const database = await getDB();
    if (!database) return [];
    return database.getAllFromIndex('messages', 'by-chat', chatId);
  },
};
