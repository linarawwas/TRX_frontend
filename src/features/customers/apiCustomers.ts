// src/features/customers/apiCustomers.ts
import axios from "axios";
import { API_BASE } from "../../config/api";

export interface Customer {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  sequence?: number | null;
  isActive?: boolean;
}

export interface CustomersResponse {
  active: Customer[];
  inactive: Customer[];
}

export async function fetchCustomersByCompany(token: string): Promise<CustomersResponse> {
  const { data } = await axios.get(`${API_BASE}/api/customers/company`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    active: Array.isArray(data?.active) ? data.active : [],
    inactive: Array.isArray(data?.inactive) ? data.inactive : [],
  };
}

