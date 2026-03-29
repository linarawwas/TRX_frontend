import type { RootState } from "../../../../redux/store";
import { selectUserToken } from "../../../../redux/selectors/user";

/**
 * Redux bindings for the customers list page.
 */
export function selectCustomersPageToken(state: RootState): string {
  return selectUserToken(state) ?? "";
}
