import React from "react";
import "./RecordOrder.css";
import { ToastContainer } from "react-toastify";
import LbpKeypad from "./LbpKeypad";
import { Link } from "react-router-dom";
import CustomerInvoices from "../../Customers/CustomerInvoices/CustomerInvoices";
import RecordOrderLbpSection from "./RecordOrderLbpSection";
import RecordOrderOverTargetModal from "./RecordOrderOverTargetModal";
import RecordOrderStepField from "./RecordOrderStepField";
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
        <div className="roc-steppers">
          <RecordOrderStepField
            field="delivered"
            label="المسلّمة"
            value={form.delivered}
            onChange={handleChange}
            onIncrement={inc}
            onDecrement={dec}
            hint={
              <div className={`roc-hint ${remaining === 0 ? "locked" : ""}`}>
                المتبقي في هذه الجولة: <strong>{remaining}</strong>{" "}
                {remaining === 0 && (
                  <>
                    • <span className="lock">مغلق</span>
                  </>
                )}
              </div>
            }
            data-testid="record-order-delivered"
          />

          <RecordOrderStepField
            field="returned"
            label="المرجعة"
            value={form.returned}
            onChange={handleChange}
            onIncrement={inc}
            onDecrement={dec}
            hint={
              <div className={`roc-hint ${maxReturnable === 0 ? "locked" : ""}`}>
                الحد الأقصى للإرجاع: <strong>{maxReturnable}</strong>{" "}
                {maxReturnable === 0 && (
                  <>
                    •{" "}
                    <span className="lock">
                      لا يمكنك إرجاع أكثر من القناني المتبقية
                    </span>
                  </>
                )}
              </div>
            }
            data-testid="record-order-returned"
          />

          <RecordOrderStepField
            field="paidUSD"
            label="الدولار"
            value={form.paidUSD}
            onChange={handleChange}
            onIncrement={inc}
            onDecrement={dec}
            data-testid="record-order-paid-usd"
          />
        </div>

        <div className="roc-checkout">
          <span>المطلوب:</span>
          <strong>{checkout.toFixed(2)} $</strong>
        </div>

        <RecordOrderLbpSection
          value={Number(form.paidLBP) || 0}
          onOpen={() => setShowLbpPad(true)}
          onChange={handleLbpChange}
        />

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

      {overModal && (
        <RecordOrderOverTargetModal
          targetRound={targetRound}
          shipmentDelivered={shipmentDelivered}
          remaining={remaining}
          requested={overModal.want}
          onAdjustToRemaining={adjustDeliveredToRemaining}
          onSubmitRemainingNow={() => void submitRemainingNow()}
          onStartNewShipment={goToNewShipment}
          onClose={closeOverModal}
        />
      )}
    </div>
  );
};

export default RecordOrder;
