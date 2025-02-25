import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store'; // Update this path with your Redux store structure
import { setShipmentProfitsInLiras, setShipmentProfitsInUSD } from '../../../redux/Shipment/action';
import AddToModel from '../../AddToModel/AddToModel';

const AddProfits: React.FC = () => {
  const exchangeRate = '6537789b6ed59ef09c18213d';
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const shipmentId = useSelector((state: RootState) => state.shipment._id);
  const token = useSelector((state: RootState) => state.user.token);
  const dispatch = useDispatch();
  const shipmentProfitsInLiras = useSelector((state: any) => state.shipment.profitsInLiras)
  const shipmentProfitsInUSD = useSelector((state: any) => state.shipment.profitsInUSD)
  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch('https://api-trx.linarawas.com/api/extraProfits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, companyId, shipmentId, exchangeRate }),
      });
      if (response.ok) {
        toast.success('Profits successfully recorded.');
        if (formData.paymentCurrency === 'USD') {
          dispatch(setShipmentProfitsInUSD(parseInt(shipmentProfitsInUSD) + parseInt(formData.value)))
        } else {
          dispatch(setShipmentProfitsInLiras(parseInt(shipmentProfitsInLiras) + parseInt(formData.value)))
        }
      } else {
        const errorData = await response.json();
        toast.error(`Error recording Profits: ${errorData.error}`);
      }

      return response;
    } catch (error: any) {
      toast.error(`Network error: ${error}`);
      throw error;
    }
  };
  const profitsConfig = {
    "component-related-fields": {
      "modelName": "extraProfits",
      "title": "Add to Profits",
      "button-label": "Add Profit",
    },
    "model-related-fields": {
      "name": { "label": "Name", "input-type": "text" },
      "value": { "label": "Value", "input-type": "number" },
      "paymentCurrency": {
        "label": "Payment Currency", "input-type": "selectOption", "options": [{ value: 'USD', label: 'USD' },
        { value: 'LBP', label: 'LBP' }]
      },
    }
  };
  return (
    <AddToModel
      modelName={profitsConfig['component-related-fields'].modelName}
      title={profitsConfig['component-related-fields'].title}
      buttonLabel={profitsConfig['component-related-fields']['button-label']}
      modelFields={profitsConfig['model-related-fields']}
      onSubmit={handleSubmit}
    />
  );
};

export default AddProfits;