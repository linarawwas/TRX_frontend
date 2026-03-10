import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  token: string | null;
  companyId: string;
  isAdmin: boolean;
  username: string;
}

export const initialState: UserState = {
  token: null,
  companyId: '',
  isAdmin: false,
  username: '',
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    setUsername(state, action: PayloadAction<string | null>) {
      state.username = action.payload || "";
    },
    setIsAdmin(state, action: PayloadAction<boolean>) {
      state.isAdmin = action.payload;
    },
    setCompanyId(state, action: PayloadAction<string | null>) {
      state.companyId = action.payload || "";
    },
    clearToken(state) {
      state.token = null;
    },
    clearIsAdmin(state) {
      state.isAdmin = false;
    },
    clearCompanyId(state) {
      state.companyId = "";
    },
    clearUsername(state) {
      state.username = "";
    },
  },
});

export default userSlice.reducer;

