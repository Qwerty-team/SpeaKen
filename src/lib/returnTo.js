export function safeReturnTo() {
  try {
    const value = new URLSearchParams(window.location.search).get("returnTo");
    if (!value) return "/";
    if (!value.startsWith("/") || value.startsWith("//")) return "/";
    return value;
  } catch {
    return "/";
  }
}
