import React, { useEffect, useState } from "react";
import "./AssignDistributorInline.css";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import {
  type DistributorRecord,
  listDistributors,
  assignCustomerToDistributor,
  unassignCustomerFromDistributor,
} from "../../features/distributors/apiDistributors";

const AssignDistributorInline: React.FC<{
  customerId: string;
  currentDistributorId?: string | null;
}> = ({ customerId, currentDistributorId }) => {
  const token = useSelector((s: RootState) => s.user.token) as string;
  const [list, setList] = useState<DistributorRecord[]>([]);
  const [sel, setSel] = useState<string>(
    currentDistributorId ? String(currentDistributorId) : ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const rows = await listDistributors(token);
        setList(rows || []);
      } catch (e: any) {
        toast.error(e?.message || "فشل تحميل الموزعين");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleSave = async () => {
    try {
      if (!sel) {
        await unassignCustomerFromDistributor(token, customerId);
        toast.success("تم إلغاء الربط");
        return;
      }
      await assignCustomerToDistributor(token, customerId, sel);
      toast.success("تم الربط");
    } catch (e: any) {
      toast.error(e?.message || "فشل العملية");
    }
  };

  return (
    <div className="assign-dist" dir="rtl">
      <div className="ad-title">الموزّع</div>
      <div className="ad-row">
        <select
          value={sel}
          onChange={(e) => setSel(e.target.value)}
          disabled={loading}
          aria-label="اختر موزّعًا"
        >
          <option value="">{loading ? "جارٍ التحميل…" : "— لا يوجد —"}</option>
          {list.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <button className="btn primary" onClick={handleSave} disabled={loading}>
          حفظ
        </button>
      </div>
    </div>
  );
};

export default AssignDistributorInline;
