import {
  SET_DAY_ID,
  SET_DATE_DAY,
  SET_DATE_MONTH,
  SET_DATE_YEAR,
  CLEAR_DAY_ID,
  CLEAR_DATE_DAY,
  CLEAR_DATE_MONTH,
  CLEAR_DATE_YEAR,
  SET_ID,
  CLEAR_ALL_SHIPMENT_INFO,
  SET_TARGET,
  SET_RETURNED,
  SET_DELIVERED,
  SET_TOTAL_PAYMENTS,
  SET_USD_PAYMENTS,
  SET_LIRA_PAYMENTS,
  SET_SHIPMENT_FROM_PREV,
  CLEAR_SHIPMENT_PROFITS_IN_LIRAS,
  CLEAR_SHIPMENT_PROFITS_IN_USD,
  CLEAR_SHIPMENT_EXPENSES_IN_USD,
  CLEAR_SHIPMENT_EXPENSES_IN_LIRAS,
  SET_SHIPMENT_EXPENSES_IN_USD,
  SET_SHIPMENT_PROFITS_IN_USD,
  SET_SHIPMENT_EXPENSES_IN_LIRAS,
  SET_SHIPMENT_PROFITS_IN_LIRAS,
  ADD_CUSTOMER_WITH_FILLED_ORDER,
  ADD_CUSTOMER_WITH_EMPTY_ORDER,
  ADD_PENDING_ORDER,
  REMOVE_PENDING_ORDER,
  SET_EXCHANGE_RATE_LBP,
  SET_ROUND_INFO,
  CLEAR_ROUND_INFO,
} from "./actionTypes";

const initialState = {
  _id: "",
  dayId: "",
  year: null,
  exchangeRateLBP: null,
  month: null,
  day: null,
  target: 0,
  prev_id: "",
  prev_dayId: "",
  prev_year: null,
  prev_month: null,
  prev_day: null,
  prev_target: 0,
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
  CustomersWithFilledOrders: [],
  CustomersWithEmptyOrders: [],
  CustomersWithPendingOrders: [], // <-- Make sure this key exists
  prev_CustomersWithFilledOrder: [],
  prev_CustomersWithEmptyOrders: [],
  prev_CustomersWithPendingOrders: [], // Add this line
  round: {
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
  },
};

const shipmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ROUND_INFO:
      return {
        ...state,
        round: { ...state.round, ...action.payload },
      };

    case CLEAR_ROUND_INFO:
      return {
        ...state,
        round: {
          sequence: null,
          targetAdded: 0,
          baseDelivered: state.delivered, // optional: carry current as baseline
          baseReturned: state.returned,
          baseUsd: state.dollarPayments,
          baseLbp: state.liraPayments,
          baseExpUsd: state.expensesInUSD,
          baseExpLbp: state.expensesInLiras,
          baseProfUsd: state.profitsInUSD,
          baseProfLbp: state.profitsInLiras,
          startedAt: null,
        },
      };

    case SET_DAY_ID:
      return {
        ...state,
        dayId: action.payload,
      };
    case SET_TOTAL_PAYMENTS:
      return {
        ...state,
        payments: action.payload,
      };
    case SET_EXCHANGE_RATE_LBP:
      return { ...state, exchangeRateLBP: Number(action.payload) || null };
    case ADD_CUSTOMER_WITH_FILLED_ORDER:
      return {
        ...state,
        CustomersWithFilledOrders: [
          ...state.CustomersWithFilledOrders,
          action.payload,
        ],
      };
    case ADD_CUSTOMER_WITH_EMPTY_ORDER:
      return {
        ...state,
        CustomersWithEmptyOrders: [
          ...state.CustomersWithEmptyOrders,
          action.payload,
        ],
      };
    case ADD_PENDING_ORDER:
      return {
        ...state,
        CustomersWithPendingOrders: Array.from(
          new Set([...state.CustomersWithPendingOrders, String(action.payload)])
        ),
      };

    case REMOVE_PENDING_ORDER:
      return {
        ...state,
        CustomersWithPendingOrders: state.CustomersWithPendingOrders.filter(
          (id) => String(id) !== String(action.payload)
        ),
      };

    case SET_SHIPMENT_FROM_PREV:
      return {
        ...state,
        _id: state.prev_id || state._id,
        dayId: state.prev_dayId || state.dayId,
        year: state.prev_year || state.year,
        month: state.prev_month || state.month,
        day: state.prev_day || state.day,
        target: state.prev_target || state.target,
        delivered: state.prev_delivered || state.delivered,
        returned: state.prev_returned || state.returned,
        dollarPayments: state.prev_dollarPayments || state.dollarPayments,
        liraPayments: state.prev_liraPayments || state.liraPayments,
        profitsInUSD: state.prev_profitsInUSD || state.profitsInUSD,
        expensesInUSD: state.prev_expensesInUSD || state.expensesInUSD,
        expensesInLiras: state.prev_expensesInLiras || state.expensesInLiras,
        profitsInLiras: state.prev_profitsInLiras || state.profitsInLiras,
        CustomersWithFilledOrders:
          state.prev_CustomersWithFilledOrders ||
          state.CustomersWithFilledOrders,
        CustomersWithEmptyOrders:
          state.prev_CustomersWithEmptyOrders || state.CustomersWithEmptyOrders,
      };

    case SET_USD_PAYMENTS:
      return {
        ...state,
        dollarPayments: action.payload,
      };
    case SET_LIRA_PAYMENTS:
      return {
        ...state,
        liraPayments: action.payload,
      };
    case SET_RETURNED:
      return {
        ...state,
        returned: action.payload,
      };
    case SET_DELIVERED:
      return {
        ...state,
        delivered: action.payload,
      };
    case SET_ID:
      return {
        ...state,
        _id: action.payload,
      };
    case SET_TARGET:
      return {
        ...state,
        target: action.payload,
      };
    case SET_SHIPMENT_PROFITS_IN_LIRAS:
      return {
        ...state,
        profitsInLiras: action.payload,
      };
    case SET_SHIPMENT_EXPENSES_IN_LIRAS:
      return {
        ...state,
        expensesInLiras: action.payload,
      };
    case SET_SHIPMENT_PROFITS_IN_USD:
      return {
        ...state,
        profitsInUSD: action.payload,
      };
    case SET_SHIPMENT_EXPENSES_IN_USD:
      return {
        ...state,
        expensesInUSD: action.payload,
      };
    case SET_DATE_DAY:
      return {
        ...state,
        day: action.payload,
      };
    case SET_DATE_MONTH:
      return {
        ...state,
        month: action.payload,
      };
    case SET_DATE_YEAR:
      return {
        ...state,
        year: action.payload,
      };
    case CLEAR_DAY_ID:
      return {
        ...state,
        dayId: "",
      };
    case CLEAR_DATE_MONTH:
      return {
        ...state,
        month: null,
      };
    case CLEAR_DATE_YEAR:
      return {
        ...state,
        year: null,
      };
    case CLEAR_DATE_DAY:
      return {
        ...state,
        day: null,
      };
    case CLEAR_SHIPMENT_EXPENSES_IN_LIRAS:
      return {
        ...state,
        expensesInLiras: 0,
      };

    case CLEAR_SHIPMENT_PROFITS_IN_LIRAS:
      return {
        ...state,
        profitsInLiras: 0,
      };
    case CLEAR_SHIPMENT_PROFITS_IN_USD:
      return {
        ...state,
        profitsInUSD: 0,
      };
    case CLEAR_SHIPMENT_EXPENSES_IN_USD:
      return {
        ...state,
        expensesInUSD: 0,
      };
    case CLEAR_ALL_SHIPMENT_INFO:
      return {
        ...state,
        prev_id: state._id,
        prev_dayId: state.dayId,
        prev_year: state.year,
        prev_month: state.month,
        prev_day: state.day,
        prev_target: state.target,
        prev_delivered: state.delivered,
        prev_returned: state.returned,
        prev_payments: state.payments,
        prev_dollarPayments: state.dollarPayments,
        prev_liraPayments: state.liraPayments,
        prev_expensesInLiras: state.expensesInLiras,
        prev_profitsInLiras: state.profitsInLiras,
        prev_profitsInUSD: state.profitsInUSD,
        prev_expensesInUSD: state.expensesInUSD,
        _id: "",
        dayId: "",
        year: null,
        month: null,
        day: null,
        target: 0,
        delivered: 0,
        returned: 0,
        payments: 0,
        dollarPayments: 0,
        liraPayments: 0,
        expensesInLiras: 0,
        profitsInLiras: 0,
        expensesInUSD: 0,
        profitsInUSD: 0,
        CustomersWithFilledOrders: [],
        CustomersWithEmptyOrders: [],
        CustomersWithPendingOrders: [], // <-- Make sure this key exists
        round: {
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
        },
      };
    default:
      return state;
  }
};

export default shipmentReducer;
