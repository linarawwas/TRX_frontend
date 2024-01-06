import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store'; // Update this path with your Redux store structure
import './AddExpenses.css'
import { setShipmentExpensesInLiras, setShipmentExpensesInUSD } from '../../../redux/Shipment/action';
import AddToModel from '../../AddToModel/AddToModel';

const AddExpenses: React.FC = () => {

  const exchangeRate = '6537789b6ed59ef09c18213d';
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const shipmentId = useSelector((state: RootState) => state.shipment._id);
  const token = useSelector((state: RootState) => state.user.token);
  const dispatch = useDispatch();
  const shipmentExpensesInLiras = useSelector((state: any) => state.shipment.expensesInLiras)
  const shipmentExpensesInUSD = useSelector((state: any) => state.shipment.expensesInUSD)
  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, companyId, shipmentId, exchangeRate }),
      });
      if (response.ok) {
        toast.success('Expenses successfully recorded.');
        if (formData.paymentCurrency === 'USD') {
          dispatch(setShipmentExpensesInUSD(parseInt(shipmentExpensesInUSD) + parseInt(formData.value)))
        } else {
          dispatch(setShipmentExpensesInLiras(parseInt(shipmentExpensesInLiras) + parseInt(formData.value)))
        }
      } else {
        const errorData = await response.json();
        toast.error(`Error recording Expenses: ${errorData.error}`);
      }

      return response;
    } catch (error: any) {
      toast.error(`Network error: ${error}`);
      throw error;
    }
  };
  const expensesConfig = {
    "component-related-fields": {
      "modelName": "Expenses",
      "title": "Add Expenses",
      "button-label": "Add Expenses",
    },
    "model-related-fields": {
      "name": { "label": "Name", "input-type": "text" },
      "value": { "label": "Value", "input-type": "number" },
      "paymentCurrency": { "label": "Payment Currency", "input-type": "selectOption", "options": [
        { value: 'USD', label: 'USD' },
        { value: 'LBP', label: 'LBP' }] },
    }
  };
  return (
    <AddToModel
      modelName={expensesConfig['component-related-fields'].modelName}
      title={expensesConfig['component-related-fields'].title}
      buttonLabel={expensesConfig['component-related-fields']['button-label']}
      modelFields={expensesConfig['model-related-fields']}
      onSubmit={handleSubmit}  />
  );
};

export default AddExpenses;