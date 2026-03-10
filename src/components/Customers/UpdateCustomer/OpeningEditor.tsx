// OpeningEditor.tsx (or inline above UpdateCustomer)
import * as React from "react";
import { toast } from "react-toastify";
import "./OpeningEditor.css";
import { API_BASE } from "../../../config/api";
export function OpeningEditor({
  customerId,
  token,
  onDone,
}: {
  customerId: string;
  token: string;
  onDone: () => void;
}) {
  const [bottles, setBottles] = React.useState<string>(""); // leave empty; admin types desired final values
  const [balance, setBalance] = React.useState<string>("");
  const allowBump = true;
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bottles && !balance) {
      toast.info("أدخل قيمة واحدة على الأقل");
      return;
    }

    // double confirm
    if (
      !window.confirm(
        "تنبيه: سيتم تعديل الأمر الافتتاحي لهذا الزبون حسب القيم المدخلة. هل أنت متأكد/ة؟"
      )
    )
      return;
    if (
      !window.confirm(
        "تأكيد أخير: هذه العملية لا تؤثر على الطلبات الحقيقية ولكنها تغيّر الرصيد/القناني الافتتاحية. متابعة؟"
      )
    )
      return;

    setBusy(true);
    try {
      const body: any = {};
      if (bottles !== "") body.bottlesLeft = Number(bottles);
      if (balance !== "") body.balanceUSD = Number(balance);
      body.allowCheckoutBump = !!allowBump;

      const res = await fetch(
        `${API_BASE}/api/customers/${customerId}/opening`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "فشل تعديل الافتتاحي");
        return;
      }
      toast.success("تم تعديل الرصيد/القناني الافتتاحية");
      onDone();
    } catch (err: any) {
      toast.error("فشل العملية");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        className="ucx-note ucx-note--warn"
        role="note"
        id="opening-edit-note"
      >
        هذه الأداة مخصّصة لتصحيح فروقات صغيرة فقط:
        <strong> فرق القناني المسموح به لا يتجاوز قنّتين (±2)</strong>. يمكن
        تعديل <strong>الرصيد الافتتاحي (USD)</strong> لأي قيمة. لا يمكن التعديل
        على الرصيد العام، فقط على الرصيد الإفتتاحي، لأن الرصيد العام مجموع طلبات
        الزبون، إذا كان هناك خطأ في تسجيل أي طلب، الرجاء التوجه لكشف الحساب
        وتعديل الطلب الذي يحتوي الخطأ. من خلال صفحة تعديل الطلب والتفاصيل.
        بإمكانك التعديل على الرصيد الإفتتاحي والإطلاع عليه من خلال{" "}
        <strong>صفحة كشف الحساب.</strong>
      </div>
      <form className="ucx-open" onSubmit={submit}>
        <div className="ucx-open__grid">
          <label className="ucx-open__label">
            القناني المتبقية (الرقم المطلوب إظهاره)
            <input
              className="ucx-open__input"
              type="number"
              min={0}
              value={bottles}
              onChange={(e) => setBottles(e.target.value)}
              placeholder="مثال: 3"
            />
          </label>
          <label className="ucx-open__label">
            الرصيد المستحق USD (الرقم المطلوب إظهاره)
            <input
              className="ucx-open__input"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="مثال: 8.00"
            />
          </label>
        </div>
        <div className="ucx-open__actions">
          <button className="ucx-btn primary" disabled={busy}>
            {busy ? "جارٍ الحفظ…" : "حفظ"}
          </button>
        </div>
      </form>
    </>
  );
}
