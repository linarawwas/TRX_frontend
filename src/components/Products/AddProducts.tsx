import React from 'react';
import AddToModel from '../AddToModel/AddToModel';
import { useAddProduct, ProductFormData } from '../../features/products/hooks/useAddProduct';

export interface AddProductsConfig {
  modelName: string;
  title: string;
  buttonLabel: string;
  fields: {
    type: { label: string; "input-type": string };
    priceInDollars: { label: string; "input-type": string };
    isReturnable: {
      label: string;
      "input-type": string;
      options: Array<{ value: boolean; label: string }>;
    };
  };
}

interface AddProductsProps {
  config: AddProductsConfig;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const AddProducts: React.FC<AddProductsProps> = ({
  config,
  onSuccess,
  onError,
}) => {
  const { submit } = useAddProduct({ onSuccess, onError });

  const handleSubmit = async (formData: ProductFormData) => {
    await submit(formData);
  };

  return (
    <AddToModel
      modelName={config.modelName}
      title={config.title}
      buttonLabel={config.buttonLabel}
      modelFields={config.fields}
      onSubmit={handleSubmit}
    />
  );
};

export default AddProducts;
