export const hashValue = async (value) => {
  // crypto.subtle is only available in secure contexts (HTTPS or localhost)
  if (!window.crypto || !window.crypto.subtle) {
    console.warn("Crypto Subtle not available. Using fallback hash.");
    // Simple fallback hash for non-secure contexts (HTTP)
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(value);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
