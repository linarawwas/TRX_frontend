import React from "react";
import "./EmployeeHomePage.css";
import { EmployeeHomeShell } from "./components/EmployeeHomeShell";
import { useEmployeeHomeViewModel } from "./hooks/useEmployeeHomeViewModel";

/**
 * Employee home route composition: hooks → view model → presentational shell.
 * Data boundaries: `state/` (Redux), `services/` (offline queue read), `adapters/` (normalize).
 */
const EmployeeHomePage: React.FC = () => {
  const viewModel = useEmployeeHomeViewModel();
  return <EmployeeHomeShell {...viewModel} />;
};

export default EmployeeHomePage;
