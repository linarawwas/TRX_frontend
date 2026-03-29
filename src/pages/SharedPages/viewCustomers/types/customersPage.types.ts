import type { Customer } from "../../../../features/customers/apiCustomers";

/**
 * View model passed from the page hook into `CustomersShell`.
 */
export type CustomersPageViewModel = {
  loading: boolean;
  error: string | null;
  filteredActive: Customer[];
  filteredInactive: Customer[];
  activeCustomers: Customer[];
  inactiveCustomers: Customer[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  showInsertOne: boolean;
  onToggleShowInsertOne: () => void;
  openActive: boolean;
  onToggleOpenActive: () => void;
  openInactive: boolean;
  onToggleOpenInactive: () => void;
  noResults: boolean;
  onRetry: () => void;
  activePanelId: string;
  inactivePanelId: string;
};

export type CustomersCustomerRowProps = {
  customer: Customer;
  inactive?: boolean;
};
