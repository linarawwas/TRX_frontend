import type { Dispatch } from "redux";
import {
  setCompanyId,
  setIsAdmin,
  setToken,
  setUsername,
  clearCompanyId,
  clearIsAdmin,
  clearToken,
  clearUsername,
} from "../../redux/UserInfo/action";

export interface StoredAuth {
  token: string | null;
  companyId: string | null;
  isAdmin: boolean;
  username: string | null;
}

const TOKEN_KEY = "token";
const COMPANY_ID_KEY = "companyId";
const IS_ADMIN_KEY = "isAdmin";
const USERNAME_KEY = "username";

function parseBoolean(raw: string | null): boolean {
  if (!raw) return false;
  try {
    return Boolean(JSON.parse(raw));
  } catch {
    return false;
  }
}

export function loadAuthFromStorage(): StoredAuth {
  const token = localStorage.getItem(TOKEN_KEY);
  const companyId = localStorage.getItem(COMPANY_ID_KEY);
  const username = localStorage.getItem(USERNAME_KEY);
  const isAdminRaw = localStorage.getItem(IS_ADMIN_KEY);
  const isAdmin = parseBoolean(isAdminRaw);

  return {
    token,
    companyId,
    isAdmin,
    username,
  };
}

export function hydrateAuthFromStorage(dispatch: Dispatch): StoredAuth {
  const auth = loadAuthFromStorage();

  // Keep Redux user slice in sync with localStorage
  dispatch(setToken(auth.token));
  dispatch(setIsAdmin(auth.isAdmin));
  dispatch(setCompanyId(auth.companyId));
  dispatch(setUsername(auth.username));

  return auth;
}

export function persistAuthToStorage(partial: Partial<StoredAuth>): void {
  if ("token" in partial) {
    if (partial.token) {
      localStorage.setItem(TOKEN_KEY, partial.token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  if ("companyId" in partial) {
    if (partial.companyId) {
      localStorage.setItem(COMPANY_ID_KEY, partial.companyId);
    } else {
      localStorage.removeItem(COMPANY_ID_KEY);
    }
  }

  if ("username" in partial) {
    if (partial.username) {
      localStorage.setItem(USERNAME_KEY, partial.username);
    } else {
      localStorage.removeItem(USERNAME_KEY);
    }
  }

  if ("isAdmin" in partial) {
    localStorage.setItem(IS_ADMIN_KEY, JSON.stringify(Boolean(partial.isAdmin)));
  }
}

export function clearAuth(dispatch: Dispatch): void {
  // Clear Redux user slice
  dispatch(clearToken());
  dispatch(clearCompanyId());
  dispatch(clearIsAdmin());
  dispatch(clearUsername());

  // Clear backing storage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(COMPANY_ID_KEY);
  localStorage.removeItem(IS_ADMIN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

