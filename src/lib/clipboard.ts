/**
 * Copy text to clipboard using the Clipboard API with legacy execCommand fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text || typeof text !== "string") {
    return false;
  }

  // Modern navigator.clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("[Clipboard] navigator.clipboard failed, attempting fallback:", err);
    }
  }

  // Fallback using document.execCommand('copy')
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (!successful) {
      throw new Error("document.execCommand('copy') was unsuccessful");
    }

    return true;
  } catch (fallbackErr) {
    console.error("[Clipboard] Fallback copy failed:", fallbackErr);
    throw fallbackErr;
  }
}
