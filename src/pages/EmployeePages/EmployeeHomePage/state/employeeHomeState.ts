import type { RootState } from "../../../../redux/store";
import { selectShipmentMeta } from "../../../../redux/selectors/shipment";

/**
 * Redux bindings for Employee Home. Keeps selector wiring out of UI components.
 */
export function selectEmployeeHomeUsername(state: RootState): string {
  return state.user.username ?? "";
}

export const selectEmployeeHomeShipmentContext = selectShipmentMeta;
