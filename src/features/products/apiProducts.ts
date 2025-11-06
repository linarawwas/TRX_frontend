// src/features/products/apiProducts.ts
import axios from "axios";
import { API_BASE } from "../../config/api";

const BASE = process.env.REACT_APP_API_BASE_URL || API_BASE;

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
  const { data } = await axios.get(
    `${BASE}/api/products/company/${companyId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data as ProductResponse[];
}

export async function deleteProductById(token: string, productId: string) {
  await axios.delete(`${BASE}/api/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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
  const { data } = await axios.post(`${BASE}/api/products`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return data as ProductResponse;
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
  const { data } = await axios.put(`${BASE}/api/products/${productId}`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return data as ProductResponse;
}

