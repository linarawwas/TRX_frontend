import React from "react";
import "./Customers.css";
import { CustomersErrorBoundary } from "./components/CustomersErrorBoundary";
import { CustomersShell } from "./components/CustomersShell";
import { useCustomersViewModel } from "./hooks/useCustomersViewModel";

/**
 * Company customers list: composition + error boundary. Data: `state/`, `services/`, `adapters/`.
 */
function CustomersPageContent(): JSX.Element {
  const viewModel = useCustomersViewModel();
  return <CustomersShell {...viewModel} />;
}

const CustomersPage: React.FC = () => (
  <CustomersErrorBoundary>
    <CustomersPageContent />
  </CustomersErrorBoundary>
);

export default CustomersPage;
