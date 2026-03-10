import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DefaultsState {
  default_product: string;
  default_language: string;
}

export const initialState: DefaultsState = {
  default_product: "",
  default_language: "en",
};

export const defaultsSlice = createSlice({
  name: "defaults",
  initialState,
  reducers: {
    setDefaultProduct(state, action: PayloadAction<string>) {
      state.default_product = action.payload;
    },
    setDefaultLanguage(state, action: PayloadAction<string>) {
      state.default_language = action.payload;
    },
  },
});

export default defaultsSlice.reducer;

