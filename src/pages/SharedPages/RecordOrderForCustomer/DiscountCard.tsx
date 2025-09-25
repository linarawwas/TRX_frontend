import React from "react";
import "./DiscountCard.css";

type Props = {
  /** USD unit price after discount (what your backend uses) */
  unitPriceUSD: number;
  /** Optional driver note */
  note?: string;
  /** Optional: company rate (LBP per 1 USD) if you want to show the LBP equivalent */
  rateLBP?: number | null;
};

function fmtUSD(n: number) {
  return `$ ${n.toFixed(2)}`;
}
function fmtLBP(n: number) {
  return `${Math.round(n).toLocaleString("ar-LB")} ل.ل`;
}

const DiscountCard: React.FC<Props> = ({ unitPriceUSD, note, rateLBP }) => {
  const lbpEq = rateLBP && rateLBP > 0 ? unitPriceUSD * rateLBP : null;

  return (
    <div className="discount-card" dir="rtl" aria-live="polite">
      <div className="dc-top">
        <div className="dc-icon" aria-hidden="true">
          {/* check-badge */}
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M12 2l2.39 4.85L20 8l-3.6 3.51L17.8 18 12 15.5 6.2 18l1.4-6.49L4 8l5.61-1.15L12 2z"
              fill="currentColor"
              opacity=".15"
            />
            <path
              d="M9.5 12.2l1.7 1.7 3.3-3.3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="dc-title">خصم مُفعّل لهذا الزبون</div>
        <div className="dc-chip">{fmtUSD(unitPriceUSD)} / القنّينة</div>
      </div>

      {lbpEq !== null && (
        <div className="dc-sub">
          ≈ <strong>{fmtLBP(lbpEq)}</strong> / القنّينة
          <span className="dc-rate"> (سعر مرجعي: {rateLBP!.toLocaleString("ar-LB")} ل.ل/1$)</span>
        </div>
      )}

      {note?.trim() ? (
        <div className="dc-note">
          <span className="dc-note-label">ملاحظة الدفع:</span>
          <span className="dc-note-text">{note}</span>
        </div>
      ) : null}

      <div className="dc-foot">* يُطبَّق تلقائيًا على الحساب</div>
    </div>
  );
};

export default DiscountCard;
