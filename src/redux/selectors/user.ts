// src/redux/selectors/user.ts
import { RootState } from "../store";

export const selectUserToken = (s: RootState): string => s.user?.token || "";
export const selectUserCompanyId = (s: RootState): string => s.user?.companyId || "";
export const selectUserIsAdmin = (s: RootState): boolean => s.user?.isAdmin || false;
export const selectUsername = (s: RootState): string => s.user?.username || "";

export const selectUser = (s: RootState) => ({
  token: selectUserToken(s),
  companyId: selectUserCompanyId(s),
  isAdmin: selectUserIsAdmin(s),
  username: selectUsername(s),
});

