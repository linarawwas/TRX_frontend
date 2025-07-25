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
  const companyId = useSelector((state: any) => state.user.companyId);
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

  const fetchWithAuth = async (url: string) => {
    return await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const fetchAreas = async () => {
    try {
      const res = await fetchWithAuth(
        `https://trx-api.linarawas.com/api/areas/company/${companyId}`
      );
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

        for (const order of custPendingOrders) {
          delivered += order.delivered || 0;
          returned += order.returned || 0;
          total += order.total || 0;
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedArea)
      return toast.error("❗ الرجاء اختيار منطقة وزبون");
    if (!form.delivered) return toast.error("❗ أدخل عدد القناني المسلّمة");

    setLoading(true);
    try {
      const now = new Date();
      const dayName = now.toLocaleDateString("en-US", { weekday: "long" });

      const dayRes = await fetchWithAuth(
        `https://trx-api.linarawas.com/api/days/name/${dayName}`
      );
      const dayData = await dayRes.json();
      const dayId = dayData?.[0]?._id;
      if (!dayId) throw new Error("فشل في تحديد اليوم");

      const shipmentPayload = {
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        type: 2,
        dayId,
        areaId: selectedArea,
        companyId,
        carryingForDelivery: parseInt(form.delivered.toString()) || 0,
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
      if (!shipment._id) throw new Error("❌ فشل إنشاء الشحنة");

      const payments = [];
      if (parseFloat(form.paidUSD.toString()) > 0) {
        payments.push({
          amount: parseFloat(form.paidUSD.toString()),
          currency: "USD",
          exchangeRate: "6878aa9ac9f1a18731a5b8a4",
        });
      }
      if (parseFloat(form.paidLBP.toString()) > 0) {
        payments.push({
          amount: parseFloat(form.paidLBP.toString()),
          currency: "LBP",
          exchangeRate: "6878aa9ac9f1a18731a5b8a4",
        });
      }

      const orderPayload = {
        delivered: parseInt(form.delivered.toString()),
        returned: parseInt(form.returned.toString()) || 0,
        productId,
        customerid: selectedCustomer,
        shipmentId: shipment._id,
        companyId,
        payments,
      };

      const orderRes = await fetch("https://trx-api.linarawas.com/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData?.message || "فشل تسجيل الطلب");
      }

      toast.success("✅ تم تسجيل الطلب والشحنة بنجاح");
      navigate("/");
    } catch (err: any) {
      console.error("❌ Error in external shipment flow:", err);
      toast.error(err.message || "⚠️ حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="external-order-page" dir="rtl">
      <ToastContainer />
      <h2>🚚 تسجيل طلب خارجي</h2>
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
            value={form.paidUSD}
            onChange={handleChange}
          />

          <label>💴 بالليرة اللبنانية</label>
          <input
            type="number"
            name="paidLBP"
            min={0}
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
