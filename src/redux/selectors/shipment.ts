// redux/selectors/shipment.ts
export const selectShipment = (s: any) => s.shipment || {};
export const selectRound    = (s: any) => (s.shipment && s.shipment.round) || {};

export function selectRoundProgress(s: any) {
  const ship = selectShipment(s);
  const rnd  = selectRound(s);

  const targetRound = Number(rnd.targetAdded || 0);

  const baseDelivered = Number(rnd.baseDelivered ?? ship.delivered ?? 0);
  const baseReturned  = Number(rnd.baseReturned  ?? ship.returned  ?? 0);
  const baseUsd       = Number(rnd.baseUsd       ?? ship.dollarPayments ?? 0);
  const baseLbp       = Number(rnd.baseLbp       ?? ship.liraPayments   ?? 0);
  const baseExpUsd    = Number(rnd.baseExpUsd    ?? ship.expensesInUSD  ?? 0);
  const baseExpLbp    = Number(rnd.baseExpLbp    ?? ship.expensesInLiras?? 0);
  const baseProfUsd   = Number(rnd.baseProfUsd   ?? ship.profitsInUSD   ?? 0);
  const baseProfLbp   = Number(rnd.baseProfLbp   ?? ship.profitsInLiras ?? 0);

  const deliveredDay = Number(ship.delivered || 0);
  const returnedDay  = Number(ship.returned  || 0);
  const paidUsdDay   = Number(ship.dollarPayments || 0);
  const paidLbpDay   = Number(ship.liraPayments   || 0);
  const expUsdDay    = Number(ship.expensesInUSD  || 0);
  const expLbpDay    = Number(ship.expensesInLiras|| 0);
  const profUsdDay   = Number(ship.profitsInUSD   || 0);
  const profLbpDay   = Number(ship.profitsInLiras || 0);

  // deltas = "this round only"
  const deliveredThisRound = Math.max(0, deliveredDay - baseDelivered);
  const returnedThisRound  = Math.max(0, returnedDay  - baseReturned);
  const usdThisRound       = Math.max(0, paidUsdDay   - baseUsd);
  const lbpThisRound       = Math.max(0, paidLbpDay   - baseLbp);
  const expUsdThisRound    = Math.max(0, expUsdDay    - baseExpUsd);
  const expLbpThisRound    = Math.max(0, expLbpDay    - baseExpLbp);
  const profUsdThisRound   = Math.max(0, profUsdDay   - baseProfUsd);
  const profLbpThisRound   = Math.max(0, profLbpDay   - baseProfLbp);

  const remainingRound = Math.max(0, targetRound - deliveredThisRound);

  return {
    sequence: rnd.sequence ?? null,
    targetRound,
    deliveredThisRound,
    returnedThisRound,
    usdThisRound,
    lbpThisRound,
    expUsdThisRound,
    expLbpThisRound,
    profUsdThisRound,
    profLbpThisRound,
    remainingRound,
  };
}
