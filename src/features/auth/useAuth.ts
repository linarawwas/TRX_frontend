import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Dispatch } from "redux";
import type { RootState } from "../../redux/store";
import { hydrateAuthFromStorage, clearAuth, StoredAuth } from "./authStorage";

export interface AuthState {
  token: string | null;
  companyId: string;
  isAdmin: boolean;
  username: string;
}

function selectAuthState(state: RootState): AuthState {
  return state.user;
}

export function useAuth() {
  const dispatch: Dispatch = useDispatch();
  const auth = useSelector(selectAuthState);

  const isAuthenticated = Boolean(auth.token);

  const bootstrapFromStorage = useCallback((): StoredAuth => {
    return hydrateAuthFromStorage(dispatch);
  }, [dispatch]);

  const logout = useCallback(() => {
    clearAuth(dispatch);
  }, [dispatch]);

  return {
    ...auth,
    isAuthenticated,
    bootstrapFromStorage,
    logout,
  };
}

