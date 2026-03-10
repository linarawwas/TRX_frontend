// src/redux/selectors/user.ts
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const selectUserToken = (s: RootState): string => s.user?.token || "";
export const selectUserCompanyId = (s: RootState): string => s.user?.companyId || "";
export const selectUserIsAdmin = (s: RootState): boolean => s.user?.isAdmin || false;
export const selectUsername = (s: RootState): string => s.user?.username || "";

export const selectUser = createSelector(
  [selectUserToken, selectUserCompanyId, selectUserIsAdmin, selectUsername],
  (token, companyId, isAdmin, username) => ({ token, companyId, isAdmin, username })
);

