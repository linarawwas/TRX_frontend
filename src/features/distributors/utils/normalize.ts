type ListShape<T> = {
  distributors?: T[];
  items?: T[];
  data?: T[];
};

export function normalizeListResponse<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === "object") {
    const payload = json as ListShape<T>;
    if (Array.isArray(payload.distributors)) return payload.distributors;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.data)) return payload.data;
  }
  return [];
}

