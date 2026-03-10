// Normalized API base without trailing slash.
// When the app runs on localhost (any port), always use the local backend so cached/production
// bundles never send requests to the remote API.
function getApiBase(): string {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return (
    process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:5000"
  );
}

const rawBase = getApiBase();
export const API_BASE = rawBase.replace(/\/+$/, "");

export function apiUrl(path: string): string {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}
