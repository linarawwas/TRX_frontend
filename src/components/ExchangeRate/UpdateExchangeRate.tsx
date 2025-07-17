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
      const response = await fetch('http://localhost:5000/api/exchangeRates/6878aa9ac9f1a18731a5b8a4', {
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
      "modelName": "سعر الصرف",
      "title": "تحديث سعر الصرف",
      "button-label": "تحديث"
    },
    "model-related-fields": {
      "exchangeRateInLBP": { "label": "سعر الصرف بالليرة اللبنانية", "input-type": "number" }
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