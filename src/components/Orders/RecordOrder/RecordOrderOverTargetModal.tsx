import React from "react";

type RecordOrderOverTargetModalProps = {
  targetRound: number;
  shipmentDelivered: number;
  remaining: number;
  requested: number;
  onAdjustToRemaining: () => void;
  onSubmitRemainingNow: () => void;
  onStartNewShipment: () => void;
  onClose: () => void;
};

export default function RecordOrderOverTargetModal({
  targetRound,
  shipmentDelivered,
  remaining,
  requested,
  onAdjustToRemaining,
  onSubmitRemainingNow,
  onStartNewShipment,
  onClose,
}: RecordOrderOverTargetModalProps) {
  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true">
      <div className="confirm-card" dir="rtl">
        <h3 className="confirm-title">تجاوز الهدف غير مسموح</h3>
        <div className="confirm-body">
          <p>
            الهدف لهذه الشحنة: <strong>{targetRound}</strong>
          </p>
          <p>
            المسلّم حتى الآن: <strong>{shipmentDelivered}</strong>
          </p>
          <p>
            المتبقي: <strong>{remaining}</strong>
          </p>
          <p>
            طلبت تسليم: <strong>{requested}</strong>
          </p>
          <p className="confirm-warning">
            لا يمكنك تسليم أكثر من المتبقي ضمن هذه الشحنة.
          </p>
        </div>
        <div className="confirm-actions">
          <button className="btn secondary" onClick={onAdjustToRemaining}>
            اضبطها إلى المتبقي
          </button>
          <button className="btn primary" onClick={onSubmitRemainingNow}>
            اضبط وأرسل الآن
          </button>
          <button className="btn danger" onClick={onStartNewShipment}>
            ابدأ شحنة جديدة
          </button>
          <button className="btn ghost" onClick={onClose}>
            تعديل
          </button>
        </div>
      </div>
    </div>
  );
}
