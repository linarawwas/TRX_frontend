import React, { useEffect, useState } from "react";
import "./CreateExternalShipment.css";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getCustomerInvoicesFromDB,
  getPendingRequests,
} from "../../../utils/indexedDB";

interface Area {
  _id: string;
  name: string;
}
interface Customer {
  _id: string;
  name: string;
}
interface Sums {
  deliveredSum: number;
  returnedSum: number;
  bottlesLeft: number;
  totalSum: number;
}

export default function CreateExternalShipment(): JSX.Element {
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.user.token);
  const productId = useSelector((state: any) => state.order.product_id);

  const [areas, setAreas] = useState<Area[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [invoice, setInvoice] = useState<Sums | null>(null);

  const [form, setForm] = useState({
    delivered: 0,
    returned: 0,
    paidUSD: 0,
    paidLBP: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchWithAuth = async (url: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  // Get Beirut-local Y/M/D and weekday
  function getBeirutDateParts() {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Beirut",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [y, m, d] = fmt
      .format(now)
      .split("-")
      .map((n) => parseInt(n, 10));
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Beirut",
      weekday: "long",
    }).format(now);
    return { year: y, month: m, day: d, weekday };
  }

  const fetchAreas = async () => {
    try {
      const res = await fetchWithAuth(`https://trx-api.linarawas.com/api/areas`);
      const data = await res.json();
      setAreas(data);
    } catch {
      toast.error("❌ فشل تحميل المناطق");
    }
  };

  const fetchCustomers = async (areaId: string) => {
    try {
      const res = await fetchWithAuth(
        `https://trx-api.linarawas.com/api/customers/area/${areaId}`
      );
      const data = await res.json();
      setCustomers(data);
    } catch {
      toast.error("❌ فشل تحميل الزبائن");
    }
  };

  const loadCustomerInvoice = async (custId: string) => {
    try {
      const cached = await getCustomerInvoicesFromDB(custId);
      const pending = await getPendingRequests();
      const custPendingOrders = pending
        .filter(
          (r: any) =>
            r.url?.includes("/api/orders") &&
            JSON.parse(r.options?.body || "{}")?.customerid === custId
        )
        .map((r: any) => JSON.parse(r.options.body));

      if (cached) {
        let delivered = cached.deliveredSum || 0;
        let returned = cached.returnedSum || 0;
        let total = cached.totalSum || 0;
        for (const o of custPendingOrders) {
          delivered += o.delivered || 0;
          returned += o.returned || 0;
          total += o.total || 0;
        }
        setInvoice({
          deliveredSum: delivered,
          returnedSum: returned,
          bottlesLeft: delivered - returned,
          totalSum: total,
        });
      } else {
        setInvoice(null);
      }
    } catch {
      toast.warn("⚠️ فشل تحميل بيانات الزبون");
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);
  useEffect(() => {
    if (selectedArea) fetchCustomers(selectedArea);
  }, [selectedArea]);
  useEffect(() => {
    if (selectedCustomer) loadCustomerInvoice(selectedCustomer);
  }, [selectedCustomer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value === "" ? 0 : Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!selectedArea || !selectedCustomer) {
      toast.error("❗ الرجاء اختيار منطقة وزبون");
      return;
    }
    if (!Number.isFinite(form.delivered) || form.delivered <= 0) {
      toast.error("❗ أدخل عدد القناني المسلّمة (رقم صحيح)");
      return;
    }
    if (!productId) {
      toast.error("❗ المنتج غير محدد");
      return;
    }

    setLoading(true);
    try {
      // Resolve Beirut-local weekday → dayId
      const { day, month, year, weekday } = getBeirutDateParts();
      const dayRes = await fetchWithAuth(
        `https://trx-api.linarawas.com/api/days/name/${weekday}`
      );
      const dayData = await dayRes.json();
      const dayId = dayData?.[0]?._id;
      if (!dayId) throw new Error("فشل في تحديد اليوم");

      // 1) Create shipment (backend derives companyId, sequence, dateKey/stamp)
      const shipmentPayload = {
        dayId,
        type: 2, // external
        carryingForDelivery: Number(form.delivered) || 0,
        date: { day, month, year }, // ✅ wrap date
        // ❌ do NOT send companyId/areaId/sequence/dateKey/dateStamp
      };

      const shipmentRes = await fetch("https://trx-api.linarawas.com/api/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shipmentPayload),
      });
      const shipment = await shipmentRes.json();
      if (!shipmentRes.ok || !shipment?._id) {
        throw new Error(shipment?.error || "❌ فشل إنشاء الشحنة");
      }

      // 2) Create order (backend derives exchange rate & companyId)
      const payments: Array<{ amount: number; currency: "USD" | "LBP" }> = [];
      if (Number(form.paidUSD) > 0)
        payments.push({ amount: Number(form.paidUSD), currency: "USD" });
      if (Number(form.paidLBP) > 0)
        payments.push({ amount: Number(form.paidLBP), currency: "LBP" });

      const orderPayload = {
        delivered: Number(form.delivered),
        returned: Number(form.returned) || 0,
        productId,
        customerid: selectedCustomer,
        shipmentId: shipment._id,
        payments, // ✅ NO exchangeRate fields; server uses company’s rate
        // ❌ do NOT send companyId
      };

      const orderRes = await fetch("https://trx-api.linarawas.com/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        throw new Error(
          orderData?.error || orderData?.message || "فشل تسجيل الطلب"
        );
      }

      toast.success("✅ تم تسجيل الطلب والشحنة بنجاح");
      navigate("/");
    } catch (err: any) {
      console.error("❌ Error in external shipment flow:", err);
      toast.error(err?.message || "⚠️ حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="external-order-page" dir="rtl">
      <ToastContainer />
      <h2>🚚 تسجيل </h2>
      <form onSubmit={handleSubmit} className="external-order-form">
        <label>اختر المنطقة</label>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          required
        >
          <option value="">-- اختر --</option>
          {areas.map((area) => (
            <option key={area._id} value={area._id}>
              {area.name}
            </option>
          ))}
        </select>

        {selectedArea && (
          <>
            <label>اختر الزبون</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
            >
              <option value="">-- اختر --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </>
        )}

        {invoice && (
          <div className="external-invoice-box">
            {!navigator.onLine && (
              <div className="offline-warning">
                ⚠️ هذه المعلومات قد تكون قديمة
              </div>
            )}
            <div>
              📦 المتبقي عند الزبون: <strong>{invoice.bottlesLeft}</strong>
            </div>
            <div>
              💰 الحساب: <strong>{invoice.totalSum.toFixed(2)}</strong> $
            </div>
          </div>
        )}

        <label>عدد القناني المسلّمة</label>
        <input
          type="number"
          name="delivered"
          min={0}
          value={form.delivered}
          onChange={handleChange}
        />

        <label>عدد القناني المرجعة</label>
        <input
          type="number"
          name="returned"
          min={0}
          value={form.returned}
          onChange={handleChange}
        />

        <fieldset className="payment-section">
          <legend>💰 الدفع</legend>
          <label>💵 بالدولار</label>
          <input
            type="number"
            name="paidUSD"
            min={0}
            step="0.01"
            value={form.paidUSD}
            onChange={handleChange}
          />
          <label>💴 بالليرة اللبنانية</label>
          <input
            type="number"
            name="paidLBP"
            min={0}
            step="1000"
            value={form.paidLBP}
            onChange={handleChange}
          />
        </fieldset>

        <button type="submit" disabled={loading}>
          {loading ? "⏳ جاري الإرسال..." : "✔️ تسجيل"}
        </button>
      </form>
    </div>
  );
}
