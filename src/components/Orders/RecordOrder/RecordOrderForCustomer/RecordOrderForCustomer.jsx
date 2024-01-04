import CustomerInvoices from "../../../Customers/CustomerInvoices/CustomerInvoices";
import RecordOrder from "../RecordOrder";

export default function RecordOrderForCustomer() {
    return (
        <div className="record-order-for-customer-container">
            <RecordOrder />
            <CustomerInvoices />
        </div>
    )
}