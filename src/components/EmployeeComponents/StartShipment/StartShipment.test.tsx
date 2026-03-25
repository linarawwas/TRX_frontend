/**
 * StartShipment.test.tsx (fixed)
 */
import React from "react";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import StartShipment from "./StartShipment";

// --- Mocks ---

// Redux: allow dynamic state via mockState (allowed due to "mock" prefix)
let mockState: any = { user: { token: "TEST_TOKEN" }, shipment: {} };
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => selector(mockState),
}));

// Router
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
}));

// ✅ Toast: inline the mock (no out-of-scope refs), then import { toast }
jest.mock("react-toastify", () => {
  const toast = { success: jest.fn(), error: jest.fn() };
  return { __esModule: true, toast };
});
import { toast } from "react-toastify";

// ✅ Utils: inline jest.fn() in factory, then import them to control behavior
jest.mock("../../../features/shipments/apiShipments", () => ({
  __esModule: true,
  createRoundOrShipment: jest.fn(),
  preloadShipmentData: jest.fn(),
  fetchDayByWeekday: jest.fn(),
}));
import {
  createRoundOrShipment,
  fetchDayByWeekday,
  preloadShipmentData,
} from "../../../features/shipments/apiShipments";

// AddToModel: keep a minimal stub to trigger submit path
jest.mock("../../AddToModel/AddToModel", () => {
  const MockAddToModel = (props: any) => (
    <div>
      <h1 data-testid="title">{props.title}</h1>
      <button
        onClick={() => props.onSubmit({ carryingForDelivery: 5 })}
        aria-label="fake-submit"
      >
        Fake Submit
      </button>
    </div>
  );
  MockAddToModel.displayName = "MockAddToModel";
  return MockAddToModel;
});

// Silence CSS
jest.mock("./StartShipment.css", () => ({}));

// --- Test wiring ---

beforeEach(() => {
  mockDispatch.mockReset();
  mockNavigate.mockReset();
  (toast.success as jest.Mock).mockReset();
  (toast.error as jest.Mock).mockReset();
  (createRoundOrShipment as jest.Mock).mockReset();
  (preloadShipmentData as jest.Mock).mockReset();
  (fetchDayByWeekday as jest.Mock).mockReset();

  mockState = { user: { token: "TEST_TOKEN" }, shipment: {} };

  (fetchDayByWeekday as jest.Mock).mockResolvedValue([{ _id: "DAY1" }]);
});

async function setup() {
  await act(async () => { render(<StartShipment />); });
}

// --- Tests ---

test("NEW shipment: calls createRoundOrShipment, shows preload overlay, navigates", async () => {
  (createRoundOrShipment as jest.Mock).mockResolvedValue({
    shipment: {
      _id: "SHIP123",
      dayId: "DAY1",
      carryingForDelivery: 5,
      date: { day: 1, month: 1, year: 2025 },
    },
    round: { sequence: 1 },
    isNewShipment: true,
  });

  (preloadShipmentData as jest.Mock).mockImplementation(async ({ onProgress }) => {
    onProgress?.({ type: "start" });
    onProgress?.({ type: "meta:fetched", companyAreas: 2, dayAreas: 1 });
    onProgress?.({ type: "cache:done" });
    onProgress?.({ type: "area:start", name: "A", index: 1, total: 2 });
    onProgress?.({ type: "area:done", index: 1 });
    onProgress?.({ type: "area:start", name: "B", index: 2, total: 2 });
    onProgress?.({ type: "area:done", index: 2 });
    onProgress?.({ type: "done", totals: { areas: 2, customers: 10 } });
  });

  await setup();

  expect(screen.getByTestId("title")).toHaveTextContent("إنهاء الشحنة السابقة وبدء شحنة اليوم");

  await act(async () => { fireEvent.click(screen.getByLabelText("fake-submit")); });

  expect(createRoundOrShipment).toHaveBeenCalledTimes(1);
  const args = (createRoundOrShipment as jest.Mock).mock.calls[0][0];
  expect(args.token).toBe("TEST_TOKEN");
  expect(args.payload.dayId).toBe("DAY1");
  expect(args.payload.carryingForDelivery).toBe(5);

  await screen.findByText(/جاري تجهيز الشحنة/);

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/areas/DAY1");
  });
});

test("ROUND: matching prev shipment/day → no preload overlay; success toast", async () => {
  mockState = {
    user: { token: "TEST_TOKEN" },
    shipment: { _id: "SHIP_EXISTING", dayId: "DAY1", delivered: 2, returned: 1 },
  };

  (createRoundOrShipment as jest.Mock).mockResolvedValue({
    shipment: {
      _id: "SHIP_EXISTING",
      dayId: "DAY1",
      carryingForDelivery: 10,
      date: { day: 1, month: 1, year: 2025 },
    },
    round: { sequence: 2 },
    isNewShipment: false,
  });

  await setup();

  expect(screen.getByTestId("title")).toHaveTextContent("بدء جولة جديدة لليوم نفسه");

  await act(async () => { fireEvent.click(screen.getByLabelText("fake-submit")); });

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalled();
    expect(String((toast.success as jest.Mock).mock.calls[0][0] || "")).toMatch(/بدأت الجولة/);
  });

  expect(screen.queryByText(/جاري تجهيز الشحنة/)).toBeNull();
});
