import Dexie, { type Table } from "dexie";

export interface ToolHistoryItem {
  id?: number;
  toolId: string;
  toolName: string;
  input: string;
  output?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface UserSetting {
  key: string;
  value: unknown;
  updatedAt: Date;
}

export interface SavedSnippet {
  id?: number;
  title: string;
  content: string;
  language: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class LadeToolsDatabase extends Dexie {
  history!: Table<ToolHistoryItem, number>;
  settings!: Table<UserSetting, string>;
  snippets!: Table<SavedSnippet, number>;

  constructor() {
    super("LadeToolsDB");
    this.version(1).stores({
      history: "++id, toolId, toolName, createdAt",
      settings: "&key, updatedAt",
      snippets: "++id, title, language, *tags, createdAt, updatedAt",
    });
  }
}

export const db = new LadeToolsDatabase();
