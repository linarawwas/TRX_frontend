import React from "react";
import "react-toastify/dist/ReactToastify.css";

import AddToModel from "../../AddToModel/AddToModel";
import { useStartShipmentController } from "../../../features/shipments/hooks/useStartShipmentController";
import "./StartShipment.css";

const StartShipment: React.FC = () => {
  const {
    areasDone,
    areasTotal,
    buildShipmentConfirm,
    currentArea,
    handleDevReload,
    handleRetryPreload,
    handleShipmentSubmit,
    isDevMode,
    lastCustomers,
    phaseAreas,
    phaseCache,
    phaseMeta,
    preloadError,
    progressNote,
    progressPct,
    shipmentConfig,
    showLoadingModal,
  } = useStartShipmentController();

  return (
    <>
      <AddToModel
        modelName={shipmentConfig["component-related-fields"].modelName}
        title={shipmentConfig["component-related-fields"].title}
        buttonLabel={shipmentConfig["component-related-fields"]["button-label"]}
        modelFields={shipmentConfig["model-related-fields"]}
        onSubmit={handleShipmentSubmit}
        confirmBuilder={buildShipmentConfirm}
      />

      {preloadError && (
        <div className="retry-box">
          ⚠️ لم يتم تحميل البيانات بنجاح.
          <br />
          <button onClick={handleRetryPreload}>
            أعد المحاولة
          </button>
        </div>
      )}

      {isDevMode && !preloadError && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button onClick={handleDevReload}>
            🔁 إعادة تحميل بيانات الشحنة
          </button>
        </div>
      )}

      {showLoadingModal && (
        <div className="shipment-loading-overlay">
          <div
            className="shipment-loading-modal"
            role="alert"
            aria-live="assertive"
          >
            <h2>🚛 جاري تجهيز الشحنة</h2>
            <p className="loading-intro">
              نُحضّر كل شيء للعمل بلا إنترنت بأمان.
            </p>

            <div className="progress-wrap">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="progress-label">{progressPct}%</div>
            </div>

            <ul className="phase-list">
              <li className={phaseMeta ? "done" : ""}>
                قراءة بيانات اليوم والمناطق
              </li>
              <li className={phaseCache ? "done" : ""}>
                حفظ البيانات في الجهاز
              </li>
              <li className={phaseAreas ? "done" : ""}>
                تجهيز الزبائن لكل منطقة
              </li>
            </ul>

            <div className="stats-row">
              <div className="stat">
                <div className="stat-num">
                  {areasDone}/{areasTotal}
                </div>
                <div className="stat-label">المناطق المُحضّرة</div>
              </div>
              <div className="stat">
                <div className="stat-num">{lastCustomers ?? "…"}</div>
                <div className="stat-label">زبائن آخر منطقة</div>
              </div>
            </div>

            <div className="current-action">
              <div className="pulse-dot" />
              <div>
                <div className="action-title">الآن:</div>
                <div className="action-text">{progressNote}</div>
                {currentArea && (
                  <div className="action-sub">
                    المنطقة الحالية: <strong>{currentArea}</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="why-block">
              <div className="why-title">لماذا ننتظر؟</div>
              <ul>
                <li>تحميل المناطق والزبائن ليعمل كل شيء بدون إنترنت.</li>
                <li>حفظ الخصومات والفواتير للتسجيل السريع في الطريق.</li>
                <li>ضمان إعادة الإرسال التلقائي عند عودة الشبكة.</li>
              </ul>
            </div>

            <div className="progress-spinner" />
          </div>
        </div>
      )}
    </>
  );
};

export default StartShipment;
