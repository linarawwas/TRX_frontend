import { runUnifiedRequest } from "../api/rtkRequest";

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
  const data = await runUnifiedRequest<ProductResponse[]>(
    {
      url: `/api/products/company/${companyId}`,
      token,
    },
    "Failed to list products"
  );
  return data as ProductResponse[];
}

export async function deleteProductById(token: string, productId: string) {
  await runUnifiedRequest(
    {
      url: `/api/products/${productId}`,
      method: "DELETE",
      token,
    },
    "Failed to delete product"
  );
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
  const data = await runUnifiedRequest(
    {
      url: "/api/products",
      method: "POST",
      token,
      body: payload,
    },
    "Failed to create product"
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
  const data = await runUnifiedRequest(
    {
      url: `/api/products/${productId}`,
      method: "PUT",
      token,
      body: payload,
    },
    "Failed to update product"
  );
  return data as ProductResponse;
}

