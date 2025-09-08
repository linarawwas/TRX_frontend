import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom"; // ⬇️ add these to your imports

import "./UpdateCustomer.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import SelectInput from "../../UI reusables/SelectInput/SelectInput";
import CustomerInvoices from "../CustomerInvoices/CustomerInvoices";
import CustomerInfo from "../CustomerInfo/CustomerInfo";
import {
  setCustomerId,
  setCustomerName,
  setCustomerPhoneNb,
} from "../../../redux/Order/action";
import { fetchAndCacheCustomerInvoice } from "../../../utils/apiHelpers";
import AreaSequencePicker from "../../AreaSequencePicker/AreaSequencePicker";
import AssignDistributorInline from "../../Distributors/AssignDistributorInline";

type Area = { _id: string; name: string };
type CustomerLite = { _id: string; name: string; sequence?: number | null };

function UpdateCustomer() {
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.user.token);
  const companyId = useSelector((state: any) => state.user.companyId);
  const navigate = useNavigate();
  const { customerId } = useParams();

  const [areas, setAreas] = useState<Area[]>([]);
  const [customerData, setCustomerData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceReady, setInvoiceReady] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  // ...inside component:
  const shipmentId = useSelector((state: any) => state.shipment?._id);

  // NEW: record order handler (external)
  const handleRecordOrder = () => {
    if (!customerData?._id) {
      toast.error("بيانات الزبون غير متوفرة");
      return;
    }
    if (!shipmentId) {
      toast.error("ابدأ الشحنة أولاً قبل تسجيل الطلب");
      return; // or navigate("/startShipment") if you want to redirect
    }

    dispatch(setCustomerId(customerData._id));
    dispatch(setCustomerName(customerData.name || ""));
    dispatch(setCustomerPhoneNb(customerData.phone || ""));

    // External order from UpdateCustomer page
    navigate("/recordOrderforCustomer", { state: { isExternal: true } });
  };

  const [updatedInfo, setUpdatedInfo] = useState({
    _id: "",
    name: "",
    phone: "",
    address: "",
    areaId: { _id: "", name: "" },
    companyId: companyId,
    hasDiscount: false,
    valueAfterDiscount: 0,
    discountCurrency: "",
    noteAboutCustomer: "",
  });

  // NEW: data for sequence placement UI
  const [areaCustomers, setAreaCustomers] = useState<CustomerLite[]>([]);
  const [posTarget, setPosTarget] = useState<string>("__END__"); // __START__ | __END__ | <customerId>
  const [isPlacing, setIsPlacing] = useState(false);
  // NEW: mutation states for activate/deactivate
  const [isMutating, setIsMutating] = useState(false);
  const [showRestoreOptions, setShowRestoreOptions] = useState(false);
  const [restoreSequence, setRestoreSequence] = useState<number | "">("");

  useEffect(() => {
    if (customerId) dispatch(setCustomerId(customerId));
  }, [customerId, dispatch]);

  const fetchAreas = () => {
    fetch("http://localhost:5000/api/areas/company", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAreas)
      .catch((err) => console.error("Fetching areas failed:", err));
  };

  const fetchCustomer = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/customers/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch customer");
      const data = await res.json();
      setCustomerData(data);
      setOriginalData(data);

      await fetchAndCacheCustomerInvoice(customerId!, token);
      setInvoiceReady(true);

      // also load customers in the same area (ordered by sequence; fallback to client sort)
      if (data?.areaId?._id) {
        const listRes = await fetch(
          `http://localhost:5000/api/customers/area/${data.areaId._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const list: CustomerLite[] = await listRes.json();
        const sorted = [...list].sort((a, b) => {
          const sa = a.sequence ?? Number.POSITIVE_INFINITY;
          const sb = b.sequence ?? Number.POSITIVE_INFINITY;
          if (sa !== sb) return sa - sb;
          return a.name.localeCompare(b.name, "ar");
        });
        setAreaCustomers(sorted);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setInvoiceReady(true);
    } finally {
      setLoading(false);
    }
  }, [customerId, token]);

  useEffect(() => {
    fetchAreas();
    fetchCustomer();
  }, [fetchCustomer]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone" && !/^\d*$/.test(value)) {
      toast.error("أدخل أرقام فقط");
      return;
    }

    if (name === "areaId") {
      const chosen = areas.find((a) => a._id === value);
      setUpdatedInfo((prev) => ({
        ...prev,
        areaId: { _id: value, name: chosen?.name || "" },
      }));
      return;
    }

    setUpdatedInfo((prev) => ({ ...prev, [name]: value }));
  };
  type PlacementMode = "none" | "sequence" | "relative";

  const [placementMode, setPlacementMode] = useState<PlacementMode>("none");

  // explicit number
  const [sequenceNumber, setSequenceNumber] = useState<number | "">("");

  // relative placement
  const [relPosition, setRelPosition] = useState<
    "__START__" | "__END__" | "before" | "after"
  >("__END__");
  const [relAnchorId, setRelAnchorId] = useState<string>(""); // customerId to place before/after
  // helper to get currently selected area _id (supports string or object)
  const selectedAreaId =
    typeof updatedInfo.areaId === "string"
      ? updatedInfo.areaId
      : updatedInfo.areaId?._id || "";

  // fetch customers for the area currently selected in the form
  useEffect(() => {
    if (!selectedAreaId) return;

    (async () => {
      try {
        const listRes = await fetch(
          `http://localhost:5000/api/customers/area/${selectedAreaId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const list: CustomerLite[] = await listRes.json();
        const sorted = [...list].sort((a, b) => {
          const sa = a.sequence ?? Number.POSITIVE_INFINITY;
          const sb = b.sequence ?? Number.POSITIVE_INFINITY;
          if (sa !== sb) return sa - sb;
          return a.name.localeCompare(b.name, "ar");
        });
        setAreaCustomers(sorted);
      } catch (e) {
        console.error("fetch areaCustomers for selected area failed", e);
      }
    })();
  }, [selectedAreaId, token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const changes: any = {};
    const t = (s: string) => s?.trim?.() ?? "";

    if (t(updatedInfo.name)) changes.name = t(updatedInfo.name);
    if (t(updatedInfo.phone)) changes.phone = t(updatedInfo.phone);
    if (t(updatedInfo.address)) changes.address = t(updatedInfo.address);

    // area: accept string or object
    const targetAreaId =
      typeof updatedInfo.areaId === "string"
        ? updatedInfo.areaId
        : updatedInfo.areaId?._id;

    if (targetAreaId && targetAreaId !== (customerData?.areaId?._id || "")) {
      changes.areaId = targetAreaId;
    }

    // If there are *no* field changes BUT the user asked for placement changes in the same area,
    // we still want to proceed to placement. So we won't early-return here.
    const hasFieldChanges = Object.keys(changes).length > 0;

    try {
      // 1) Apply field changes (name/phone/address/area)
      if (hasFieldChanges) {
        const res = await fetch(
          `http://localhost:5000/api/customers/${customerId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(changes),
          }
        );
        const j = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(j?.error || "فشل التحديث");
          return;
        }
        toast.success("تم تحديث بيانات الزبون");
      }

      // 2) Refresh the customer list for the target area (important if area changed)
      // 2) Refresh the customer list for the target area (important if area changed)
      if (targetAreaId) {
        const listRes = await fetch(
          `http://localhost:5000/api/customers/area/${targetAreaId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const list: CustomerLite[] = await listRes.json();
        const sorted = [...list].sort((a, b) => {
          const sa = a.sequence ?? Number.POSITIVE_INFINITY;
          const sb = b.sequence ?? Number.POSITIVE_INFINITY;
          if (sa !== sb) return sa - sb;
          return a.name.localeCompare(b.name, "ar");
        });
        setAreaCustomers(sorted);
      }

      // 🔽🔽🔽 ADD THIS BLOCK *RIGHT HERE* (after Step 2, before your current Step 3)
      const areaChanged =
        targetAreaId && targetAreaId !== (customerData?.areaId?._id || "");

      // If area changed and user didn't pick a placement, auto-append to end
      if (areaChanged && placementMode === "none") {
        setPlacementMode("relative");
        setRelPosition("__END__");
        await applyPlacementToArea(targetAreaId);
        toast.success("تم نقل الزبون للمنطقة ووضعه في آخر الترتيب");
      } else if (placementMode !== "none" && targetAreaId) {
        // Existing behavior: respect explicit placement choice
        await applyPlacementToArea(targetAreaId);
        toast.success("تم ضبط ترتيب الزبون");
      } else if (!hasFieldChanges) {
        toast.info("لا توجد تغييرات لإرسالها");
        return;
      }
      // 🔼🔼🔼 END ADD


      // 4) Final refresh
      await fetchCustomer();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "فشل العملية");
    }
  };

  // ====== NEW: deactivate / restore actions ======
  const handleDeactivate = async () => {
    if (!customerId) return;
    if (!window.confirm("هل تريد إيقاف هذا الزبون؟")) return;

    setIsMutating(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/customers/${customerId}/deactivate`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "تعذر إيقاف الزبون");
      toast.success("تم إيقاف الزبون");
      setShowRestoreOptions(false);
      setRestoreSequence("");
      fetchCustomer();
    } catch (err: any) {
      toast.error(err?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };

  const restoreRequest = async (body: any) => {
    const res = await fetch(
      `http://localhost:5000/api/customers/${customerId}/restore`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body || {}),
      }
    );
    const data = await res.json().catch(() => ({}));
    return { res, data };
  };

  const handleRestoreAuto = async () => {
    if (!customerId) return;
    setIsMutating(true);
    try {
      // Let the backend auto-assign the next available sequence.
      const areaId = customerData?.areaId?._id;
      const { res, data } = await restoreRequest({ areaId });
      if (res.ok) {
        toast.success("تم تنشيط الزبون");
        setShowRestoreOptions(false);
        setRestoreSequence("");
        fetchCustomer();
        return;
      }
      // Gracefully handle sequence conflicts
      if (res.status === 409) {
        toast.warn("رقم الترتيب مستخدم. اختر رقمًا آخر.");
        setShowRestoreOptions(true);
        return;
      }
      throw new Error(data?.error || "تعذر تنشيط الزبون");
    } catch (err: any) {
      toast.error(err?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };

  const handleRestoreWithSequence = async (e: FormEvent) => {
    e.preventDefault();
    if (restoreSequence === "" || Number(restoreSequence) <= 0) {
      toast.error("أدخل رقم ترتيب صحيح (1 أو أكبر)");
      return;
    }
    setIsMutating(true);
    try {
      const areaId = customerData?.areaId?._id;
      const { res, data } = await restoreRequest({
        areaId,
        sequence: Number(restoreSequence),
      });
      if (!res.ok) {
        if (res.status === 409) {
          toast.warn("هذا الرقم ما زال مستخدمًا. جرّب رقمًا مختلفًا.");
          return;
        }
        throw new Error(data?.error || "تعذر تنشيط الزبون");
      }
      toast.success("تم تنشيط الزبون وتعيين الترتيب");
      setShowRestoreOptions(false);
      setRestoreSequence("");
      fetchCustomer();
    } catch (err: any) {
      toast.error(err?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };
  async function applyPlacementToArea(targetAreaId: string) {
    const mine = String(customerId);

    // 1) Build current list (excluding me if present)
    const current = areaCustomers.map((c) => c._id);
    const without = current.filter((id) => id !== mine);

    // 2) Decide new order
    let nextOrder: string[] = [];

    if (placementMode === "sequence") {
      // Insert at 1-based index (sequenceNumber). Clamp to [1 .. len+1]
      const n = sequenceNumber === "" ? undefined : Number(sequenceNumber);
      if (!n || n < 1) return; // nothing to apply
      const idx = Math.max(0, Math.min(without.length, n - 1));
      nextOrder = [...without.slice(0, idx), mine, ...without.slice(idx)];
    } else if (placementMode === "relative") {
      if (relPosition === "__START__") {
        nextOrder = [mine, ...without];
      } else if (relPosition === "__END__") {
        nextOrder = [...without, mine];
      } else {
        if (!relAnchorId) return;
        const i = without.indexOf(relAnchorId);
        if (i === -1) {
          nextOrder = [...without, mine]; // fallback end
        } else {
          const insertAt = relPosition === "before" ? i : i + 1;
          nextOrder = [
            ...without.slice(0, insertAt),
            mine,
            ...without.slice(insertAt),
          ];
        }
      }
    } else {
      return; // no placement change requested
    }

    // 3) Commit with reorder API
    const res = await fetch(
      `http://localhost:5000/api/areas/${targetAreaId}/reorder?companyId=${companyId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderedCustomerIds: nextOrder,
          force: true,
          startAt: 1,
        }),
      }
    );
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      toast.error(data?.error || "تعذر تحديث الترتيب");
      throw new Error(data?.error || "reorder failed");
    }
  }

  // ====== NEW: place this customer within the area order ======
  const applyPlacement = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerData?.areaId?._id) {
      toast.error("لا يوجد منطقة لهذا الزبون");
      return;
    }
    const areaId = customerData.areaId._id;

    // Build a new order: remove this id, then insert at chosen spot
    const current = areaCustomers.map((c) => c._id);
    const mine = String(customerId);
    const without = current.filter((id) => id !== mine);

    let nextOrder: string[] = [];
    if (posTarget === "__START__") {
      nextOrder = [mine, ...without];
    } else if (posTarget === "__END__") {
      nextOrder = [...without, mine];
    } else {
      const idx = without.indexOf(posTarget);
      if (idx === -1) {
        // fallback to end if target not found
        nextOrder = [...without, mine];
      } else {
        nextOrder = [
          ...without.slice(0, idx + 1),
          mine,
          ...without.slice(idx + 1),
        ];
      }
    }

    setIsPlacing(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/areas/${areaId}/reorder?companyId=${companyId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderedCustomerIds: nextOrder,
            force: true,
            startAt: 1,
          }),
        }
      );

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        toast.error(data?.error || "تعذر تحديث الترتيب");
        return;
      }

      toast.success("تم تحديث ترتيب الزبائن في هذه المنطقة");
      // refresh local list & customer info
      await fetchCustomer();
    } catch (err: any) {
      toast.error(err?.message || "خطأ في الشبكة");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="update-customer-container">
      <ToastContainer position="top-right" autoClose={1000} />
      <div className="update-header">
        <h1>معلومات الزبون:</h1>
      </div>
      {/* STATUS + ACTIONS */}
      {customerData && (
        <div className="cust-actions">
          <span
            className={`status-chip ${customerData.isActive ? "ok" : "off"}`}
          >
            {customerData.isActive ? "نشط" : "غير نشط"}
          </span>

          {customerData.isActive ? (
            <button
              className="danger-btn"
              onClick={handleDeactivate}
              disabled={isMutating}
            >
              {isMutating ? "جارٍ الإيقاف..." : "إيقاف الزبون"}
            </button>
          ) : (
            <div className="restore-block">
              <button
                className="primary-btn"
                onClick={handleRestoreAuto}
                disabled={isMutating}
              >
                {isMutating ? "جارٍ التنشيط..." : "تنشيط الزبون"}
              </button>

              {showRestoreOptions && (
                <form
                  className="restore-inline"
                  onSubmit={handleRestoreWithSequence}
                >
                  <label className="restore-label">رقم الترتيب:</label>
                  <input
                    className="restore-input"
                    type="number"
                    min={1}
                    value={restoreSequence}
                    onChange={(e) =>
                      setRestoreSequence(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="مثال: 25"
                  />
                  <button
                    className="secondary-btn"
                    type="submit"
                    disabled={isMutating}
                  >
                    حفظ الرقم وتنشيط
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
      <CustomerInfo customerData={customerData} loading={loading} />

      {/* …inside UpdateCustomer render, right after <CustomerInfo … /> */}
      {customerData && (
        <AssignDistributorInline
          customerId={customerId!}
          currentDistributorId={customerData?.distributorId || null}
        />
      )}

      {customerData && invoiceReady && (
        <>
          <CustomerInvoices customerId={customerId!} />
          {/* ✅ NEW: go to printable account statement */}
          <div className="statement-cta">
            <button
              className="statement-button"
              onClick={() => navigate(`/customers/${customerId}/statement`)}
            >
              الذهاب إلى كشف الحساب أو إضافة دفعة
            </button>
          </div>
          {/* NEW: Record Order CTA */}
          {customerData.isActive && (
            <div className="record-order-cta">
              <button
                className="record-order-button"
                onClick={handleRecordOrder}
              >
                تسجيل طلب خارجي لهذا الزبون
              </button>
              {!shipmentId && (
                <div className="hint-text">
                  لبدء تسجيل الطلبات، ابدأ الشحنة أولاً من شاشة "بدء الشحنة".
                </div>
              )}
            </div>
          )}
        </>
      )}
      {/* Reusable sequence placement (apply-now mode) */}
      {customerData?.areaId?._id && (
        <AreaSequencePicker
          token={token}
          companyId={companyId}
          areaId={customerData.areaId._id}
          currentCustomerId={customerId}
          mode="apply"
          title="تغيير الترتيب داخل المنطقة"
          onApplied={fetchCustomer}
        />
      )}
      <div
        className="update-toggle"
        onClick={() => setFormVisible(!formVisible)}
      >
        تعديل الزبون؟
      </div>
      {formVisible && (
        <form className="update-customer-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={updatedInfo.name}
            placeholder="الاسم الجديد"
            onChange={handleChange}
          />
          <input
            type="text"
            name="phone"
            value={updatedInfo.phone}
            placeholder="رقم الهاتف الجديد"
            onChange={handleChange}
          />
          <input
            type="text"
            name="address"
            value={updatedInfo.address}
            placeholder="العنوان الجديد"
            onChange={handleChange}
          />
          <br />
          <SelectInput
            label="المنطقة:"
            name="areaId"
            value={updatedInfo.areaId._id}
            options={areas.map((area) => ({
              value: area._id,
              label: area.name,
            }))}
            onChange={handleChange}
          />
          {/* Placement mode selector */}
          <div className="placement-block">
            <label className="block-label">تعيين الترتيب:</label>

            <div className="radio-row">
              <label>
                <input
                  type="radio"
                  name="placementMode"
                  checked={placementMode === "none"}
                  onChange={() => setPlacementMode("none")}
                />{" "}
                بدون تغيير الترتيب
              </label>

              <label>
                <input
                  type="radio"
                  name="placementMode"
                  checked={placementMode === "sequence"}
                  onChange={() => setPlacementMode("sequence")}
                />{" "}
                رقم ترتيب محدد
              </label>

              <label>
                <input
                  type="radio"
                  name="placementMode"
                  checked={placementMode === "relative"}
                  onChange={() => setPlacementMode("relative")}
                />{" "}
                نسبةً لزبون آخر في نفس المنطقة
              </label>
            </div>

            {placementMode === "sequence" && (
              <div className="sequence-row">
                <input
                  type="number"
                  min={1}
                  value={sequenceNumber}
                  onChange={(e) =>
                    setSequenceNumber(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="أدخل رقم الترتيب (مثال 25)"
                />
                <div className="hint">
                  إن كان الرقم مستخدمًا، سنضبط ترتيب المنطقة بإزاحة البقية
                  تلقائيًا.
                </div>
              </div>
            )}

            {placementMode === "relative" && (
              <div className="relative-row">
                <select
                  value={relPosition}
                  onChange={(e) => setRelPosition(e.target.value as any)}
                >
                  <option value="__START__">في البداية</option>
                  <option value="__END__">في النهاية</option>
                  <option value="before">قبل</option>
                  <option value="after">بعد</option>
                </select>

                {(relPosition === "before" || relPosition === "after") && (
                  <select
                    value={relAnchorId}
                    onChange={(e) => setRelAnchorId(e.target.value)}
                  >
                    <option value="">اختر الزبون المرجعي</option>
                    {areaCustomers
                      .filter((c) => c._id !== customerId) // لا تختَر نفسك
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} {c.sequence ? `(#${c.sequence})` : ""}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            )}
          </div>

          <button type="submit">تحديث الزبون</button>
        </form>
      )}
    </div>
  );
}

export default UpdateCustomer;
