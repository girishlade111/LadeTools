import { base64ToUtf8 } from "./base64";

export interface JwtClaimInfo {
  key: string;
  label: string;
  description: string;
  rawValue: unknown;
  formattedValue?: string;
  status?: "valid" | "expired" | "future" | "info";
  statusText?: string;
}

export interface DecodedJwtResult {
  header: Record<string, unknown>;
  headerJson: string;
  payload: Record<string, unknown>;
  payloadJson: string;
  signature: string;
  rawHeader: string;
  rawPayload: string;
  rawSignature: string;
  claims: {
    exp?: {
      timestamp: number;
      dateFormatted: string;
      relative: string;
      isExpired: boolean;
    };
    iat?: {
      timestamp: number;
      dateFormatted: string;
      relative: string;
    };
    nbf?: {
      timestamp: number;
      dateFormatted: string;
      relative: string;
      isFuture: boolean;
    };
    sub?: string;
    iss?: string;
    aud?: string | string[];
    jti?: string;
  };
  highlightedClaims: JwtClaimInfo[];
  algorithm?: string;
  tokenType?: string;
}

/**
 * Decode a base64url encoded string with proper UTF-8 handling
 */
export function base64UrlDecode(str: string): string {
  if (!str) return "";
  // Base64URL to standard Base64: - -> +, _ -> /
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLength);
  return base64ToUtf8(padded);
}

/**
 * Format a Unix timestamp (in seconds or milliseconds) to a human-readable date
 */
export function formatUnixTimestamp(timestamp: number): {
  dateFormatted: string;
  relative: string;
  isPast: boolean;
} {
  // If timestamp is in seconds (< 10000000000), convert to ms
  const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  const date = new Date(ms);
  const now = Date.now();

  if (isNaN(date.getTime())) {
    return {
      dateFormatted: "Invalid Date",
      relative: "Invalid timestamp",
      isPast: false,
    };
  }

  const dateFormatted = date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  const diffMs = ms - now;
  const diffSeconds = Math.round(Math.abs(diffMs) / 1000);
  const isPast = diffMs < 0;

  let relative = "";
  if (diffSeconds < 60) {
    relative = isPast ? `${diffSeconds}s ago` : `in ${diffSeconds}s`;
  } else if (diffSeconds < 3600) {
    const mins = Math.floor(diffSeconds / 60);
    relative = isPast ? `${mins}m ago` : `in ${mins}m`;
  } else if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    relative = isPast ? `${hours}h ago` : `in ${hours}h`;
  } else {
    const days = Math.floor(diffSeconds / 86400);
    relative = isPast ? `${days}d ago` : `in ${days}d`;
  }

  return {
    dateFormatted,
    relative,
    isPast,
  };
}

/**
 * Parse and decode a complete 3-part JSON Web Token string
 */
