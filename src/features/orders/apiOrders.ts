// src/features/orders/apiOrders.ts
import axios from "axios";
import { API_BASE } from "../../config/api";

const BASE = process.env.REACT_APP_API_BASE_URL || API_BASE;

export interface Payment {
  date: string;
  amount: number;
  currency: string;
  exchangeRate: string;
  _id: string;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  areaId: string;
  address: string;
  __v: number;
  companyId: string;
}

export interface Product {
  _id: string;
  id: number;
  type: string;
  priceInDollars: number;
  isReturnable: boolean;
  companyId: string;
  __v: number;
}

export interface Order {
  _id: string;
  recordedBy: string;
  type?: number; // 1: Initial, 2: Normal, 3: External
  delivered: number;
  returned: number;
  customerId: string;
  payments: Payment[];
  productId: number;
  checkout: number;
  SumOfPaymentsInLiras: number;
  SumOfPaymentsInDollars: number;
  paid: number;
  paymentCurrency: string;
  exchangeRate: string;
  total: number;
  timestamp: string;
  companyId: string;
  shipmentId: string;
  __v: number;
  customer: Customer;
  product: Product;
}

export async function fetchOrdersByCompany(token: string, companyId: string): Promise<Order[]> {
  const { data } = await axios.get(`${BASE}/api/orders/company/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : [];
}

