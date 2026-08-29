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

/**
 * Trim history table so it never exceeds HISTORY_LIMIT (20 records)
 */
async function trimHistoryTable(tableName: HistoryTableName, limit = HISTORY_LIMIT): Promise<void> {
  const count = await db[tableName].count();
  if (count > limit) {
    const excess = count - limit;
    const oldestKeys = await db[tableName].orderBy("createdAt").limit(excess).primaryKeys();
    await db[tableName].bulkDelete(oldestKeys);
  }
}

// ---------------------------------------------------------------------------
// Mutation Helpers for Tools (with deduplication & 20-item auto-trim)
// ---------------------------------------------------------------------------

export async function addJsonHistory(input: string): Promise<number> {
  const trimmed = input.trim();
  if (!trimmed) return 0;

  // Deduplicate consecutive identical entries
  const latest = await db.jsonHistory.orderBy("createdAt").last();
  if (latest && latest.input.trim() === trimmed) {
    return latest.id || 0;
  }

  const id = await db.jsonHistory.add({
    input: trimmed,
    createdAt: new Date(),
  });

  await trimHistoryTable("jsonHistory", HISTORY_LIMIT);
  return id;
}

export async function addBase64History(
  input: string,
  output: string,
  mode: "encode" | "decode"
): Promise<number> {
  const trimmedInput = input.trim();
  if (!trimmedInput) return 0;

  // Deduplicate consecutive identical entries
  const latest = await db.base64History.orderBy("createdAt").last();
  if (
    latest &&
    latest.input.trim() === trimmedInput &&
    latest.output === output &&
    latest.mode === mode
  ) {
    return latest.id || 0;
  }

  const id = await db.base64History.add({
    input: trimmedInput,
    output,
    mode,
    createdAt: new Date(),
  });

  await trimHistoryTable("base64History", HISTORY_LIMIT);
  return id;
}

export async function addJwtHistory(token: string): Promise<number> {
  const trimmed = token.trim();
  if (!trimmed) return 0;

  // Deduplicate consecutive identical entries
  const latest = await db.jwtHistory.orderBy("createdAt").last();
  if (latest && latest.token.trim() === trimmed) {
    return latest.id || 0;
  }

  const id = await db.jwtHistory.add({
    token: trimmed,
    createdAt: new Date(),
  });

  await trimHistoryTable("jwtHistory", HISTORY_LIMIT);
  return id;
}

export async function addRegexHistory(
  pattern: string,
  flags: string,
  testString: string
): Promise<number> {
  const trimmedPattern = pattern.trim();
  if (!trimmedPattern) return 0;

  // Deduplicate consecutive identical entries
  const latest = await db.regexHistory.orderBy("createdAt").last();
  if (
    latest &&
    latest.pattern.trim() === trimmedPattern &&
    latest.flags === flags &&
    latest.testString === testString
  ) {
    return latest.id || 0;
  }

  const id = await db.regexHistory.add({
    pattern: trimmedPattern,
    flags,
    testString,
    createdAt: new Date(),
  });

  await trimHistoryTable("regexHistory", HISTORY_LIMIT);
  return id;
}

export async function addUuidHistory(
  value: string,
  type: "uuid" | "timestamp"
): Promise<number> {
  const trimmed = value.trim();
  if (!trimmed) return 0;

  // Deduplicate consecutive identical entries
  const latest = await db.uuidHistory.orderBy("createdAt").last();
  if (latest && latest.value.trim() === trimmed && latest.type === type) {
    return latest.id || 0;
  }

  const id = await db.uuidHistory.add({
    value: trimmed,
    type,
    createdAt: new Date(),
  });

  await trimHistoryTable("uuidHistory", HISTORY_LIMIT);
  return id;
}

export async function deleteHistoryItem(
  tableName: HistoryTableName,
  id: number
): Promise<void> {
  await db[tableName].delete(id);
}

