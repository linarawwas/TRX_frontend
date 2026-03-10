import { Route } from "react-router-dom";

import Login from "../pages/SharedPages/Login/Login";
import Register from "../components/Auth/Register";
import OrdersTable from "../pages/SharedPages/OrdersTable/OrdersTable";
import Areas from "../pages/SharedPages/Areas/Areas";
import Customers from "../pages/SharedPages/viewCustomers/Customers";
import Addresses from "../pages/SharedPages/Addresses/Addresses";
import AreasForDay from "../pages/SharedPages/AreasForDay/AreasForDay";
import CustomersForArea from "../pages/SharedPages/CustomersForArea/CustomersForArea";
import AddArea from "../components/Areas/AddArea/AddArea";
import UpdateOrder from "../components/Orders/UpdateOrder/UpdateOrder";
import UpdateCustomer from "../components/Customers/UpdateCustomer/UpdateCustomer";
import AddExpenses from "../components/Expenses/AddExpenses/AddExpenses";
import AddProfits from "../components/Profits/AddProfits/AddProfits";
import ShipmentsList from "../pages/SharedPages/Shipment/ShipmentsList";
import ExtraProfits from "../pages/SharedPages/ViewProfits/ViewProfits";
import Expenses from "../pages/SharedPages/ViewExpenses/ViewExpenses";
import RecordOrderForCustomer from "../pages/SharedPages/RecordOrderForCustomer/RecordOrderForCustomer";
import OrdersOfToday from "../pages/SharedPages/Login/reports/orders-today/OrdersOfToday";
import CustomerStatement from "../components/Customers/CustomerStatement/CustomerStatement";
import { t } from "../utils/i18n";

/**
 * Routes shared between admin and employee experiences.
 *
 * Each top-level router (`AdminRouter`, `EmployeeRouter`) is responsible
 * for its own index route and any role-specific screens; everything else
 * that should be reachable by both roles lives here.
 */
export function CommonRoutes() {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/viewOrders" element={<OrdersTable />} />
      <Route path="/reports/orders-today" element={<OrdersOfToday />} />

      <Route
        path="/recordOrderforCustomer"
        element={<RecordOrderForCustomer />}
      />
      <Route
        path="/customers/:customerId/statement"
        element={<CustomerStatement />}
      />

      <Route path="/areas" element={<Areas />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/addresses/:areaId" element={<Addresses />} />
      <Route path="/areas/:dayId" element={<AreasForDay />} />
      <Route path="/customers/:areaId" element={<CustomersForArea />} />
      <Route path="/areas/add" element={<AddArea />} />

      <Route path="/updateOrder/:orderId" element={<UpdateOrder />} />
      <Route
        path="/updateCustomer/:customerId"
        element={<UpdateCustomer />}
      />

      <Route
        path="/addExpenses"
        element={
          <AddExpenses
            config={{
              modelName: t("expenses.title"),
              title: t("expenses.add.title"),
              buttonLabel: t("expenses.add.buttonLabel"),
              fields: {
                name: { label: t("expenses.fields.name"), "input-type": "text" },
                value: {
                  label: t("expenses.fields.value"),
                  "input-type": "number",
                },
                paymentCurrency: {
                  label: t("expenses.fields.paymentCurrency"),
                  "input-type": "selectOption",
                  options: [
                    { value: "USD", label: t("expenses.currency.usd") },
                    { value: "LBP", label: t("expenses.currency.lbp") },
                  ],
                },
              },
            }}
          />
        }
      />

      <Route
        path="/addProfits"
        element={
          <AddProfits
            config={{
              modelName: t("profits.title"),
              title: t("profits.add.title"),
              buttonLabel: t("profits.add.buttonLabel"),
              fields: {
                name: { label: t("profits.fields.name"), "input-type": "text" },
                value: {
                  label: t("profits.fields.value"),
                  "input-type": "number",
                },
                paymentCurrency: {
                  label: t("profits.fields.paymentCurrency"),
                  "input-type": "selectOption",
                  options: [
                    { value: "USD", label: t("profits.currency.usd") },
                    { value: "LBP", label: t("profits.currency.lbp") },
                  ],
                },
              },
            }}
          />
        }
      />

      <Route path="/currentShipment" element={<ShipmentsList />} />
      <Route path="/Profits" element={<ExtraProfits />} />
      <Route path="/Expenses" element={<Expenses />} />
    </>
  );
}