export function decodeJwt(token: string): DecodedJwtResult {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error("JWT token cannot be empty.");
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    throw new Error(
      `Invalid JWT structure: A valid JWT must have 3 dot-separated parts (Header.Payload.Signature). Found ${parts.length} part(s).`
    );
  }

  const [rawHeader, rawPayload, rawSignature] = parts;

  // 1. Decode Header
  let header: Record<string, unknown>;
  try {
    const decodedHeaderStr = base64UrlDecode(rawHeader);
    header = JSON.parse(decodedHeaderStr);
    if (typeof header !== "object" || header === null) {
      throw new Error("Decoded header is not a valid JSON object.");
    }
  } catch (err: unknown) {
    throw new Error(
      `Failed to decode JWT Header: ${(err as Error).message || "Invalid base64url or JSON format"}`
    );
  }

  // 2. Decode Payload
  let payload: Record<string, unknown>;
  try {
    const decodedPayloadStr = base64UrlDecode(rawPayload);
    payload = JSON.parse(decodedPayloadStr);
    if (typeof payload !== "object" || payload === null) {
      throw new Error("Decoded payload is not a valid JSON object.");
    }
  } catch (err: unknown) {
    throw new Error(
      `Failed to decode JWT Payload: ${(err as Error).message || "Invalid base64url or JSON format"}`
    );
  }

  const headerJson = JSON.stringify(header, null, 2);
  const payloadJson = JSON.stringify(payload, null, 2);

  // 3. Extract and analyze standard JWT claims
  const claims: DecodedJwtResult["claims"] = {};
  const highlightedClaims: JwtClaimInfo[] = [];

  // exp (Expiration Time)
  if (typeof payload.exp === "number") {
    const { dateFormatted, relative, isPast } = formatUnixTimestamp(payload.exp);
    claims.exp = {
      timestamp: payload.exp,
      dateFormatted,
      relative,
      isExpired: isPast,
    };
    highlightedClaims.push({
      key: "exp",
      label: "Expiration Time",
      description: "Identifies the expiration time on or after which the JWT MUST NOT be accepted.",
      rawValue: payload.exp,
      formattedValue: dateFormatted,
      status: isPast ? "expired" : "valid",
      statusText: isPast ? `Expired (${relative})` : `Valid until ${dateFormatted} (${relative})`,
    });
  }

  // iat (Issued At)
  if (typeof payload.iat === "number") {
    const { dateFormatted, relative } = formatUnixTimestamp(payload.iat);
    claims.iat = {
      timestamp: payload.iat,
      dateFormatted,
      relative,
    };
    highlightedClaims.push({
      key: "iat",
      label: "Issued At",
      description: "Identifies the time at which the JWT was issued.",
      rawValue: payload.iat,
      formattedValue: dateFormatted,
      status: "info",
      statusText: `Issued ${relative} (${dateFormatted})`,
    });
  }

  // nbf (Not Before)
  if (typeof payload.nbf === "number") {
    const { dateFormatted, relative, isPast } = formatUnixTimestamp(payload.nbf);
    const isFuture = !isPast;
    claims.nbf = {
      timestamp: payload.nbf,
      dateFormatted,
      relative,
      isFuture,
    };
    highlightedClaims.push({
      key: "nbf",
      label: "Not Before",
      description: "Identifies the time before which the JWT MUST NOT be accepted for processing.",
      rawValue: payload.nbf,
      formattedValue: dateFormatted,
      status: isFuture ? "future" : "valid",
      statusText: isFuture ? `Not yet valid (active in ${relative})` : `Active since ${dateFormatted}`,
    });
  }

  // sub (Subject)
  if (payload.sub !== undefined) {
    claims.sub = String(payload.sub);
    highlightedClaims.push({
      key: "sub",
      label: "Subject",
      description: "Identifies the principal that is the subject of the JWT.",
      rawValue: payload.sub,
      formattedValue: String(payload.sub),
      status: "info",
    });
  }

  // iss (Issuer)
  if (payload.iss !== undefined) {
    claims.iss = String(payload.iss);
    highlightedClaims.push({
      key: "iss",
      label: "Issuer",
      description: "Identifies the principal that issued the JWT.",
      rawValue: payload.iss,
      formattedValue: String(payload.iss),
      status: "info",
    });
  }

  // aud (Audience)
  if (payload.aud !== undefined) {
    claims.aud = Array.isArray(payload.aud)
      ? (payload.aud as string[])
      : String(payload.aud);
    highlightedClaims.push({
      key: "aud",
      label: "Audience",
      description: "Identifies the recipients that the JWT is intended for.",
      rawValue: payload.aud,
      formattedValue: Array.isArray(payload.aud) ? payload.aud.join(", ") : String(payload.aud),
      status: "info",
    });
  }

  // jti (JWT ID)
  if (payload.jti !== undefined) {
    claims.jti = String(payload.jti);
    highlightedClaims.push({
      key: "jti",
      label: "JWT ID",
      description: "Provides a unique identifier for the JWT.",
      rawValue: payload.jti,
      formattedValue: String(payload.jti),
      status: "info",
    });
  }

  return {
    header,
    headerJson,
    payload,
    payloadJson,
    signature: rawSignature,
    rawHeader,
    rawPayload,
    rawSignature,
    claims,
    highlightedClaims,
    algorithm: typeof header.alg === "string" ? header.alg : undefined,
    tokenType: typeof header.typ === "string" ? header.typ : undefined,
  };
}

/**
 * Generate a realistic sample JWT with a valid future expiration date
 */
export function generateSampleJwt(isExpired = false): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const nowSeconds = Math.floor(Date.now() / 1000);
  const expSeconds = isExpired ? nowSeconds - 3600 * 24 : nowSeconds + 3600 * 24 * 7; // -1 day or +7 days

  const payload = {
    sub: "usr_94a82b4c10e",
    name: "Alex Dev",
    email: "alex.dev@ladetools.dev",
    role: "admin",
    permissions: ["read:tools", "write:tools", "admin:all"],
    iss: "https://auth.ladetools.dev/",
    aud: "https://api.ladetools.dev/v1",
    iat: nowSeconds - 3600 * 2, // issued 2 hours ago
    exp: expSeconds,
  };

  function utf8ToBase64Url(obj: object): string {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    const binString = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
    return btoa(binString).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  const encodedHeader = utf8ToBase64Url(header);
  const encodedPayload = utf8ToBase64Url(payload);
  const sampleSignature = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

  return `${encodedHeader}.${encodedPayload}.${sampleSignature}`;
}
