import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import UpdateCustomerHeader from "./UpdateCustomerHeader";

const baseCustomer = {
  name: "Alice",
  phone: "70123456",
  address: "Beirut",
  isActive: true as boolean,
};

function renderHeader(
  overrides?: Partial<React.ComponentProps<typeof UpdateCustomerHeader>>
) {
  const onDeactivate = jest.fn();
  const onOpenDeleteModal = jest.fn();
  const onRecordOrder = jest.fn();
  const onRestoreAuto = jest.fn();
  const onRestoreSequenceChange = jest.fn();
  const onRestoreWithSequence = jest.fn((e: React.FormEvent) =>
    e.preventDefault()
  );
  const onToggleEdit = jest.fn();
  const onViewStatement = jest.fn();

  const props: React.ComponentProps<typeof UpdateCustomerHeader> = {
    avatarText: "A",
    customerData: baseCustomer,
    customerId: "c1",
    editOpen: false,
    isAdmin: false,
    isMutating: false,
    restoreSequence: "",
    showRestoreOptions: false,
    onDeactivate,
    onOpenDeleteModal,
    onRecordOrder,
    onRestoreAuto,
    onRestoreSequenceChange,
    onRestoreWithSequence,
    onToggleEdit,
    onViewStatement,
    ...overrides,
  };

  const view = render(<UpdateCustomerHeader {...props} />);
  return {
    ...view,
    onDeactivate,
    onOpenDeleteModal,
    onRecordOrder,
    onRestoreAuto,
    onRestoreSequenceChange,
    onRestoreWithSequence,
    onToggleEdit,
    onViewStatement,
  };
}

describe("UpdateCustomerHeader", () => {
  test("renders identity, status, and wires primary actions", () => {
    const { onViewStatement, onToggleEdit } = renderHeader();

    expect(screen.getByRole("heading", { level: 1, name: "Alice" })).toBeTruthy();
    expect(screen.getByText("70123456")).toBeTruthy();
    expect(screen.getByText("Beirut")).toBeTruthy();
    expect(screen.getByText("نشط")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "كشف الحساب / إضافة دفعة" }));
    expect(onViewStatement).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "تعديل معلومات الزبون" }));
    expect(onToggleEdit).toHaveBeenCalledTimes(1);
  });

  test("shows external order only for active non-admin customers", () => {
    const r1 = renderHeader({ isAdmin: true });
    expect(
      screen.queryByRole("button", { name: "تسجيل طلب خارجي" })
    ).not.toBeInTheDocument();
    r1.unmount();

    const r2 = renderHeader({
      isAdmin: false,
      customerData: { ...baseCustomer, isActive: true },
    });
    expect(
      screen.getByRole("button", { name: "تسجيل طلب خارجي" })
    ).toBeTruthy();
    r2.unmount();

    renderHeader({
      isAdmin: false,
      customerData: { ...baseCustomer, isActive: false },
    });
    expect(
      screen.queryByRole("button", { name: "تسجيل طلب خارجي" })
    ).not.toBeInTheDocument();
  });

  test("inactive branch shows restore and submits sequence form", () => {
    const {
      onRestoreAuto,
      onRestoreWithSequence,
      onRestoreSequenceChange,
    } = renderHeader({
      customerData: { ...baseCustomer, isActive: false },
      showRestoreOptions: true,
      restoreSequence: 3,
    });

    fireEvent.click(screen.getByRole("button", { name: "تنشيط" }));
    expect(onRestoreAuto).toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText("مثال: 25"), {
      target: { value: "9" },
    });
    expect(onRestoreSequenceChange).toHaveBeenCalledWith(9);

    fireEvent.submit(screen.getByRole("button", { name: "حفظ" }).closest("form")!);
    expect(onRestoreWithSequence).toHaveBeenCalled();
  });

  test("hard delete respects admin and mutating state", () => {
    const { onOpenDeleteModal, unmount } = renderHeader({ isAdmin: false });
    const btn = screen.getByRole("button", { name: "حذف نهائي" });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onOpenDeleteModal).not.toHaveBeenCalled();
    unmount();

    const { onOpenDeleteModal: onOpen2 } = renderHeader({ isAdmin: true });
    const btn2 = screen.getByRole("button", { name: "حذف نهائي" });
    expect(btn2).not.toBeDisabled();
    fireEvent.click(btn2);
    expect(onOpen2).toHaveBeenCalled();
  });

  test("header exposes busy state while mutating", () => {
    renderHeader({ isMutating: true });
    const landmark = screen.getByLabelText("معلومات الزبون والحالة");
    expect(landmark).toHaveAttribute("aria-busy", "true");
  });
});
