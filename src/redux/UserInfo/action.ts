// action.ts
// Backwards-compatible re-exports of the Redux Toolkit slice actions.

import { userSlice } from "./reducer";

export const {
  setToken,
  setIsAdmin,
  setUsername,
  setCompanyId,
  clearToken,
  clearCompanyId,
  clearIsAdmin,
  clearUsername,
} = userSlice.actions;

