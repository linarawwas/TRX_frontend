export function normalizeListResponse(json: any) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.distributors)) return json.distributors;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

