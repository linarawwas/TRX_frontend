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
  type RestoreCustomerPayload,
  updateCustomerById,
  type UpdateCustomerPayload,
} from "../apiCustomers";
import { fetchAreasByCompany } from "../../areas/apiAreas";
import { sortCustomersBySequence } from "../../areas/utils/sortCustomers";
import type { RootState } from "../../../redux/store";
import { createLogger } from "../../../utils/logger";
import { t } from "../../../utils/i18n";

type Area = { _id: string; name: string };
type CustomerLite = ActiveAreaCustomer;

const logger = createLogger("update-customer");

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
  const [customerData, setCustomerData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
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
  const [pendingChanges, setPendingChanges] = useState<UpdateCustomerPayload | null>(
    null
  );

  const fetchAreas = useCallback(() => {
    if (!token) return;
    fetchAreasByCompany(token)
      .then((result) => {
        if (result.error) {
          logger.error("fetchAreasByCompany failed", { message: result.error });
          return;
        }
        setAreas((result.data || []) as Area[]);
      })
      .catch((e) => {
        logger.error("fetchAreasByCompany failed", {
          message: e instanceof Error ? e.message : String(e),
        });
      });
  }, [token]);

  const fetchCustomer = useCallback(async () => {
    setFetchError(null);
    setLoading(true);
    if (!token) {
      setLoading(false);
      return;
    }
    const result = await fetchCustomerById(token, customerId);
    if (result.error || !result.data) {
      logger.error("fetchCustomerById failed", {
        customerId,
        message: result.error,
      });
      setFetchError(result.error || t("updateCustomer.loadError"));
      setCustomerData(null);
      setInvoiceReady(true);
      setLoading(false);
      return;
    }
    setCustomerData(result.data);
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

  const currentAreaId =
    typeof customerData?.areaId === "object" && customerData?.areaId
      ? customerData.areaId._id
      : "";
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
        logger.error("fetchActiveCustomersByArea failed", {
          targetAreaId,
          message: result.error,
        });
        setAreaCustomers([]);
        toast.error(t("updateCustomer.toast.placementLoadFailed"));
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
      { value: "__START__", label: t("updateCustomer.placement.listStart") },
      { value: "__END__", label: t("updateCustomer.placement.listEnd") },
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
      return toast.error(t("updateCustomer.toast.phoneDigitsOnly"));
    }
    if (name === "areaId") {
      setUpdatedInfo((prev) => ({
        ...prev,
        areaId: value,
        placement:
          value && currentAreaId === value ? prev.placement : "__END__",
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
    const changes: UpdateCustomerPayload = {};

    if (trimValue(updatedInfo.name)) changes.name = trimValue(updatedInfo.name);
    if (trimValue(updatedInfo.phone)) changes.phone = trimValue(updatedInfo.phone);
    if (trimValue(updatedInfo.address)) {
      changes.address = trimValue(updatedInfo.address);
    }
    if (areaChanged && !updatedInfo.placement) {
      return toast.error(t("updateCustomer.toast.setPlacementBeforeSave"));
    }
    if (trimValue(updatedInfo.areaId) && areaChanged) {
      changes.areaId = trimValue(updatedInfo.areaId);
    }
    if (updatedInfo.placement) {
      changes.placement = updatedInfo.placement;
    }
    if (Object.keys(changes).length === 0) {
      return toast.info(t("updateCustomer.toast.noChanges"));
    }

    setPendingChanges(changes);
    setConfirmOpen(true);
  };

  const submitUpdate = async () => {
    if (!pendingChanges) return;
    setIsMutating(true);
    if (!token) {
      toast.error(t("updateCustomer.toast.missingToken"));
      setIsMutating(false);
      return;
    }
    const result = await updateCustomerById(token, customerId, pendingChanges);
    if (result.error) {
      toast.error(result.error || t("updateCustomer.toast.updateFailed"));
      setIsMutating(false);
      return;
    }
    toast.success(t("updateCustomer.toast.updateSuccess"));
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
    if (!customerData?._id) {
      return toast.error(t("updateCustomer.toast.customerMissing"));
    }
    if (!shipmentId) {
      return toast.error(t("updateCustomer.toast.startShipmentFirst"));
    }
    dispatch(setCustomerId(customerData._id));
    dispatch(setCustomerName(customerData.name || ""));
    dispatch(setCustomerPhoneNb(customerData.phone || ""));
    navigate("/recordOrderforCustomer", { state: { isExternal: true } });
  };

  const handleDeactivate = async () => {
    if (!customerId) return;
    if (!window.confirm(t("updateCustomer.confirm.deactivate"))) return;
    setIsMutating(true);
    if (!token) {
      toast.error(t("updateCustomer.toast.missingToken"));
      setIsMutating(false);
      return;
    }
    const result = await deactivateCustomer(token, customerId);
    if (result.error) {
      toast.error(result.error || t("updateCustomer.toast.operationFailed"));
      setIsMutating(false);
      return;
    }
    toast.success(t("updateCustomer.toast.deactivateSuccess"));
    setShowRestoreOptions(false);
    setRestoreSequence("");
    fetchCustomer();
    setIsMutating(false);
  };

  const restoreRequest = async (body: RestoreCustomerPayload) => {
    if (!token) return { data: null, error: t("updateCustomer.toast.missingToken") };
    return restoreCustomer(token, customerId, body);
  };

  const handleRestoreAuto = async () => {
    if (!customerId) return;
    setIsMutating(true);
    const areaId =
      typeof customerData?.areaId === "object" && customerData?.areaId
        ? customerData.areaId._id
        : undefined;
    const result = await restoreRequest({ areaId });
    if (result.error) {
      toast.error(result.error || t("updateCustomer.toast.operationFailed"));
      setIsMutating(false);
      return;
    }
    toast.success(t("updateCustomer.toast.restoreSuccess"));
    setShowRestoreOptions(false);
    setRestoreSequence("");
    fetchCustomer();
    setIsMutating(false);
  };

  const handleRestoreWithSequence = async (e: FormEvent) => {
    e.preventDefault();
    if (restoreSequence === "" || Number(restoreSequence) <= 0) {
      toast.error(t("updateCustomer.toast.invalidSequence"));
      return;
    }
    setIsMutating(true);
    const areaId =
      typeof customerData?.areaId === "object" && customerData?.areaId
        ? customerData.areaId._id
        : undefined;
    const result = await restoreRequest({
      areaId,
      sequence: Number(restoreSequence),
    });
    if (result.error) {
      toast.error(result.error || t("updateCustomer.toast.operationFailed"));
      setIsMutating(false);
      return;
    }
    toast.success(t("updateCustomer.toast.restoreWithSequenceSuccess"));
    setShowRestoreOptions(false);
    setRestoreSequence("");
    fetchCustomer();
    setIsMutating(false);
  };

  const openDeleteModal = () => {
    if (!isAdmin) return toast.warn(t("updateCustomer.toast.adminOnly"));
    setDeleteStep(1);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => setShowDeleteModal(false);

  const performHardDelete = async () => {
    setIsMutating(true);
    if (!token) {
      toast.error(t("updateCustomer.toast.missingToken"));
      setIsMutating(false);
      return;
    }
    const result = await hardDeleteCustomer(token, customerId);
    if (result.error) {
      toast.error(result.error || t("updateCustomer.toast.operationFailed"));
      setIsMutating(false);
      return;
    }
    toast.success(t("updateCustomer.toast.deleteSuccess"));
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
    fetchError,
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
    reload: fetchCustomer,
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
