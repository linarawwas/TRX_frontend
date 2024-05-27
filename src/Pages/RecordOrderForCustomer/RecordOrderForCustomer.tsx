import { useSelector } from "react-redux";
import CustomerInvoices from "../../components/Customers/CustomerInvoices/CustomerInvoices";
import RecordOrder from "../../components/Orders/RecordOrder/RecordOrder";
import './RecordOrderForCustomer.css'
import { useEffect, useState } from "react";

interface CustomerData {
    hasDiscount: boolean; // lowercase boolean
    valueAfterDiscount: number; // lowercase number
    discountCurrency: string;
    noteAboutCustomer: string;
}

function RecordOrderForCustomer(): JSX.Element {
    const customerId = useSelector((state: any) => state.order.customer_Id);
    const token = useSelector((state: any) => state.user.token);
    const [customerDiscountStatus, setCustomerDiscountStatus] = useState<CustomerData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        fetch(`https://api.trx-bi.com/api/customers/discount/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => response.json())
            .then((data: CustomerData) => {
                setCustomerDiscountStatus(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            });
    }, [customerId, token]);

    return (
        <div className="record-order-for-customer-container">
            {customerDiscountStatus?.hasDiscount && <div className="discount-banner">
                <div>This Customer Has a Discount!</div>
                <div>special checkout: {customerDiscountStatus?.noteAboutCustomer}</div>
            </div>}
            <RecordOrder  customerData={customerDiscountStatus} />

            <CustomerInvoices />
        </div>
    )
}
export default RecordOrderForCustomer;
