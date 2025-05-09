import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import AddToModel from '../AddToModel/AddToModel';
import { RootState } from '../../redux/store';
const UpdateExchangeRate: React.FC = () => {

  const token = useSelector((state: RootState) => state.user.token);
  const dispatch = useDispatch();
  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch('https://trx-api.linarawas.com//api/exchangeRates/6537789b6ed59ef09c18213d', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData }),
      });
      if (response.ok) {
        toast.success("Exchange rate updated Successfuly! ")
      }
      return response;
    } catch (error: any) {
      toast.error(`Network error: ${error}`);
      throw error;
    }
  };
  const expensesConfig = {
    "component-related-fields": {
      "modelName": "Exchange Rate",
      "title": "Update Exchange Rate",
      "button-label": "Update",
    },
    "model-related-fields": {
      "exchangeRateInLBP": { "label": "Exchange Rate In LBP", "input-type": "number" },
    }
  };
  return (
    <AddToModel
      modelName={expensesConfig['component-related-fields'].modelName}
      title={expensesConfig['component-related-fields'].title}
      buttonLabel={expensesConfig['component-related-fields']['button-label']}
      modelFields={expensesConfig['model-related-fields']}
      onSubmit={handleSubmit} />
  );
};

export default UpdateExchangeRate;