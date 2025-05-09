import { useSelector } from "react-redux";
import "./RecordOrderForCustomer.css";
import { useEffect, useState } from "react";
import CustomerInvoices from "../../../components/Customers/CustomerInvoices/CustomerInvoices";
import RecordOrder from "../../../components/Orders/RecordOrder/RecordOrder";
import { saveCustomerDiscountToDB, getCustomerDiscountFromDB } from "../../../utils/indexedDB"; // Adjust path as needed

interface CustomerData {
  hasDiscount: boolean;
  valueAfterDiscount: number;
  discountCurrency: string;
  noteAboutCustomer: string;
}

function RecordOrderForCustomer(): JSX.Element {
  const customerId = useSelector((state: any) => state.order.customer_Id);
  const token = useSelector((state: any) => state.user.token);
  const [customerDiscountStatus, setCustomerDiscountStatus] =
    useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      if (navigator.onLine) {
        // Online: Fetch from API and cache the result
        try {
          const response = await fetch(
            `https://trx-api.linarawas.com/api/customers/discount/${customerId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch");

          const data: CustomerData = await response.json();
          setCustomerDiscountStatus(data);

          // Cache the fetched data
          await saveCustomerDiscountToDB(customerId, data);
        } catch (error) {
          console.error("Error fetching discount data:", error);
        }
      } else {
        // Offline: Load from IndexedDB
        console.log("No internet connection, loading from IndexedDB");

        const cachedDiscountData = await getCustomerDiscountFromDB(customerId);
        if (cachedDiscountData) {
          setCustomerDiscountStatus(cachedDiscountData);
          console.log("Loaded discount data from IndexedDB:", cachedDiscountData);
        } else {
          console.log("No cached data found.");
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [customerId, token]);

  return (
    <div
      className="record-order-for-customer-container"
      style={{ direction: "rtl", textAlign: "right" }}
    >
      {customerDiscountStatus?.hasDiscount && (
        <div className="discount-banner">
          <div>هذا الزبون لديه خصم!</div>
          <div>
            ملاحظة خاصة عند الدفع: {customerDiscountStatus?.noteAboutCustomer}
          </div>
        </div>
      )}
      <RecordOrder customerData={customerDiscountStatus} />
      <CustomerInvoices />
    </div>
  );
  
}

export default RecordOrderForCustomer;
