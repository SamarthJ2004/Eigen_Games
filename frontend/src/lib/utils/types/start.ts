export interface APIMessage {
  text: string;
  type: string;
}

export interface APIContext {
  debateId: string;
  lastCharacter: Character | null;
  characters: Character[];
  timeRemaining: number;
  status: "active" | "completed";
}

export interface APIResponse {
  messages: APIMessage[];
  context: APIContext;
}

export interface Message {
  id: number;
  character: Character;
  content: string;
  timestamp: string;
}

export type Character = "musk" | "tate" | "trump" | "modi";
