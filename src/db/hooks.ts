import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  type JsonHistoryItem,
  type Base64HistoryItem,
  type JwtHistoryItem,
  type RegexHistoryItem,
  type UuidHistoryItem,
  type HistoryTableName,
} from "./database";

const HISTORY_LIMIT = 20;

/**
 * Hook to retrieve the 20 most recent JSON Formatter history entries, sorted by createdAt descending
 */
export function useJsonHistory(): JsonHistoryItem[] | undefined {
  return useLiveQuery(
    () => db.jsonHistory.orderBy("createdAt").reverse().limit(HISTORY_LIMIT).toArray(),
    []
  );
}

/**
 * Hook to retrieve the 20 most recent Base64 history entries, sorted by createdAt descending
 */
export function useBase64History(): Base64HistoryItem[] | undefined {
  return useLiveQuery(
    () => db.base64History.orderBy("createdAt").reverse().limit(HISTORY_LIMIT).toArray(),
    []
  );
}

/**
 * Hook to retrieve the 20 most recent JWT Debugger history entries, sorted by createdAt descending
 */
export function useJwtHistory(): JwtHistoryItem[] | undefined {
  return useLiveQuery(
    () => db.jwtHistory.orderBy("createdAt").reverse().limit(HISTORY_LIMIT).toArray(),
    []
  );
}

/**
 * Hook to retrieve the 20 most recent Regex Tester history entries, sorted by createdAt descending
 */
export function useRegexHistory(): RegexHistoryItem[] | undefined {
  return useLiveQuery(
    () => db.regexHistory.orderBy("createdAt").reverse().limit(HISTORY_LIMIT).toArray(),
    []
  );
}

/**
 * Hook to retrieve the 20 most recent UUID/Timestamp Generator history entries, sorted by createdAt descending
 */
export function useUuidHistory(): UuidHistoryItem[] | undefined {
  return useLiveQuery(
    () => db.uuidHistory.orderBy("createdAt").reverse().limit(HISTORY_LIMIT).toArray(),
    []
  );
}

// ---------------------------------------------------------------------------
// Mutation Helpers for Tools
// ---------------------------------------------------------------------------

export async function addJsonHistory(input: string): Promise<number> {
  return db.jsonHistory.add({
    input,
    createdAt: new Date(),
  });
}

export async function addBase64History(
  input: string,
  output: string,
  mode: "encode" | "decode"
): Promise<number> {
  return db.base64History.add({
    input,
    output,
    mode,
    createdAt: new Date(),
  });
}

export async function addJwtHistory(token: string): Promise<number> {
  return db.jwtHistory.add({
    token,
    createdAt: new Date(),
  });
}

export async function addRegexHistory(
  pattern: string,
  flags: string,
  testString: string
): Promise<number> {
  return db.regexHistory.add({
    pattern,
    flags,
    testString,
    createdAt: new Date(),
  });
}

export async function addUuidHistory(
  value: string,
  type: "uuid" | "timestamp"
): Promise<number> {
  return db.uuidHistory.add({
    value,
    type,
    createdAt: new Date(),
  });
}

export async function deleteHistoryItem(
  tableName: HistoryTableName,
  id: number
): Promise<void> {
  await db[tableName].delete(id);
}
