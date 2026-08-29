import Dexie, { type Table } from "dexie";

export interface JsonHistoryItem {
  id?: number;
  input: string;
  createdAt: Date;
}

export interface Base64HistoryItem {
  id?: number;
  input: string;
  output: string;
  mode: "encode" | "decode";
  createdAt: Date;
}

export interface JwtHistoryItem {
  id?: number;
  token: string;
  createdAt: Date;
}

export interface RegexHistoryItem {
  id?: number;
  pattern: string;
  flags: string;
  testString: string;
  createdAt: Date;
}

export interface UuidHistoryItem {
  id?: number;
  value: string;
  type: "uuid" | "timestamp";
  createdAt: Date;
}

export type HistoryTableName =
  | "jsonHistory"
  | "base64History"
  | "jwtHistory"
  | "regexHistory"
  | "uuidHistory";

export class LadeToolsDB extends Dexie {
  jsonHistory!: Table<JsonHistoryItem, number>;
  base64History!: Table<Base64HistoryItem, number>;
  jwtHistory!: Table<JwtHistoryItem, number>;
  regexHistory!: Table<RegexHistoryItem, number>;
  uuidHistory!: Table<UuidHistoryItem, number>;

  constructor() {
    super("LadeToolsDB");
    this.version(1).stores({
      jsonHistory: "++id, createdAt",
      base64History: "++id, mode, createdAt",
      jwtHistory: "++id, createdAt",
      regexHistory: "++id, pattern, createdAt",
      uuidHistory: "++id, type, createdAt",
    });
  }
}

export const db = new LadeToolsDB();

/**
 * Clear all records from a specified history table
 */
export async function clearHistory(tableName: HistoryTableName): Promise<void> {
  if (db[tableName]) {
    await db[tableName].clear();
  } else {
    throw new Error(`Table "${tableName}" does not exist in LadeToolsDB.`);
  }
}

/**
 * Clear all history tables across all tools
 */
export async function clearAllHistory(): Promise<void> {
  await Promise.all([
    db.jsonHistory.clear(),
    db.base64History.clear(),
    db.jwtHistory.clear(),
    db.regexHistory.clear(),
    db.uuidHistory.clear(),
  ]);
}

// Expose on window for easy developer inspection and debugging in browser console
if (typeof window !== "undefined") {
  // @ts-expect-error adding db helper to window for console testing
  window.ladeToolsDB = db;
  // @ts-expect-error adding clearHistory helper to window
  window.clearHistory = clearHistory;
}
