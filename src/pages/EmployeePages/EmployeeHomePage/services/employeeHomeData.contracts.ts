/**
 * Interim contracts for data that will eventually flow through the DAL.
 *
 * Today:
 * - Shipment context is sourced from Redux (`state/employeeHomeState.ts`).
 * - Today / round KPIs are read inside shared snapshot widgets (Redux selectors).
 *
 * Future DAL: replace reads with async ports, e.g. `dal.shipment.getContext()`,
 * keeping adapter return shapes stable for the view model.
 */
export type ShipmentContextContract = {
  shipmentId: string;
  dayId: string;
};
