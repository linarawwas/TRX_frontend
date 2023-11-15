export const recordOrder = ({ customerId, areaId }) => ({
    type: 'RECORD_ORDER',
    payload: { customerId, areaId },
  });
  