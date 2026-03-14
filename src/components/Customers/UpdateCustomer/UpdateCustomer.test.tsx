import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import UpdateCustomer from "./UpdateCustomer";
import { useUpdateCustomerController } from "../../../features/customers/hooks/useUpdateCustomerController";

const mockNavigate = jest.fn();

jest.mock("../../../features/customers/hooks/useUpdateCustomerController", () => ({
  __esModule: true,
  useUpdateCustomerController: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
}));

jest.mock("../CustomerInfo/CustomerInfo", () => ({
  __esModule: true,
  default: () => <div>CustomerInfo</div>,
}));

jest.mock("../../AreaSequencePicker/AreaSequencePicker", () => ({
  __esModule: true,
  default: () => <div>AreaSequencePicker</div>,
}));

jest.mock("../../Distributors/AssignDistributorInline", () => ({
  __esModule: true,
  default: () => <div>AssignDistributorInline</div>,
}));

jest.mock("../CustomerInvoices/CustomerInvoices", () => ({
  __esModule: true,
  default: ({ customerId }: { customerId: string }) => (
    <div>CustomerInvoices {customerId}</div>
  ),
}));

jest.mock("./OpeningEditor", () => ({
  __esModule: true,
  OpeningEditor: ({ onDone }: { onDone: () => void }) => (
    <button onClick={onDone}>OpeningEditor</button>
  ),
}));

const mockUseUpdateCustomerController =
  useUpdateCustomerController as jest.MockedFunction<
    typeof useUpdateCustomerController
  >;

function buildControllerState(overrides?: Record<string, unknown>) {
  return {
    areas: [{ _id: "area-1", name: "Area 1" }],
    avatarText: "AL",
    companyId: "company-1",
    confirmOpen: false,
    customerData: {
      _id: "customer-1",
      name: "Alice",
      phone: "70123456",
      address: "Beirut",
      isActive: true,
      areaId: { _id: "area-1", name: "Area 1" },
      sequence: 4,
    },
    customerId: "customer-1",
    deleteStep: 1,
    editOpen: false,
    fetchCustomer: jest.fn(),
    handleChange: jest.fn(),
    handleDeactivate: jest.fn(),
    handleRecordOrder: jest.fn(),
    handleRestoreAuto: jest.fn(),
    handleRestoreWithSequence: jest.fn((e: React.FormEvent) => e.preventDefault()),
    handleSubmit: jest.fn((e: React.FormEvent) => e.preventDefault()),
    invoiceReady: true,
    isAdmin: false,
    isMutating: false,
    loading: false,
    openDeleteModal: jest.fn(),
    openEdit: false,
    pendingChanges: null,
    performHardDelete: jest.fn(),
    placementLoading: false,
    placementOptions: [
      { value: "__END__", label: "في نهاية القائمة" },
      { value: "__START__", label: "في بداية القائمة" },
    ],
    restoreSequence: "",
    setConfirmOpen: jest.fn(),
    setDeleteStep: jest.fn(),
    setEditOpen: jest.fn(),
    setOpenEdit: jest.fn(),
    setPendingChanges: jest.fn(),
    setRestoreSequence: jest.fn(),
    showDeleteModal: false,
    shipmentId: "shipment-1",
    showRestoreOptions: false,
    submitUpdate: jest.fn(),
    tab: "info",
    targetAreaId: "",
    token: "token-1",
    updatedInfo: {
      name: "",
      phone: "",
      address: "",
      areaId: "",
      placement: "",
    },
    setTab: jest.fn(),
    setShowDeleteModal: jest.fn(),
    closeDeleteModal: jest.fn(),
    ...overrides,
  };
}

describe("UpdateCustomer", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseUpdateCustomerController.mockReset();
  });

  test("wires edit form submit and confirm save actions", () => {
    const controller = buildControllerState({
      editOpen: true,
      confirmOpen: true,
      pendingChanges: { name: "Alice Updated" },
      updatedInfo: {
        name: "Alice Updated",
        phone: "",
        address: "",
        areaId: "",
        placement: "",
      },
    });
    mockUseUpdateCustomerController.mockReturnValue(
      controller as unknown as ReturnType<typeof useUpdateCustomerController>
    );

    render(<UpdateCustomer />);

    fireEvent.submit(screen.getByRole("button", { name: "حفظ التعديلات" }).closest("form")!);
    fireEvent.click(screen.getByRole("button", { name: "تأكيد الحفظ" }));

    expect(controller.handleSubmit).toHaveBeenCalled();
    expect(screen.getByText("Alice Updated")).toBeTruthy();
    expect(controller.submitUpdate).toHaveBeenCalled();
  });

  test("shows the area and placement branch in the form", () => {
    const controller = buildControllerState({
      editOpen: true,
      targetAreaId: "",
    });
    mockUseUpdateCustomerController.mockReturnValue(
      controller as unknown as ReturnType<typeof useUpdateCustomerController>
    );

    render(<UpdateCustomer />);

    const placementSelect = screen.getByLabelText("الموضع داخل المنطقة") as HTMLSelectElement;
    expect(placementSelect.disabled).toBe(true);
    expect(screen.getByText("اختر منطقة أولاً")).toBeTruthy();
  });

  test("shows inactive restore controls and delegates restore actions", () => {
    const controller = buildControllerState({
      customerData: {
        _id: "customer-1",
        name: "Alice",
        isActive: false,
        areaId: { _id: "area-1", name: "Area 1" },
      },
      showRestoreOptions: true,
      restoreSequence: 5,
    });
    mockUseUpdateCustomerController.mockReturnValue(
      controller as unknown as ReturnType<typeof useUpdateCustomerController>
    );

    render(<UpdateCustomer />);

    fireEvent.click(screen.getByRole("button", { name: "تنشيط" }));
    fireEvent.change(screen.getByPlaceholderText("مثال: 25"), {
      target: { value: "7" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "حفظ" }).closest("form")!);

    expect(controller.handleRestoreAuto).toHaveBeenCalled();
    expect(controller.setRestoreSequence).toHaveBeenCalledWith(7);
    expect(controller.handleRestoreWithSequence).toHaveBeenCalled();
  });

  test("shows destructive branch differently for admin and non-admin users", () => {
    const nonAdminController = buildControllerState({ isAdmin: false });
    mockUseUpdateCustomerController.mockReturnValue(
      nonAdminController as unknown as ReturnType<typeof useUpdateCustomerController>
    );

    const { rerender } = render(<UpdateCustomer />);
    const nonAdminDeleteButton = screen.getByRole("button", { name: "حذف نهائي" });
    expect(nonAdminDeleteButton).toHaveProperty("disabled", true);

    const adminController = buildControllerState({ isAdmin: true });
    mockUseUpdateCustomerController.mockReturnValue(
      adminController as unknown as ReturnType<typeof useUpdateCustomerController>
    );
    rerender(<UpdateCustomer />);

    const adminDeleteButton = screen.getByRole("button", { name: "حذف نهائي" });
    expect(adminDeleteButton).toHaveProperty("disabled", false);
    fireEvent.click(adminDeleteButton);

    expect(adminController.openDeleteModal).toHaveBeenCalled();
  });
});
