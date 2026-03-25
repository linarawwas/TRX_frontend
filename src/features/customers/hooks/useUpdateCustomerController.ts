import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  setCustomerId,
  setCustomerName,
  setCustomerPhoneNb,
} from "../../../redux/Order/action";
import {
  deactivateCustomer,
  fetchActiveCustomersByArea,
  fetchAndCacheCustomerInvoice,
  fetchCustomerById,
  hardDeleteCustomer,
  restoreCustomer,
  type ActiveAreaCustomer,
  type CustomerDetail,
  updateCustomerById,
} from "../apiCustomers";
import { fetchAreasByCompany } from "../../areas/apiAreas";
import { sortCustomersBySequence } from "../../areas/utils/sortCustomers";
import type { RootState } from "../../../redux/store";

type Area = { _id: string; name: string };
type CustomerLite = ActiveAreaCustomer;

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
    if (!token) return;
    fetchAreasByCompany(token)
      .then((result) => {
        if (result.error) {
          console.error("Areas load failed:", result.error);
          return;
        }
        setAreas((result.data || []) as Area[]);
      })
      .catch((e) => console.error("Areas load failed:", e));
  }, [token]);

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    if (!token) {
      setLoading(false);
      return;
    }
    const result = await fetchCustomerById(token, customerId);
    if (result.error || !result.data) {
      console.error("Fetch error:", result.error);
      setInvoiceReady(true);
      setLoading(false);
      return;
    }
    setCustomerData(result.data as CustomerDetail);
    await fetchAndCacheCustomerInvoice(customerId || "", token || "");
    setInvoiceReady(true);
    setLoading(false);
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
      setPlacementLoading(true);
      if (!token) {
        if (!cancelled) setPlacementLoading(false);
        return;
      }
      const result = await fetchActiveCustomersByArea(token, targetAreaId);
      if (cancelled) return;
      if (result.error) {
        console.error("Unable to load placement options", result.error);
        setAreaCustomers([]);
        toast.error("تعذر تحميل زبائن المنطقة للترتيب");
        setPlacementLoading(false);
        return;
      }
      const filtered = Array.isArray(result.data)
        ? result.data.filter((c) => String(c._id) !== String(customerId))
        : [];
      const sorted = sortCustomersBySequence(filtered);
      setAreaCustomers(sorted);
      setPlacementLoading(false);
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
    if (!token) {
      toast.error("Missing auth token");
      setIsMutating(false);
      return;
    }
    const result = await updateCustomerById(token, customerId, pendingChanges);
    if (result.error) {
      toast.error(result.error || "فشل التحديث");
      setIsMutating(false);
      return;
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
    setIsMutating(false);
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
    if (!token) {
      toast.error("Missing auth token");
      setIsMutating(false);
      return;
    }
    const result = await deactivateCustomer(token, customerId);
    if (result.error) {
      toast.error(result.error || "فشل العملية");
      setIsMutating(false);
      return;
    }
    toast.success("تم إيقاف الزبون");
    setShowRestoreOptions(false);
    setRestoreSequence("");
    fetchCustomer();
    setIsMutating(false);
  };

  const restoreRequest = async (body: any) => {
    if (!token) return { data: null, error: "Missing auth token" };
    return restoreCustomer(token, customerId, body || {});
  };

  const handleRestoreAuto = async () => {
    if (!customerId) return;
    setIsMutating(true);
    const areaId = customerData?.areaId?._id;
    const result = await restoreRequest({ areaId });
    if (result.error) {
      toast.error(result.error || "فشل العملية");
      setIsMutating(false);
      return;
    }
    toast.success("تم تنشيط الزبون");
    setShowRestoreOptions(false);
    setRestoreSequence("");
    fetchCustomer();
    setIsMutating(false);
  };

  const handleRestoreWithSequence = async (e: FormEvent) => {
    e.preventDefault();
    if (restoreSequence === "" || Number(restoreSequence) <= 0) {
      toast.error("أدخل رقم ترتيب صحيح (1 أو أكبر)");
      return;
    }
    setIsMutating(true);
    const areaId = customerData?.areaId?._id;
    const result = await restoreRequest({
      areaId,
      sequence: Number(restoreSequence),
    });
    if (result.error) {
      toast.error(result.error || "فشل العملية");
      setIsMutating(false);
      return;
    }
    toast.success("تم تنشيط الزبون وتعيين الترتيب");
    setShowRestoreOptions(false);
    setRestoreSequence("");
    fetchCustomer();
    setIsMutating(false);
  };

  const openDeleteModal = () => {
    if (!isAdmin) return toast.warn("هذه العملية للمشرف فقط");
    setDeleteStep(1);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => setShowDeleteModal(false);

  const performHardDelete = async () => {
    setIsMutating(true);
    if (!token) {
      toast.error("Missing auth token");
      setIsMutating(false);
      return;
    }
    const result = await hardDeleteCustomer(token, customerId);
    if (result.error) {
      toast.error(result.error || "فشل العملية");
      setIsMutating(false);
      return;
    }
    toast.success("تم حذف الزبون نهائيًا");
    setShowDeleteModal(false);
    setTimeout(() => navigate(-1), 300);
    setIsMutating(false);
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
