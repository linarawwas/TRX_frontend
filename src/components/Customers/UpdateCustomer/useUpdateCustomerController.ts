import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  setCustomerId,
  setCustomerName,
  setCustomerPhoneNb,
} from "../../../redux/Order/action";
import { fetchAndCacheCustomerInvoice } from "../../../utils/apiHelpers";
import { API_BASE } from "../../../config/api";
import { RootState } from "../../../redux/store";

type Area = { _id: string; name: string };
type CustomerLite = { _id: string; name: string; sequence?: number | null };

const trimValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const initials = (name?: string) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "??";

export function useUpdateCustomerController() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customerId: routeCustomerId } = useParams();
  const customerId = routeCustomerId ?? "";

  const token = useSelector((s: RootState) => s.user.token);
  const companyId = useSelector((s: RootState) => s.user.companyId);
  const isAdmin = useSelector((s: RootState) => s.user?.isAdmin);
  const shipmentId = useSelector((s: RootState) => s.shipment?._id);

  const [openEdit, setOpenEdit] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [customerData, setCustomerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceReady, setInvoiceReady] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [showRestoreOptions, setShowRestoreOptions] = useState(false);
  const [restoreSequence, setRestoreSequence] = useState<number | "">("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState<"info" | "invoices" | "area">("info");
  const [updatedInfo, setUpdatedInfo] = useState({
    _id: "",
    name: "",
    phone: "",
    address: "",
    areaId: "",
    companyId,
    hasDiscount: false,
    valueAfterDiscount: 0,
    discountCurrency: "",
    noteAboutCustomer: "",
    placement: "",
  });
  const [areaCustomers, setAreaCustomers] = useState<CustomerLite[]>([]);
  const [placementLoading, setPlacementLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any> | null>(
    null
  );

  const fetchAreas = useCallback(() => {
    fetch(`${API_BASE}/api/areas/company`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setAreas)
      .catch((e) => console.error("Areas load failed:", e));
  }, [token]);

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch customer");
      const data = await res.json();
      setCustomerData(data);
      await fetchAndCacheCustomerInvoice(customerId || "", token || "");
      setInvoiceReady(true);
    } catch (e) {
      console.error("Fetch error:", e);
      setInvoiceReady(true);
    } finally {
      setLoading(false);
    }
  }, [customerId, token]);

  useEffect(() => {
    if (customerId) dispatch(setCustomerId(customerId));
  }, [customerId, dispatch]);

  useEffect(() => {
    fetchAreas();
    fetchCustomer();
  }, [fetchAreas, fetchCustomer]);

  const currentAreaId = customerData?.areaId?._id || "";
  const areaChanged = !!updatedInfo.areaId && updatedInfo.areaId !== currentAreaId;
  const targetAreaId = updatedInfo.areaId || currentAreaId;

  useEffect(() => {
    if (!targetAreaId) {
      setAreaCustomers([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setPlacementLoading(true);
        const res = await fetch(
          `${API_BASE}/api/customers/area/${targetAreaId}/active`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch customers");
        const list: CustomerLite[] = await res.json();
        if (cancelled) return;
        const filtered = Array.isArray(list)
          ? list.filter((c) => String(c._id) !== String(customerId))
          : [];
        const sorted = [...filtered].sort((a, b) => {
          const sa = a.sequence ?? Number.POSITIVE_INFINITY;
          const sb = b.sequence ?? Number.POSITIVE_INFINITY;
          if (sa !== sb) return sa - sb;
          return (a.name || "").localeCompare(b.name || "", "ar");
        });
        setAreaCustomers(sorted);
      } catch (err) {
        if (cancelled) return;
        console.error("Unable to load placement options", err);
        setAreaCustomers([]);
        toast.error("تعذر تحميل زبائن المنطقة للترتيب");
      } finally {
        if (!cancelled) setPlacementLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [customerId, targetAreaId, token]);

  const placementOptions = useMemo(() => {
    const base = [
      { value: "__START__", label: "في بداية القائمة" },
      { value: "__END__", label: "في نهاية القائمة" },
    ];
    if (!targetAreaId || areaCustomers.length === 0) return base;
    return [
      ...base,
      ...areaCustomers.map((customer) => ({
        value: customer._id,
        label: `${customer.sequence ? `#${customer.sequence} — ` : ""}${customer.name}`,
      })),
    ];
  }, [areaCustomers, targetAreaId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phone" && !/^\d*$/.test(value)) {
      return toast.error("أدخل أرقام فقط");
    }
    if (name === "areaId") {
      setUpdatedInfo((prev) => ({
        ...prev,
        areaId: value,
        placement:
          value && customerData?.areaId?._id === value ? prev.placement : "__END__",
      }));
      return;
    }
    if (name === "placement") {
      setUpdatedInfo((prev) => ({ ...prev, placement: value }));
      return;
    }
    setUpdatedInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const changes: Record<string, any> = {};

    if (trimValue(updatedInfo.name)) changes.name = trimValue(updatedInfo.name);
    if (trimValue(updatedInfo.phone)) changes.phone = trimValue(updatedInfo.phone);
    if (trimValue(updatedInfo.address)) {
      changes.address = trimValue(updatedInfo.address);
    }
    if (areaChanged && !updatedInfo.placement) {
      return toast.error("عيّن ترتيبًا جديدًا داخل المنطقة قبل الحفظ");
    }
    if (trimValue(updatedInfo.areaId) && areaChanged) {
      changes.areaId = trimValue(updatedInfo.areaId);
    }
    if (updatedInfo.placement) {
      changes.placement = updatedInfo.placement;
    }
    if (Object.keys(changes).length === 0) {
      return toast.info("لا توجد تغييرات لإرسالها");
    }

    setPendingChanges(changes);
    setConfirmOpen(true);
  };

  const submitUpdate = async () => {
    if (!pendingChanges) return;
    setIsMutating(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/${customerId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pendingChanges),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "فشل التحديث");
      }
      toast.success("تم التحديث بنجاح");
      setEditOpen(false);
      setUpdatedInfo((prev) => ({
        ...prev,
        name: "",
        phone: "",
        address: "",
        areaId: "",
        placement: "",
      }));
      setConfirmOpen(false);
      setPendingChanges(null);
      fetchCustomer();
    } catch (e: any) {
      toast.error(e?.message || "فشل التحديث");
    } finally {
      setIsMutating(false);
    }
  };

  const handleRecordOrder = () => {
    if (!customerData?._id) return toast.error("بيانات الزبون غير متوفرة");
    if (!shipmentId) return toast.error("ابدأ الشحنة أولاً قبل تسجيل الطلب");
    dispatch(setCustomerId(customerData._id));
    dispatch(setCustomerName(customerData.name || ""));
    dispatch(setCustomerPhoneNb(customerData.phone || ""));
    navigate("/recordOrderforCustomer", { state: { isExternal: true } });
  };

  const handleDeactivate = async () => {
    if (!customerId) return;
    if (!window.confirm("هل تريد إيقاف هذا الزبون؟")) return;
    setIsMutating(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/${customerId}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "تعذر إيقاف الزبون");
      toast.success("تم إيقاف الزبون");
      setShowRestoreOptions(false);
      setRestoreSequence("");
      fetchCustomer();
    } catch (e: any) {
      toast.error(e?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };

  const restoreRequest = async (body: any) => {
    const res = await fetch(`${API_BASE}/api/customers/${customerId}/restore`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  };

  const handleRestoreAuto = async () => {
    if (!customerId) return;
    setIsMutating(true);
    try {
      const areaId = customerData?.areaId?._id;
      const { res, data } = await restoreRequest({ areaId });
      if (res.ok) {
        toast.success("تم تنشيط الزبون");
        setShowRestoreOptions(false);
        setRestoreSequence("");
        fetchCustomer();
        return;
      }
      if (res.status === 409) {
        toast.warn("رقم الترتيب مستخدم. اختر رقمًا آخر.");
        setShowRestoreOptions(true);
        return;
      }
      throw new Error(data?.error || "تعذر تنشيط الزبون");
    } catch (e: any) {
      toast.error(e?.message || "فشل العملية");
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
          return toast.warn("هذا الرقم ما زال مستخدمًا. جرّب رقمًا مختلفًا.");
        }
        throw new Error(data?.error || "تعذر تنشيط الزبون");
      }
      toast.success("تم تنشيط الزبون وتعيين الترتيب");
      setShowRestoreOptions(false);
      setRestoreSequence("");
      fetchCustomer();
    } catch (e: any) {
      toast.error(e?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };

  const openDeleteModal = () => {
    if (!isAdmin) return toast.warn("هذه العملية للمشرف فقط");
    setDeleteStep(1);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => setShowDeleteModal(false);

  const performHardDelete = async () => {
    setIsMutating(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/${customerId}/hard`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          toast.error(data?.error || "لا يمكن الحذف: لدى الزبون طلبات مرتبطة.");
        } else {
          toast.error(data?.error || "فشل حذف الزبون");
        }
        return;
      }
      toast.success("تم حذف الزبون نهائيًا");
      setShowDeleteModal(false);
      setTimeout(() => navigate(-1), 300);
    } catch (e: any) {
      toast.error(e?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };

  const avatarText = useMemo(
    () => initials(customerData?.name),
    [customerData?.name]
  );

  return {
    areas,
    avatarText,
    companyId,
    confirmOpen,
    customerData,
    customerId,
    deleteStep,
    editOpen,
    fetchCustomer,
    handleChange,
    handleDeactivate,
    handleRecordOrder,
    handleRestoreAuto,
    handleRestoreWithSequence,
    handleSubmit,
    invoiceReady,
    isAdmin,
    isMutating,
    loading,
    openDeleteModal,
    openEdit,
    pendingChanges,
    performHardDelete,
    placementLoading,
    placementOptions,
    restoreSequence,
    setConfirmOpen,
    setDeleteStep,
    setEditOpen,
    setOpenEdit,
    setPendingChanges,
    setRestoreSequence,
    shipmentId,
    showDeleteModal,
    showRestoreOptions,
    submitUpdate,
    tab,
    targetAreaId,
    token,
    updatedInfo,
    setTab,
    setShowDeleteModal,
    closeDeleteModal,
  };
}
