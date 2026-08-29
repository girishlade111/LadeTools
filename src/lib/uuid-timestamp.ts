export interface TimestampFormatsResult {
  date: Date;
  unixSeconds: number;
  unixMilliseconds: number;
  iso8601: string;
  rfc2822: string;
  utcReadable: string;
  localReadable: string;
  relative: string;
  timezone: string;
  dayOfWeek: string;
  isPast: boolean;
}

export interface UuidOptions {
  uppercase?: boolean;
  hyphens?: boolean;
}

/**
 * Generate a cryptographically secure UUID v4 string
 */
export function generateUuidV4(options: UuidOptions = {}): string {
  let uuid: string;

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    uuid = crypto.randomUUID();
  } else {
    // Fallback using crypto.getRandomValues
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Set version to 0100 (4)
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Set variant to 10xx (RFC4122)
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  if (options.hyphens === false) {
    uuid = uuid.replace(/-/g, "");
  }

  if (options.uppercase) {
    uuid = uuid.toUpperCase();
  } else {
    uuid = uuid.toLowerCase();
  }

  return uuid;
}

/**
 * Generate multiple UUID v4 strings
 */
export function generateMultipleUuids(count: number, options: UuidOptions = {}): string[] {
  const safeCount = Math.max(1, Math.min(count, 100));
  return Array.from({ length: safeCount }, () => generateUuidV4(options));
}

/**
 * Validate UUID string format
 */
export function validateUuid(uuid: string): { isValid: boolean; version?: number; variant?: string } {
  const clean = uuid.trim();
  // Standard with hyphens
  const standardRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-5])[0-9a-f]{3}-([89ab])[0-9a-f]{3}-[0-9a-f]{12}$/i;
  // Compact 32 hex chars without hyphens
  const compactRegex = /^[0-9a-f]{12}([1-5])[0-9a-f]{3}([89ab])[0-9a-f]{15}$/i;

  const matchStandard = standardRegex.exec(clean);
  if (matchStandard) {
    return {
      isValid: true,
      version: parseInt(matchStandard[1], 10),
      variant: "RFC 4122 (DCE 1.1)",
    };
  }

  const matchCompact = compactRegex.exec(clean);
  if (matchCompact) {
    return {
      isValid: true,
      version: parseInt(matchCompact[1], 10),
      variant: "RFC 4122 (Compact / No Hyphens)",
    };
  }

  return { isValid: false };
}

/**
 * Format a Date object into a comprehensive TimestampFormatsResult
 */
export function formatTimestampResult(date: Date): TimestampFormatsResult {
  const ms = date.getTime();
  const unixSeconds = Math.floor(ms / 1000);
  const now = Date.now();
  const diffMs = ms - now;
  const diffSec = Math.round(Math.abs(diffMs) / 1000);
  const isPast = diffMs < 0;

  let relative = "";
  if (diffSec < 5) {
    relative = "Just now";
  } else if (diffSec < 60) {
    relative = isPast ? `${diffSec}s ago` : `in ${diffSec}s`;
  } else if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    relative = isPast ? `${mins}m ago` : `in ${mins}m`;
  } else if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    relative = isPast ? `${hours}h ago` : `in ${hours}h`;
  } else {
    const days = Math.floor(diffSec / 86400);
    relative = isPast ? `${days}d ago` : `in ${days}d`;
  }

  let timezone = "UTC";
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    //
  }

  const dayOfWeek = date.toLocaleDateString(undefined, { weekday: "long" });

  const localReadable = date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  const utcReadable = date.toUTCString();

  return {
    date,
    unixSeconds,
    unixMilliseconds: ms,
    iso8601: date.toISOString(),
    rfc2822: date.toUTCString(),
    utcReadable,
    localReadable,
    relative,
    timezone,
    dayOfWeek,
    isPast,
  };
}

/**
 * Parse Unix timestamp string or number with auto-detection of seconds vs milliseconds
 */
export function parseUnixTimestampInput(input: string | number): {
  result: TimestampFormatsResult | null;
  detectedUnit: "seconds" | "milliseconds" | null;
  error?: string;
} {
  const str = String(input).trim();
  if (!str) {
    return { result: null, detectedUnit: null };
  }

  // Check if numeric
  if (!/^-?\d+$/.test(str)) {
    // Try parsing as ISO / date string
    const parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime())) {
      return {
        result: formatTimestampResult(parsedDate),
        detectedUnit: "milliseconds",
      };
    }
    return {
      result: null,
      detectedUnit: null,
      error: "Invalid timestamp: Input must be a numeric Unix timestamp or valid ISO date.",
    };
  }

  const num = Number(str);
  if (isNaN(num)) {
    return {
      result: null,
      detectedUnit: null,
      error: "Invalid numeric timestamp.",
    };
  }

  // Auto-detection logic:
  // Timestamps in seconds around 1970-2100 are between ~0 and 4.1e9 (10 digits or less).
  // Timestamps in milliseconds are >= 1e11 (13 digits).
  const isSeconds = Math.abs(num) < 100000000000;
  const ms = isSeconds ? num * 1000 : num;
  const date = new Date(ms);

  if (isNaN(date.getTime())) {
    return {
      result: null,
      detectedUnit: null,
      error: "Timestamp out of range.",
    };
  }

  return {
    result: formatTimestampResult(date),
    detectedUnit: isSeconds ? "seconds" : "milliseconds",
  };
}

/**
 * Convert a Date object to YYYY-MM-DDTHH:mm:ss for <input type="datetime-local">
 */
export function dateToDatetimeLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
