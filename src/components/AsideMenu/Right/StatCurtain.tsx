import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./StatCurtain.css";

const StatCurtain: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Redux state
  const target = useSelector((state: any) => state.shipment.target);
  const delivered = useSelector((state: any) => state.shipment.delivered);
  const returned = useSelector((state: any) => state.shipment.returned);
  const paidInUSD = useSelector((state: any) => state.shipment.dollarPayments);
  const paidInLira = useSelector((state: any) => state.shipment.liraPayments);
  const expensesInUSD = useSelector(
    (state: any) => state.shipment.expensesInUSD
  );
  const expensesInLira = useSelector(
    (state: any) => state.shipment.expensesInLiras
  );
  const profitsInUSD = useSelector((state: any) => state.shipment.profitsInUSD);
  const profitsInLira = useSelector(
    (state: any) => state.shipment.profitsInLiras
  );

  return (
    <div className="stat-curtain-container" dir="rtl">
      <button className="stat-toggle-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "🔼 إخفاء الإحصاءات" : "🔽 عرض الإحصاءات"}
      </button>

      <div className={`stat-curtain ${isOpen ? "open" : "closed"}`}>
        <div className="stat-card">🎯 الهدف: {target}</div>
        <div className="stat-card">➡️ تم التسليم: {delivered}</div>
        <div className="stat-card">⬅️ تم الإرجاع: {returned}</div>
        <div className="stat-card">
          💵 إدخال نقدي: {paidInUSD}$ {paidInLira} LBP
        </div>
        <div className="stat-card">
          📈 المصاريف: {expensesInUSD}$ {expensesInLira} LBP
        </div>
        <div className="stat-card">
          📉 الأرباح: {profitsInUSD}$ {profitsInLira} LBP
        </div>
      </div>
    </div>
  );
};

export default StatCurtain;
