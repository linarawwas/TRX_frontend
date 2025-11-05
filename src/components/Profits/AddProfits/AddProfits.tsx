import React from "react";
import AddToModel from "../../AddToModel/AddToModel";
import { useAddProfit, ProfitFormData } from "../../../features/finance/hooks/useAddProfit";

export interface AddProfitsConfig {
  modelName: string;
  title: string;
  buttonLabel: string;
  fields: {
    name: { label: string; "input-type": string };
    value: { label: string; "input-type": string };
    paymentCurrency: {
      label: string;
      "input-type": string;
      options: Array<{ value: string; label: string }>;
    };
  };
}

interface AddProfitsProps {
  config: AddProfitsConfig;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const AddProfits: React.FC<AddProfitsProps> = ({
  config,
  onSuccess,
  onError,
}) => {
  const { submit } = useAddProfit({ onSuccess, onError });

  const handleSubmit = async (formData: ProfitFormData) => {
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

export default AddProfits;
