import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import AddToModel from '../AddToModel/AddToModel';
import { toast } from 'react-toastify';
const AddProducts: React.FC = () => {
  // Define the configuration for products
  const productConfig = {
    "component-related-fields": {
      "modelName": "المنتجات",
      "title": "إضافة إلى المنتجات",
      "button-label": "إضافة منتج"
    },
    "model-related-fields": {
      "type": { "label": "نوع المنتج", "input-type": "text" },
      "priceInDollars": { "label": "السعر بالدولار", "input-type": "number" },
      "isReturnable": {
        "label": "هل يمكن إرجاعه؟", "input-type": "selectOption",
        "options": [
          { "value": true, "label": "نعم" },
          { "value": false, "label": "لا" }
        ]
      }
    }
  };
  
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const token = useSelector((state: RootState) => state.user.token);

  // Function to handle submitting products data
  const handleSubmitProducts = async (data: any) => {
    try {
      const response = await fetch('https://trx-api.linarawas.com/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, companyId }),
      });
      if (response.ok) {
        toast.success('Product successfully recorded.');
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <AddToModel
      modelName={productConfig['component-related-fields'].modelName}
      title={productConfig['component-related-fields'].title}
      buttonLabel={productConfig['component-related-fields']['button-label']}
      modelFields={productConfig['model-related-fields']}
      onSubmit={handleSubmitProducts}
    />
  );
};

export default AddProducts;
