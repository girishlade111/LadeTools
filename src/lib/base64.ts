/**
 * Robust Base64 UTF-8 encoding supporting emojis and all Unicode characters
 */
export function utf8ToBase64(str: string): string {
  if (!str) return "";
  try {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString);
  } catch {
    // Fallback using encodeURIComponent + unescape
    return btoa(unescape(encodeURIComponent(str)));
  }
}

/**
 * Robust Base64 UTF-8 decoding supporting emojis and all Unicode characters
 */
export function base64ToUtf8(base64Str: string): string {
  if (!base64Str) return "";
  // Strip whitespace/newlines
  const cleanBase64 = base64Str.trim().replace(/\s+/g, "");

  // Validate Base64 pattern (allowing standard + and / as well as URL-safe - and _)
  const normalized = cleanBase64.replace(/-/g, "+").replace(/_/g, "/");

  // Check padding
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(padded)) {
    throw new Error("Invalid Base64 string: Contains invalid characters or format.");
  }

  try {
    const binString = atob(padded);
    const bytes = Uint8Array.from(binString, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (err: unknown) {
    try {
      const binString = atob(padded);
      return decodeURIComponent(escape(binString));
    } catch {
      throw new Error(
        (err as Error)?.message?.includes("Invalid")
          ? (err as Error).message
          : "Invalid Base64 string: Malformed character sequence or invalid encoding."
      );
    }
  }
}

/**
 * Convert a File or Blob into a Base64 Data URL and raw Base64 string
 */
export async function fileToBase64(
  file: File
): Promise<{ dataUrl: string; rawBase64: string; mimeType: string; sizeBytes: number; name: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const commaIndex = dataUrl.indexOf(",");
      const rawBase64 = commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;
      resolve({
        dataUrl,
        rawBase64,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        name: file.name,
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
