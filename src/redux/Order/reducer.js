const initialState = {
    customerId: null,
    areaId: null,
  };
  
  const recordOrderReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'RECORD_ORDER':
        return {
          ...state,
          customerId: action.payload.customerId,
          areaId: action.payload.areaId,
        };
      default:
        return state;
    }
  };
  
  export default recordOrderReducer;
  