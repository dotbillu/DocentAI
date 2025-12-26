import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';


export type Message = {
  role: "user" | "ai";
  content: string;
  sources?: string[];
};

export const chatHistoryAtom = atomWithStorage<Message[]>('docent-ai-chat-history', []);
export const crawlDepthAtom = atomWithStorage<number>('docent-ai-crawl-depth', 2);
export const sidebarOpenAtom = atom(true);
export const isLinkModeAtom = atom(false);

// --- Personalization Types & Atoms ---
export interface AISettings {
  verbosity: "concise" | "balanced" | "detailed";
  strictMode: boolean; 
  theme: "blue" | "purple" | "emerald" | "orange";
}

export const aiSettingsAtom = atomWithStorage<AISettings>("docent_ai_settings", {
  verbosity: "balanced",
  strictMode: false,
  theme: "blue",
});