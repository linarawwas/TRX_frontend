import React from "react";
import "./RecordOrder.css";
import { ToastContainer } from "react-toastify";
import LbpKeypad from "./LbpKeypad";
import { Link } from "react-router-dom";
import CustomerInvoices from "../../Customers/CustomerInvoices/CustomerInvoices";
import {
  RecordOrderProps,
  useRecordOrderController,
} from "./useRecordOrderController";

const RecordOrder: React.FC<RecordOrderProps> = (props) => {
  const {
    adjustDeliveredToRemaining,
    checkout,
    closeOverModal,
    customerId,
    customerName,
    dec,
    form,
    goToNewShipment,
    handleChange,
    handleLbpChange,
    handleSubmit,
    inc,
    isSubmitting,
    maxReturnable,
    overModal,
    productName,
    productPrice,
    remaining,
    setShowLbpPad,
    shipmentDelivered,
    showLbpPad,
    submitRemainingNow,
    targetRound,
  } = useRecordOrderController(props);

  /* ---------------- Render UI ---------------- */
  return (
    <div className="record-order-container" style={{ direction: "rtl" }}>
      <ToastContainer position="top-right" autoClose={2000} />

      <header className="roc-header">
        <h2 className="roc-title">{customerName}</h2>
        <div className="roc-product">
          المنتج: {productName} • {productPrice}$
        </div>
      </header>

      <Link to={`/updateCustomer/${customerId}`}>
        <CustomerInvoices customerId={customerId} />
      </Link>

      <form className="roc-grid" onSubmit={handleSubmit}>
        {/* Steppers row */}
        <div className="roc-steppers">
          {/* Delivered */}
          <div className="roc-stepper">
            <div className="roc-stepper-label">المسلّمة</div>
            <div className="roc-stepper-ctrl">
              <button
                type="button"
                onClick={() => dec("delivered")}
                aria-label="طرح"
              >
                −
              </button>
              <input
                type="number"
                name="delivered"
                value={form.delivered}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button
                type="button"
                onClick={() => inc("delivered")}
                aria-label="إضافة"
              >
                +
              </button>
            </div>
            <div className={`roc-hint ${remaining === 0 ? "locked" : ""}`}>
              المتبقي في هذه الجولة: <strong>{remaining}</strong>{" "}
              {remaining === 0 && (
                <>
                  • <span className="lock">مغلق</span>
                </>
              )}
            </div>
          </div>

          {/* Returned */}
          <div className="roc-stepper">
            <div className="roc-stepper-label">المرجعة</div>
            <div className="roc-stepper-ctrl">
              <button
                type="button"
                onClick={() => dec("returned")}
                aria-label="طرح"
              >
                −
              </button>
              <input
                type="number"
                name="returned"
                value={form.returned}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button
                type="button"
                onClick={() => inc("returned")}
                aria-label="إضافة"
              >
                +
              </button>
            </div>
            <div className={`roc-hint ${maxReturnable === 0 ? "locked" : ""}`}>
              الحد الأقصى للإرجاع: <strong>{maxReturnable}</strong>{" "}
              {maxReturnable === 0 && (
                <>
                  • <span className="lock">لا يمكنك إرجاع أكثر من القناني المتبقية</span>
                </>
              )}
            </div>
          </div>

          {/* USD */}
          <div className="roc-stepper">
            <div className="roc-stepper-label">الدولار</div>
            <div className="roc-stepper-ctrl">
              <button
                type="button"
                onClick={() => dec("paidUSD")}
                aria-label="طرح"
              >
                −
              </button>
              <input
                type="number"
                name="paidUSD"
                value={form.paidUSD}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button
                type="button"
                onClick={() => inc("paidUSD")}
                aria-label="إضافة"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Checkout line */}
        <div className="roc-checkout">
          <span>المطلوب:</span>
          <strong>{checkout.toFixed(2)} $</strong>
        </div>

        {/* LBP quick input */}
        <div className="roc-lbp">
          <div className="roc-lbp-label">المدفوع بالليرة</div>
          <button
            type="button"
            className="roc-lbp-field"
            onClick={() => setShowLbpPad(true)}
            aria-label="إدخال المبلغ بالليرة"
          >
            {form.paidLBP ? Number(form.paidLBP).toLocaleString() : "—"} ل.ل
          </button>

          <div className="roc-chip-row">
            {[1000, 10000, 50000, 100000].map((v) => (
              <button
                type="button"
                key={v}
                className="roc-chip"
                onClick={() => handleLbpChange((Number(form.paidLBP) || 0) + v)}
              >
                +{v.toLocaleString()}
              </button>
            ))}
            <button
              type="button"
              className="roc-chip roc-chip-clear"
              onClick={() => handleLbpChange(0)}
            >
              مسح
            </button>
          </div>
        </div>

        {/* sticky submit */}
        <div className="roc-submit">
          <button
            className="record-order-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading-dots">
                جاري التسجيل<span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            ) : (
              "تسجيل ✔️"
            )}
          </button>
        </div>
      </form>

      {/* LBP keypad bottom sheet */}
      <LbpKeypad
        open={showLbpPad}
        initialValue={Number(form.paidLBP) || 0}
        onClose={() => setShowLbpPad(false)}
        onConfirm={(val) => {
          handleLbpChange(val);
          setShowLbpPad(false);
        }}
      />

      {/* Over-target modal */}
      {overModal && (
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
                طلبت تسليم: <strong>{overModal.want}</strong>
              </p>
              <p className="confirm-warning">
                لا يمكنك تسليم أكثر من المتبقي ضمن هذه الشحنة.
              </p>
            </div>
            <div className="confirm-actions">
              <button
                className="btn secondary"
                onClick={adjustDeliveredToRemaining}
              >
                اضبطها إلى المتبقي
              </button>
              <button className="btn primary" onClick={() => void submitRemainingNow()}>
                اضبط وأرسل الآن
              </button>
              <button className="btn danger" onClick={goToNewShipment}>
                ابدأ شحنة جديدة
              </button>
              <button className="btn ghost" onClick={closeOverModal}>
                تعديل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordOrder;
