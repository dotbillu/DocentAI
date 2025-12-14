import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
type Message = {
  role: "user" | "ai";
  content: string;
  sources?: string[];
};
export const chatHistoryAtom = atomWithStorage<Message[]>('docent-ai-chat-history', []);
export const crawlDepthAtom = atomWithStorage<number>('docent-ai-crawl-depth', 2);
export const isLinkModeAtom = atom(false);
