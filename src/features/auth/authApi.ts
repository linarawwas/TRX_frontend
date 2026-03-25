import type { Dispatch } from "redux";
import { runUnifiedRequest, UnifiedRequestError } from "../api/rtkRequest";
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
  let userData: MeResponse;
  try {
    userData = await runUnifiedRequest<MeResponse>(
      { url: "/api/users/me", token },
      "Failed to fetch /api/users/me"
    );
  } catch (error) {
    if (error instanceof UnifiedRequestError) {
      throw new Error(`Failed to fetch /api/users/me (${error.status})`);
    }
    throw error;
  }

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

