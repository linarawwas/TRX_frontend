import React from 'react';
import '../Orders/RecordOrder/RecordOrder.css';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import AddToModel from '../AddToModel/AddToModel';
const AddProducts: React.FC = () => {
  // Define the configuration for products
  const productConfig = {
    "component-related-fields": {
      "modelName": "products",
      "title": "Add to Products",
      "button-label": "Add Product",
    },
    "model-related-fields": {
      "type": { "label": "Type of Product", "input-type": "text" },
      "priceInDollars": { "label": "Price In Dollars", "input-type": "number" },
      "isReturnable": {
        "label": "Is it Returnable?", "input-type": "selectOption",
        "options":
          [{ value: true, label: 'Yes' },
          { value: false, label: 'No' }]
      },
    }
  };
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const token = useSelector((state: RootState) => state.user.token);

  // Function to handle submitting products data
  const handleSubmitProducts = async (data: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, companyId }),
      });

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
