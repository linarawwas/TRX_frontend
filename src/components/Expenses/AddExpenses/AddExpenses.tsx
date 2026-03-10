import React from "react";
import AddToModel from "../../AddToModel/AddToModel";
import {
  useAddExpense,
  ExpenseFormData,
} from "../../../features/finance/hooks/useAddExpense";
import { validateExpense } from "../../../features/finance/validation";

export interface AddExpensesConfig {
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

interface AddExpensesProps {
  config: AddExpensesConfig;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const AddExpenses: React.FC<AddExpensesProps> = ({
  config,
  onSuccess,
  onError,
}) => {
  const { submit } = useAddExpense({ onSuccess, onError });

  const handleSubmit = async (formData: ExpenseFormData) => {
    await submit(formData);
  };

  return (
    <AddToModel
      modelName={config.modelName}
      title={config.title}
      buttonLabel={config.buttonLabel}
      modelFields={config.fields}
      onSubmit={handleSubmit}
      validate={validateExpense}
    />
  );
};

export default AddExpenses;
