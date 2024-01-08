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
} from "./actionTypes";

const initialState = {
  _id: '',
  dayId: '',
  year: null,
  month: null,
  day: null,
  target: 0,
  prev_id: '',
  prev_dayId: '',
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
};

const shipmentReducer = (state = initialState, action) => {
  switch (action.type) {
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
        dayId: '',
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
        _id: '',
        dayId: '',
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
      };
    default:
      return state;
  }
};

export default shipmentReducer;
