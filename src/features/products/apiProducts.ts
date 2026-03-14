import axios from "axios";
import { authAxiosConfig, jsonAxiosConfig } from "../api/http";

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
    `/api/products/company/${companyId}`,
    authAxiosConfig(token)
  );
  return data as ProductResponse[];
}

export async function deleteProductById(token: string, productId: string) {
  await axios.delete(`/api/products/${productId}`, authAxiosConfig(token));
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
  const { data } = await axios.post(
    "/api/products",
    payload,
    jsonAxiosConfig(token)
  );
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
  const { data } = await axios.put(
    `/api/products/${productId}`,
    payload,
    jsonAxiosConfig(token)
  );
  return data as ProductResponse;
}

