// src/features/products/apiProducts.ts
import axios from "axios";
import { API_BASE } from "../../config/api";

const BASE = process.env.REACT_APP_API_BASE_URL || API_BASE;

export async function listCompanyProducts(token: string, companyId: string) {
  const { data } = await axios.get(
    `${BASE}/api/products/company/${companyId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data as Array<{
    _id: string;
    type: string;
    priceInDollars: number;
    isReturnable: boolean;
    companyId: string;
  }>;
}

export async function deleteProductById(token: string, productId: string) {
  await axios.delete(`${BASE}/api/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

