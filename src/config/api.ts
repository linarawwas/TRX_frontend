// Normalized API base without trailing slash
export const API_BASE = process.env.REACT_APP_API_BASE_URL|| ""

export function apiUrl(path: string): string {
  if (!path) return API_BASE ;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}
