import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../UI reusables/UpdateSingleRecord/UpdateSingleRecord.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import {
  deleteOrderById,
  fetchOrderById,
  updateOrderById,
  type Order,
  type Payment,
} from "../../../features/orders/apiOrders";
import { createLogger } from "../../../utils/logger";
import AddPaymentForm from "./AddPaymentForm/AddPaymentForm";
import OrderReceipt from "./OrderReceipt/OrderReceipt";
import "./UpdateOrder.css";

const logger = createLogger("update-order");

function sumPaymentsByCurrency(
  payments: Payment[] | undefined,
  currency: "USD" | "LBP"
): number {
  return (payments || [])
    .filter((p) => p.currency === currency)
    .reduce((s, p) => s + (p.amount || 0), 0);
}

type PaymentSheetProps = {
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

const PaymentSheet = memo(function PaymentSheet({
  title = "إضافة دفعة",
  onClose,
  children,
}: PaymentSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      className="sheet-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        ref={panelRef}
        className="sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="sheet-head">
          <div className="sheet-title">{title}</div>
          <button
            type="button"
            className="sheet-close"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
});

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

const Modal = memo(function Modal({ title, onClose, children }: ModalProps) {
  const titleId = useId();

  return (
    <div
      className="uo-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="uo-modal__panel">
        <div className="uo-modal__head">
          <h3 id={titleId} className="uo-modal__title">
            {title}
          </h3>
          <button
            type="button"
            className="uo-iconBtn"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="uo-modal__body">{children}</div>
      </div>
    </div>
  );
});

type EditFormState = {
  delivered: string;
  returned: string;
  usd: string;
  lbp: string;
};

function UpdateOrderInner(): JSX.Element {
  const token = useSelector((s: RootState) => s.user.token);
  const isAdmin = useSelector((s: RootState) => Boolean(s.user?.isAdmin));
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [edit, setEdit] = useState<EditFormState>({
    delivered: "",
    returned: "",
    usd: "",
    lbp: "",
  });

  const [showDelete, setShowDelete] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    if (!orderId || !token) {
      setLoading(false);
      setOrderData(null);
      setLoadError(
        !orderId ? "معرّف الطلب غير متوفر" : "يجب تسجيل الدخول لعرض الطلب"
      );
      return;
    }
    const result = await fetchOrderById(token, orderId);
    if (result.error || !result.data) {
      const msg = result.error || "تعذر تحميل الطلب";
      toast.error(msg);
      logger.warn("fetchOrderById failed", { orderId, message: msg });
      setLoadError(msg);
      setOrderData(null);
      setLoading(false);
      return;
    }
    setOrderData(result.data);
    setLoadError(null);
    setLoading(false);
  }, [orderId, token]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const usdTotal = useMemo(
    () => sumPaymentsByCurrency(orderData?.payments, "USD"),
    [orderData]
  );
  const lbpTotal = useMemo(
    () => sumPaymentsByCurrency(orderData?.payments, "LBP"),
    [orderData]
  );

  const title = useMemo(
    () =>
      orderData?.customer?.name
        ? `فاتورة: ${orderData.customer.name}`
        : "معلومات الفاتورة",
    [orderData]
  );

  const openEdit = useCallback(() => {
    if (!isAdmin) {
      toast.warn("هذه العملية للمشرف فقط");
      return;
    }
    setEdit({
      delivered: String(orderData?.delivered ?? ""),
      returned: String(orderData?.returned ?? ""),
      usd: String(usdTotal ?? ""),
      lbp: String(lbpTotal ?? ""),
    });
    setShowEdit(true);
  }, [isAdmin, orderData?.delivered, orderData?.returned, usdTotal, lbpTotal]);

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!orderId || !token) {
      toast.error("Missing auth token");
      return;
    }
    const body: {
      delivered?: number;
      returned?: number;
      usdTotal?: number;
      lbpTotal?: number;
    } = {};
    const n = (v: string) => (v === "" ? undefined : Number(v));

    const d = n(edit.delivered);
    if (d !== undefined) body.delivered = d;
    const r = n(edit.returned);
    if (r !== undefined) body.returned = r;
    const u = n(edit.usd);
    if (u !== undefined) body.usdTotal = u;
    const l = n(edit.lbp);
    if (l !== undefined) body.lbpTotal = l;

    const result = await updateOrderById(token, orderId, body);
    if (result.error || !result.data) {
      toast.error(result.error || "فشل العملية");
      return;
    }
    setOrderData(result.data);
    toast.success("تم حفظ التعديل");
    setShowEdit(false);
  };

  const askDelete = useCallback(() => {
    if (!isAdmin) {
      toast.warn("هذه العملية للمشرف فقط");
      return;
    }
    setDeleteStep(1);
    setShowDelete(true);
  }, [isAdmin]);

  const performDelete = async () => {
    if (!orderId || !token) {
      toast.error("Missing auth token");
      return;
    }
    const result = await deleteOrderById(token, orderId);
    if (result.error) {
      toast.error(result.error || "فشل العملية");
      return;
    }
    toast.success("تم حذف الطلب");
    setShowDelete(false);
    setTimeout(() => navigate(-1), 300);
  };

  return (
    <div className="update-order-container uo-shell" dir="rtl" lang="ar">
      <ToastContainer position="top-right" autoClose={1200} />

      <header className="uo-header" aria-label="أدوات الفاتورة">
        <button
          type="button"
          className="uo-back"
          onClick={() => navigate(-1)}
          aria-label="رجوع"
        >
          <span className="uo-header__icon" aria-hidden="true">
            ←
          </span>
        </button>
        <h1 className="uo-title">{title}</h1>
        <div className="uo-actions">
          <button
            type="button"
            className="uo-print"
            onClick={() => window.print()}
            aria-label="طباعة"
          >
            <span className="uo-header__icon" aria-hidden="true">
              ⎙
            </span>
            <span className="uo-print__label">طباعة</span>
          </button>

          <button
            type="button"
            className={`uo-btn ${isAdmin ? "" : "uo-btn--disabled"}`}
            onClick={openEdit}
            disabled={!isAdmin}
            title={isAdmin ? "تعديل الطلب" : "للمشرف فقط"}
          >
            تعديل
          </button>
          <button
            type="button"
            className={`uo-btn uo-btn--danger ${
              isAdmin ? "" : "uo-btn--disabled"
            }`}
            onClick={askDelete}
            disabled={!isAdmin}
            title={isAdmin ? "حذف نهائي" : "للمشرف فقط"}
          >
            حذف
          </button>
        </div>
      </header>

      {!loading && loadError ? (
        <div className="uo-inline-error" role="alert">
          <p className="uo-inline-error__text">{loadError}</p>
          <button type="button" className="uo-retry" onClick={() => void loadOrder()}>
            إعادة المحاولة
          </button>
        </div>
      ) : null}

      <OrderReceipt orderData={orderData} loading={loading} />

      <button
        type="button"
        className="uo-fab"
        onClick={() => setShowSheet(true)}
        aria-label="إضافة دفعة"
        disabled={!orderId || !orderData}
      >
        +
      </button>

      {showSheet && orderId && orderData ? (
        <PaymentSheet onClose={() => setShowSheet(false)}>
          <AddPaymentForm
            orderData={orderData}
            orderId={orderId}
            setOrderData={setOrderData}
            onSuccess={() => setShowSheet(false)}
          />
        </PaymentSheet>
      ) : null}

      {showEdit ? (
        <Modal title="تعديل الطلب" onClose={() => setShowEdit(false)}>
          <form className="uo-form" onSubmit={submitEdit}>
            <div className="uo-grid">
              <label className="uo-label">
                المسلّم
                <input
                  className="uo-input"
                  type="number"
                  value={edit.delivered}
                  onChange={(e) =>
                    setEdit((p) => ({ ...p, delivered: e.target.value }))
                  }
                  min={0}
                />
              </label>
              <label className="uo-label">
                المرجّع
                <input
                  className="uo-input"
                  type="number"
                  value={edit.returned}
                  onChange={(e) =>
                    setEdit((p) => ({ ...p, returned: e.target.value }))
                  }
                  min={0}
                />
              </label>
              <label className="uo-label">
                المدفوع ($)
                <input
                  className="uo-input"
                  type="number"
                  step="0.01"
                  value={edit.usd}
                  onChange={(e) =>
                    setEdit((p) => ({ ...p, usd: e.target.value }))
                  }
                  min={0}
                />
              </label>
              <label className="uo-label">
                المدفوع (ل.ل)
                <input
                  className="uo-input"
                  type="number"
                  step="1"
                  value={edit.lbp}
                  onChange={(e) =>
                    setEdit((p) => ({ ...p, lbp: e.target.value }))
                  }
                  min={0}
                />
              </label>
            </div>
            <div className="uo-modal__actions">
              <button
                type="button"
                className="uo-btn"
                onClick={() => setShowEdit(false)}
              >
                إلغاء
              </button>
              <button type="submit" className="uo-btn uo-btn--primary">
                حفظ
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {showDelete ? (
        <Modal title="حذف الطلب" onClose={() => setShowDelete(false)}>
          {deleteStep === 1 ? (
            <>
              <p className="uo-modal__text">
                سيتم حذف الطلب نهائيًا. هل تريد المتابعة؟
              </p>
              <div className="uo-modal__actions">
                <button
                  type="button"
                  className="uo-btn"
                  onClick={() => setShowDelete(false)}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="uo-btn uo-btn--danger"
                  onClick={() => setDeleteStep(2)}
                >
                  متابعة
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="uo-modal__text">
                <strong>تأكيد أخير:</strong> لا يمكن التراجع بعد الحذف.
              </p>
              <div className="uo-modal__actions">
                <button
                  type="button"
                  className="uo-btn"
                  onClick={() => setShowDelete(false)}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="uo-btn uo-btn--danger"
                  onClick={performDelete}
                >
                  حذف نهائي
                </button>
              </div>
            </>
          )}
        </Modal>
      ) : null}
    </div>
  );
}

type BoundaryState = { hasError: boolean };

class UpdateOrderErrorBoundary extends React.Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error("UpdateOrder render failed", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="update-order-container uo-shell uo-shell--error" dir="rtl" lang="ar">
          <div className="uo-error-card" role="alert">
            <h2 className="uo-error-title">تعذّر عرض الفاتورة</h2>
            <p className="uo-error-body">
              حدث خطأ غير متوقع. يمكنك إعادة تحميل الصفحة أو الرجوع.
            </p>
            <button
              type="button"
              className="uo-error-reload"
              onClick={() => window.location.reload()}
            >
              إعادة تحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function UpdateOrder(): JSX.Element {
  return (
    <UpdateOrderErrorBoundary>
      <UpdateOrderInner />
    </UpdateOrderErrorBoundary>
  );
}
