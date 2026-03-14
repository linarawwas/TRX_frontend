import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ShipmentRoundState, ShipmentState } from "./types";

const createEmptyRoundState = (): ShipmentRoundState => ({
  sequence: null,
  targetAdded: 0,
  baseDelivered: 0,
  baseReturned: 0,
  baseUsd: 0,
  baseLbp: 0,
  baseExpUsd: 0,
  baseExpLbp: 0,
  baseProfUsd: 0,
  baseProfLbp: 0,
  startedAt: null,
});

export const initialState: ShipmentState = {
  // Region: live shipment identity and date metadata.
  _id: "",
  dayId: "",
  year: null,
  exchangeRateLBP: null,
  month: null,
  day: null,
  target: 0,

  // Region: previous shipment snapshot.
  prev_id: "",
  prev_dayId: "",
  prev_year: null,
  prev_month: null,
  prev_day: null,
  prev_target: 0,

  // Region: live shipment totals.
  delivered: 0,
  prev_delivered: 0,
  returned: 0,
  prev_returned: 0,
  dollarPayments: 0,
  prev_dollarPayments: 0,
  liraPayments: 0,
  prev_liraPayments: 0,
  expensesInLiras: 0,
  profitsInLiras: 0,
  expensesInUSD: 0,
  profitsInUSD: 0,
  prev_expensesInLiras: 0,
  prev_profitsInLiras: 0,
  prev_profitsInUSD: 0,
  prev_expensesInUSD: 0,

  // Region: customer progress buckets.
  CustomersWithFilledOrders: [],
  CustomersWithEmptyOrders: [],
  CustomersWithPendingOrders: [],
  prev_CustomersWithFilledOrder: [],
  prev_CustomersWithEmptyOrders: [],
  prev_CustomersWithPendingOrders: [],

  // Region: legacy compatibility total.
  payments: 0,

  // Region: round baseline state.
  round: createEmptyRoundState(),
};

