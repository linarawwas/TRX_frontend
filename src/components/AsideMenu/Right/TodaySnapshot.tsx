// TodaySnapshot.tsx
import React, { memo, useState } from "react";
import { useSelector } from "react-redux";
import "./TodaySnapshot.css";
import RoundsHistory from "../../Shipments/RoundsHistory/RoundsHistory";
import { selectTodayProgress, selectShipmentMeta } from "../../../redux/selectors/shipment";
import { computeProgress, formatMoneyPair } from "../../../features/shipments/utils/progress";
import ProgressSnapshot from "../../snapshots/ProgressSnapshot";
import { t } from "../../../utils/i18n";

const TodaySnapshotComponent: React.FC = () => {
  const [open, setOpen] = useState(false);

  const { id: shipmentId } = useSelector(selectShipmentMeta);
  const { target, delivered, returned, paidUSD, paidLBP, expUSD, expLBP, profUSD, profLBP } = useSelector(selectTodayProgress);
  
  const { pctForBar, pctDisplay, overBy, reached } = computeProgress(delivered, target);
  const moneyToday = formatMoneyPair(paidUSD, paidLBP);
  const moneyExp = formatMoneyPair(expUSD, expLBP);
  const moneyProf = formatMoneyPair(profUSD, profLBP);

  return (
    <ProgressSnapshot
      id="today-panel"
      open={open}
      onToggle={() => setOpen(v => !v)}
      title={t("emp.snap.today.title")}
      target={target}
      delivered={delivered}
      returned={returned}
      pctForBar={pctForBar}
      pctDisplay={pctDisplay}
      overBy={overBy}
      reached={reached}
      moneyToday={moneyToday}
      moneyExp={moneyExp}
      moneyProf={moneyProf}
      kpiScope="today"
      showProgressSummary
    >
      {shipmentId && (
        <RoundsHistory
          shipmentId={shipmentId}
          totalToday={target}
          title={t("emp.snap.roundsHistoryTitle")}
        />
      )}
    </ProgressSnapshot>
  );
};

const TodaySnapshot = memo(TodaySnapshotComponent);
export default TodaySnapshot;
