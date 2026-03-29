import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EmployeeHomeShell } from "../components/EmployeeHomeShell";
import type { EmployeeHomeViewModel } from "../types/employeeHome.types";

jest.mock("../../../../components/AsideMenu/Right/TodaySnapshot", () => ({
  __esModule: true,
  default: function MockToday() {
    return <div data-testid="mock-today-snapshot" />;
  },
}));

jest.mock("../../../../components/AsideMenu/Right/RoundSnapshot", () => ({
  __esModule: true,
  default: function MockRound() {
    return <div data-testid="mock-round-snapshot" />;
  },
}));

function baseViewModel(
  overrides?: Partial<EmployeeHomeViewModel>
): EmployeeHomeViewModel {
  return {
    username: "",
    isUserReady: false,
    shipmentId: "",
    dayId: "",
    isOnline: true,
    pendingCount: null,
    pendingLoading: true,
    syncError: null,
    shipmentModalOpen: false,
    openStartShipment: jest.fn(),
    setShipmentModalOpen: jest.fn(),
    ...overrides,
  };
}

describe("EmployeeHomeShell", () => {
  it("shows loading skeleton when user is not ready", () => {
    render(<EmployeeHomeShell {...baseViewModel()} />);
    expect(screen.getByText("جارٍ التحميل…")).toBeInTheDocument();
    expect(document.querySelector(".employee-home-skeleton")).toBeTruthy();
  });

  it("shows empty shipment state when ready and no shipmentId", () => {
    render(
      <MemoryRouter>
        <EmployeeHomeShell
          {...baseViewModel({
            isUserReady: true,
            username: "Test",
            pendingLoading: false,
            pendingCount: 0,
            shipmentId: "",
          })}
        />
      </MemoryRouter>
    );
    expect(screen.getByText("لا توجد شحنة نشطة")).toBeInTheDocument();
    expect(screen.getByTestId("mock-round-snapshot")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-today-snapshot")).not.toBeInTheDocument();
  });

  it("renders TodaySnapshot when shipmentId is set", () => {
    render(
      <MemoryRouter>
        <EmployeeHomeShell
          {...baseViewModel({
            isUserReady: true,
            username: "Test",
            pendingLoading: false,
            pendingCount: 0,
            shipmentId: "s1",
            dayId: "d1",
          })}
        />
      </MemoryRouter>
    );
    expect(screen.getByTestId("mock-today-snapshot")).toBeInTheDocument();
  });
});
