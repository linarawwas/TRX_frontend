import { renderHook } from "@testing-library/react";
import { useTodayShipmentTotals } from "./useTodayShipmentTotals";
import { useListShipmentsRangeQuery } from "../../api/trxApi";

jest.mock("../../api/trxApi", () => ({
  __esModule: true,
  useListShipmentsRangeQuery: jest.fn(),
}));

const mockUseListShipmentsRangeQuery =
  useListShipmentsRangeQuery as jest.MockedFunction<typeof useListShipmentsRangeQuery>;

describe("useTodayShipmentTotals", () => {
  beforeEach(() => {
    mockUseListShipmentsRangeQuery.mockReset();
  });

  test("aggregates shipment totals from the RTK Query response", () => {
    const refetch = jest.fn();
    mockUseListShipmentsRangeQuery.mockReturnValue({
      data: {
        shipments: [
          {
            carryingForDelivery: 10,
            calculatedDelivered: 6,
            calculatedReturned: 1,
            shipmentLiraPayments: 100000,
            shipmentUSDPayments: 12,
            shipmentLiraExtraProfits: 5000,
            shipmentUSDExtraProfits: 2,
            shipmentLiraExpenses: 3000,
            shipmentUSDExpenses: 1,
          },
          {
            carryingForDelivery: 7,
            calculatedDelivered: 4,
            calculatedReturned: 2,
            shipmentLiraPayments: 200000,
            shipmentUSDPayments: 8,
            shipmentLiraExtraProfits: 1000,
            shipmentUSDExtraProfits: 1,
            shipmentLiraExpenses: 7000,
            shipmentUSDExpenses: 3,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch,
    } as ReturnType<typeof useListShipmentsRangeQuery>);

    const date = new Date(2026, 2, 13);
    const { result } = renderHook(() =>
      useTodayShipmentTotals("token", "company-1", date)
    );

    expect(mockUseListShipmentsRangeQuery).toHaveBeenCalledWith(
      {
        companyId: "company-1",
        fromDate: { day: 13, month: 3, year: 2026 },
        toDate: { day: 13, month: 3, year: 2026 },
      },
      { refetchOnMountOrArgChange: true }
    );
    expect(result.current.totals).toEqual({
      carryingForDelivery: 17,
      calculatedDelivered: 10,
      calculatedReturned: 3,
      shipmentLiraPayments: 300000,
      shipmentUSDPayments: 20,
      shipmentLiraExtraProfits: 6000,
      shipmentUSDExtraProfits: 3,
      shipmentLiraExpenses: 10000,
      shipmentUSDExpenses: 4,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.refetch).toBe(refetch);
  });

  test("returns an error message when the query fails", () => {
    mockUseListShipmentsRangeQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    } as ReturnType<typeof useListShipmentsRangeQuery>);

    const { result } = renderHook(() =>
      useTodayShipmentTotals("token", "company-1", new Date(2026, 2, 13))
    );

    expect(result.current.totals.calculatedDelivered).toBe(0);
    expect(result.current.error).toBe("Failed to fetch shipment totals");
  });
});