export const shipmentSlice = createSlice({
  name: "shipment",
  initialState,
  reducers: {
    setRoundInfo(
      state,
      action: PayloadAction<{
        sequence: number;
        targetAdded: number;
        baseDelivered?: number;
        baseReturned?: number;
        baseUsd?: number;
        baseLbp?: number;
        baseExpUsd?: number;
        baseExpLbp?: number;
        baseProfUsd?: number;
        baseProfLbp?: number;
        startedAt?: string;
      }>
    ) {
      state.round = { ...state.round, ...action.payload };
    },
    clearRoundInfo(state) {
      state.round = {
        ...createEmptyRoundState(),
        baseDelivered: state.delivered,
        baseReturned: state.returned,
        baseUsd: state.dollarPayments,
        baseLbp: state.liraPayments,
        baseExpUsd: state.expensesInUSD,
        baseExpLbp: state.expensesInLiras,
        baseProfUsd: state.profitsInUSD,
        baseProfLbp: state.profitsInLiras,
      };
    },
    setDayId(state, action: PayloadAction<string>) {
      state.dayId = action.payload;
    },
    setTotalPayments(state, action: PayloadAction<number>) {
      state.payments = action.payload;
    },
    setExchangeRateLBP(state, action: PayloadAction<number>) {
      state.exchangeRateLBP = Number(action.payload) || null;
    },
    addCustomerWithFilledOrder(state, action: PayloadAction<string | number>) {
      state.CustomersWithFilledOrders.push(String(action.payload));
    },
    addCustomerWithEmptyOrder(state, action: PayloadAction<string | number>) {
      state.CustomersWithEmptyOrders.push(String(action.payload));
    },
    addPendingOrder(state, action: PayloadAction<string | number>) {
      const id = String(action.payload);
      if (!state.CustomersWithPendingOrders.includes(id)) {
        state.CustomersWithPendingOrders.push(id);
      }
    },
    removePendingOrder(state, action: PayloadAction<string | number>) {
      const id = String(action.payload);
      state.CustomersWithPendingOrders =
        state.CustomersWithPendingOrders.filter((x) => String(x) !== id);
    },
    setShipmentFromPrev(state) {
      state._id = state.prev_id;
      state.dayId = state.prev_dayId;
      state.year = state.prev_year;
      state.month = state.prev_month;
      state.day = state.prev_day;
      state.target = state.prev_target;
      state.delivered = state.prev_delivered;
      state.returned = state.prev_returned;
      state.dollarPayments = state.prev_dollarPayments;
      state.liraPayments = state.prev_liraPayments;
      state.profitsInUSD = state.prev_profitsInUSD;
      state.expensesInUSD = state.prev_expensesInUSD;
      state.expensesInLiras = state.prev_expensesInLiras;
      state.profitsInLiras = state.prev_profitsInLiras;
      state.CustomersWithFilledOrders = [...state.prev_CustomersWithFilledOrder];
      state.CustomersWithEmptyOrders = [...state.prev_CustomersWithEmptyOrders];
      state.CustomersWithPendingOrders = [...state.prev_CustomersWithPendingOrders];
    },
    setUsdPayments(state, action: PayloadAction<number>) {
      state.dollarPayments = action.payload;
    },
    setLiraPayments(state, action: PayloadAction<number>) {
      state.liraPayments = action.payload;
    },
    setReturned(state, action: PayloadAction<number>) {
      state.returned = action.payload;
    },
    setDelivered(state, action: PayloadAction<number>) {
      state.delivered = action.payload;
    },
    setShipmentId(state, action: PayloadAction<string>) {
      state._id = action.payload;
    },
    setTarget(state, action: PayloadAction<number>) {
      state.target = action.payload;
    },
    setShipmentProfitsInLiras(state, action: PayloadAction<number>) {
      state.profitsInLiras = action.payload;
    },
    setShipmentExpensesInLiras(state, action: PayloadAction<number>) {
      state.expensesInLiras = action.payload;
    },
    setShipmentProfitsInUSD(state, action: PayloadAction<number>) {
      state.profitsInUSD = action.payload;
    },
    setShipmentExpensesInUSD(state, action: PayloadAction<number>) {
      state.expensesInUSD = action.payload;
    },
    setDateDay(state, action: PayloadAction<number>) {
      state.day = action.payload;
    },
    setDateMonth(state, action: PayloadAction<number>) {
      state.month = action.payload;
    },
    setDateYear(state, action: PayloadAction<number>) {
      state.year = action.payload;
    },
    clearDayId(state) {
      state.dayId = "";
    },
    clearDateMonth(state) {
      state.month = null;
    },
    clearDateYear(state) {
      state.year = null;
    },
    clearDateDay(state) {
      state.day = null;
    },
    clearShipmentExpensesInLiras(state) {
      state.expensesInLiras = 0;
    },
    clearShipmentProfitsInLiras(state) {
      state.profitsInLiras = 0;
    },
    clearShipmentProfitsInUSD(state) {
      state.profitsInUSD = 0;
    },
    clearShipmentExpensesInUSD(state) {
      state.expensesInUSD = 0;
    },
    clearAllShipmentInfo(state) {
      // Snapshot the live shipment before clearing so legacy restore flows
      // can recover the previous shipment exactly, including zero values.
      state.prev_id = state._id;
      state.prev_dayId = state.dayId;
      state.prev_year = state.year;
      state.prev_month = state.month;
      state.prev_day = state.day;
      state.prev_target = state.target;
      state.prev_delivered = state.delivered;
      state.prev_returned = state.returned;
      state.prev_dollarPayments = state.dollarPayments;
      state.prev_liraPayments = state.liraPayments;
      state.prev_expensesInLiras = state.expensesInLiras;
      state.prev_profitsInLiras = state.profitsInLiras;
      state.prev_profitsInUSD = state.profitsInUSD;
      state.prev_expensesInUSD = state.expensesInUSD;
      state.prev_CustomersWithFilledOrder = [...state.CustomersWithFilledOrders];
      state.prev_CustomersWithEmptyOrders = [...state.CustomersWithEmptyOrders];
      state.prev_CustomersWithPendingOrders = [...state.CustomersWithPendingOrders];
      state._id = "";
      state.dayId = "";
      state.year = null;
      state.month = null;
      state.day = null;
      state.target = 0;
      state.payments = 0;
      state.delivered = 0;
      state.returned = 0;
      state.dollarPayments = 0;
      state.liraPayments = 0;
      state.expensesInLiras = 0;
      state.profitsInLiras = 0;
      state.expensesInUSD = 0;
      state.profitsInUSD = 0;
      state.CustomersWithFilledOrders = [];
      state.CustomersWithEmptyOrders = [];
      state.CustomersWithPendingOrders = [];
      state.round = createEmptyRoundState();
    },
  },
});

export default shipmentSlice.reducer;


