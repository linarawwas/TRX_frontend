import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import RecordOrder from "./RecordOrder";
import { useRecordOrderController } from "../../../features/orders/hooks/useRecordOrderController";

jest.mock("../../../features/orders/hooks/useRecordOrderController", () => ({
  __esModule: true,
  useRecordOrderController: jest.fn(),
}));

jest.mock("../../Customers/CustomerInvoices/CustomerInvoices", () => ({
  __esModule: true,
  default: ({ customerId }: { customerId: string }) => (
    <div>Invoices {customerId}</div>
  ),
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("./LbpKeypad", () => ({
  __esModule: true,
  default: ({
    open,
    onConfirm,
    onClose,
  }: {
    open: boolean;
    onConfirm: (value: number) => void;
    onClose: () => void;
  }) =>
    open ? (
      <div>
        <button onClick={() => onConfirm(25000)}>confirm-lbp</button>
        <button onClick={onClose}>close-lbp</button>
      </div>
    ) : null,
}));

const mockUseRecordOrderController =
  useRecordOrderController as jest.MockedFunction<
    typeof useRecordOrderController
  >;

function buildControllerState(overrides?: Partial<ReturnType<typeof useRecordOrderController>>) {
  return {
    adjustDeliveredToRemaining: jest.fn(),
    checkout: 20,
    closeOverModal: jest.fn(),
    customerId: "customer-1",
    customerName: "Alice",
    dec: jest.fn(),
    form: {
      delivered: 2,
      returned: 1,
      paidUSD: 3,
      paidLBP: 5000,
    },
    goToNewShipment: jest.fn(),
    handleChange: jest.fn(),
    handleLbpChange: jest.fn(),
    handleSubmit: jest.fn((e: React.FormEvent) => e.preventDefault()),
    inc: jest.fn(),
    isSubmitting: false,
    maxReturnable: 4,
    overModal: null,
    productName: "Water",
    productPrice: 10,
    remaining: 6,
    setShowLbpPad: jest.fn(),
    shipmentDelivered: 12,
    showLbpPad: false,
    submitRemainingNow: jest.fn(),
    targetRound: 20,
    ...overrides,
  };
}

describe("RecordOrder", () => {
  beforeEach(() => {
    mockUseRecordOrderController.mockReset();
  });

  test("wires stepper and submit interactions to the controller", () => {
    const controller = buildControllerState();
    mockUseRecordOrderController.mockReturnValue(controller as ReturnType<typeof useRecordOrderController>);

    render(<RecordOrder />);

    fireEvent.click(screen.getByLabelText("إضافة المسلّمة"));
    fireEvent.click(screen.getByLabelText("طرح المرجعة"));
    fireEvent.submit(screen.getByRole("button", { name: /تسجيل/i }).closest("form")!);

    expect(controller.inc).toHaveBeenCalledWith("delivered");
    expect(controller.dec).toHaveBeenCalledWith("returned");
    expect(controller.handleSubmit).toHaveBeenCalled();
  });

  test("delegates lbp interactions through the controller", () => {
    const controller = buildControllerState({ showLbpPad: true });
    mockUseRecordOrderController.mockReturnValue(controller as ReturnType<typeof useRecordOrderController>);

    render(<RecordOrder />);

    fireEvent.click(screen.getByLabelText("إدخال المبلغ بالليرة"));
    fireEvent.click(screen.getByRole("button", { name: "+1,000" }));
    fireEvent.click(screen.getByRole("button", { name: "مسح" }));
    fireEvent.click(screen.getByRole("button", { name: "confirm-lbp" }));
    fireEvent.click(screen.getByRole("button", { name: "close-lbp" }));

    expect(controller.setShowLbpPad).toHaveBeenCalledWith(true);
    expect(controller.handleLbpChange).toHaveBeenCalledWith(6000);
    expect(controller.handleLbpChange).toHaveBeenCalledWith(0);
    expect(controller.handleLbpChange).toHaveBeenCalledWith(25000);
    expect(controller.setShowLbpPad).toHaveBeenCalledWith(false);
  });

  test("wires over-target modal actions to the controller callbacks", () => {
    const controller = buildControllerState({
      overModal: { want: 9 },
    });
    mockUseRecordOrderController.mockReturnValue(controller as ReturnType<typeof useRecordOrderController>);

    render(<RecordOrder />);

    fireEvent.click(screen.getByRole("button", { name: "اضبطها إلى المتبقي" }));
    fireEvent.click(screen.getByRole("button", { name: "اضبط وأرسل الآن" }));
    fireEvent.click(screen.getByRole("button", { name: "ابدأ شحنة جديدة" }));
    fireEvent.click(screen.getByRole("button", { name: "تعديل" }));

    expect(controller.adjustDeliveredToRemaining).toHaveBeenCalled();
    expect(controller.submitRemainingNow).toHaveBeenCalled();
    expect(controller.goToNewShipment).toHaveBeenCalled();
    expect(controller.closeOverModal).toHaveBeenCalled();
  });
});
