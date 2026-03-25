import type { Dispatch } from "redux";
import { rtkResult, type ApiResult } from "../api/rtkTransport";
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
): Promise<ApiResult<MeResponse>> {
  const result = await rtkResult<MeResponse>("/api/users/me", {
    token,
    fallbackMessage: "Failed to fetch /api/users/me",
  });
  if (!result.data) {
    return result;
  }

  // Persist to storage
  persistAuthToStorage({
    companyId: result.data.companyId,
    isAdmin: result.data.isAdmin,
    username: result.data.name,
  });

  // Dispatch to Redux
  dispatch(setCompanyId(result.data.companyId));
  dispatch(setIsAdmin(result.data.isAdmin));
  dispatch(setUsername(result.data.name));

  return result;
}

