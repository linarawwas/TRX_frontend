import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OrderState {
  area_Id: string | null;
  customer_Id: string | null;
  customer_name: string;
  phone: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
}

export const initialState: OrderState = {
  area_Id: null,
  customer_Id: null,
  customer_name: "",
  phone: "",
  product_id: null,
  product_name: "",
  product_price: 0,
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setAreaId(state, action: PayloadAction<string>) {
      state.area_Id = action.payload;
    },
    setProductPrice(state, action: PayloadAction<number>) {
      state.product_price = action.payload;
    },
    setCustomerId(state, action: PayloadAction<string>) {
      state.customer_Id = action.payload;
    },
    setCustomerName(state, action: PayloadAction<string>) {
      state.customer_name = action.payload;
    },
    setCustomerPhoneNb(state, action: PayloadAction<string>) {
      state.phone = action.payload;
    },
    setProductId(state, action: PayloadAction<string>) {
      state.product_id = action.payload;
    },
    setProductName(state, action: PayloadAction<string>) {
      state.product_name = action.payload;
    },
    clearAreaId(state) {
      state.area_Id = null;
    },
    clearCustomerId(state) {
      state.customer_Id = null;
    },
    clearCustomerName(state) {
      state.customer_name = "";
    },
    clearCustomerPhoneNb(state) {
      state.phone = "";
    },
    clearProductId(state) {
      state.product_id = null;
    },
    clearProductName(state) {
      state.product_name = "";
    },
    clearProductPrice(state) {
      state.product_price = 0;
    },
  },
});

export default orderSlice.reducer;

