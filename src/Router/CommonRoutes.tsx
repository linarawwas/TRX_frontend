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
 * Returns an array of <Route> elements so they can be used as direct children of <Routes>.
 */
export function CommonRoutes() {
  return [
    <Route key="login" path="/login" element={<Login />} />,
    <Route key="register" path="/register" element={<Register />} />,
    <Route key="viewOrders" path="/viewOrders" element={<OrdersTable />} />,
    <Route key="orders-today" path="/reports/orders-today" element={<OrdersOfToday />} />,
    <Route
      key="recordOrderforCustomer"
      path="/recordOrderforCustomer"
      element={<RecordOrderForCustomer />}
    />,
    <Route
      key="customerStatement"
      path="/customers/:customerId/statement"
      element={<CustomerStatement />}
    />,
    <Route key="areas" path="/areas" element={<Areas />} />,
    <Route key="customers" path="/customers" element={<Customers />} />,
    <Route key="addresses" path="/addresses/:areaId" element={<Addresses />} />,
    <Route key="areasForDay" path="/areas/:dayId" element={<AreasForDay />} />,
    <Route key="customersForArea" path="/customers/:areaId" element={<CustomersForArea />} />,
    <Route key="areasAdd" path="/areas/add" element={<AddArea />} />,
    <Route key="updateOrder" path="/updateOrder/:orderId" element={<UpdateOrder />} />,
    <Route
      key="updateCustomer"
      path="/updateCustomer/:customerId"
      element={<UpdateCustomer />}
    />,
    <Route
      key="addExpenses"
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
    />,
    <Route
      key="addProfits"
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
    />,
    <Route key="currentShipment" path="/currentShipment" element={<ShipmentsList />} />,
    <Route key="Profits" path="/Profits" element={<ExtraProfits />} />,
    <Route key="Expenses" path="/Expenses" element={<Expenses />} />,
  ];
}

