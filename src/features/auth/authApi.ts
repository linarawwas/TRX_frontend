import type { Dispatch } from "redux";
import { API_BASE } from "../../config/api";
import { setCompanyId, setIsAdmin, setUsername } from "../../redux/UserInfo/action";
import { persistAuthToStorage } from "./authStorage";

export interface MeResponse {
  companyId: string;
  isAdmin: boolean;
  name: string;
}

export async function fetchMeAndSync(
  token: string,
  dispatch: Dispatch
): Promise<MeResponse> {
  const response = await fetch(`${API_BASE}/api/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch /api/users/me (${response.status})`);
  }

  const userData: MeResponse = await response.json();

  // Persist to storage
  persistAuthToStorage({
    companyId: userData.companyId,
    isAdmin: userData.isAdmin,
    username: userData.name,
  });

  // Dispatch to Redux
  dispatch(setCompanyId(userData.companyId));
  dispatch(setIsAdmin(userData.isAdmin));
  dispatch(setUsername(userData.name));

  return userData;
}

