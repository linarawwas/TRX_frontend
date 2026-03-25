import { rtkJson, rtkVoid } from "../api/rtkTransport";

export interface ProductResponse {
  _id: string;
  type: string;
  priceInDollars: number;
  isReturnable: boolean;
  companyId: string;
}

export async function listCompanyProducts(
  token: string,
  companyId: string
): Promise<ProductResponse[]> {
  const data = await rtkJson<ProductResponse[]>(
    `/api/products/company/${companyId}`,
    { token }
  );
  return data;
}

export async function deleteProductById(token: string, productId: string) {
  await rtkVoid(`/api/products/${productId}`, { token, method: "DELETE" });
}

export interface CreateProductPayload {
  type: string;
  priceInDollars: number;
  isReturnable: boolean;
  companyId: string;
}

export async function createProduct(
  token: string,
  payload: CreateProductPayload
): Promise<ProductResponse> {
  const data = await rtkJson<ProductResponse>(
    "/api/products",
    { token, method: "POST", jsonBody: payload }
  );
  return data;
}

export interface UpdateProductPayload {
  type?: string;
  priceInDollars?: number;
  isReturnable?: boolean;
}

export async function updateProduct(
  token: string,
  productId: string,
  payload: UpdateProductPayload
): Promise<ProductResponse> {
  const data = await rtkJson<ProductResponse>(
    `/api/products/${productId}`,
    { token, method: "PUT", jsonBody: payload }
  );
  return data;
}

