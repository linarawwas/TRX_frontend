import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./TodaySnapshot.css";
import { selectRoundProgress } from "../../../redux/selectors/shipment";
import { computeProgress, formatMoneyPair } from "../../../features/shipments/utils/progress";
import ProgressSnapshot from "../../snapshots/ProgressSnapshot";
import { t } from "../../../utils/i18n";

const RoundSnapshot: React.FC = () => {
  const [open, setOpen] = useState(true);

  const {
    sequence,
    targetRound,
    deliveredThisRound,
    returnedThisRound,
    usdThisRound,
    lbpThisRound,
    expUsdThisRound,
    expLbpThisRound,
    profUsdThisRound,
    profLbpThisRound,
  } = useSelector(selectRoundProgress);

  // Empty state: no active round or no target for this round
  if (!sequence || targetRound <= 0) return null;

  const { pctForBar, pctDisplay, overBy, reached } = computeProgress(deliveredThisRound, targetRound);
  const moneyRound = formatMoneyPair(usdThisRound, lbpThisRound);
  const moneyExpRound = formatMoneyPair(expUsdThisRound, expLbpThisRound);
  const moneyProfRound = formatMoneyPair(profUsdThisRound, profLbpThisRound);

  const extraFoot = reached ? (
    <div className="target-lock">
      <span className="lock-emoji" aria-hidden>
        🔒
      </span>
      <div>
        {t("emp.round.targetLock")}
      </div>
    </div>
  ) : undefined;

  return (
    <ProgressSnapshot
      id="round-panel"
      open={open}
      onToggle={() => setOpen(v => !v)}
      title={`${t("emp.snap.round.title")}${sequence}`}
      target={targetRound}
      delivered={deliveredThisRound}
      returned={returnedThisRound}
      pctForBar={pctForBar}
      pctDisplay={pctDisplay}
      overBy={overBy}
      reached={reached}
      moneyToday={moneyRound}
      moneyExp={moneyExpRound}
      moneyProf={moneyProfRound}
      extraFoot={extraFoot}
    />
  );
};

export default RoundSnapshot;
