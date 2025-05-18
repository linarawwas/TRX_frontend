import { useSelector } from "react-redux";
import "./RecordOrderForCustomer.css";
import { useEffect, useState } from "react";
import CustomerInvoices from "../../../components/Customers/CustomerInvoices/CustomerInvoices";
import RecordOrder from "../../../components/Orders/RecordOrder/RecordOrder";
import { saveCustomerDiscountToDB, getCustomerDiscountFromDB } from "../../../utils/indexedDB"; // Adjust path as needed
import { toast } from "react-toastify";

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
    const fetchDiscountFromCache = async () => {
      setIsLoading(true);
      try {
        const cachedDiscountData = await getCustomerDiscountFromDB(customerId);
        if (cachedDiscountData) {
          setCustomerDiscountStatus(cachedDiscountData);
          console.log("Loaded discount data from IndexedDB:", cachedDiscountData);
        } else {
          console.warn("❌ No discount data found in IndexedDB");
          toast.warn("⚠️ لم يتم العثور على بيانات الخصم في وضع عدم الاتصال.");
        }
      } catch (error) {
        console.error("Error loading discount from IndexedDB", error);
        toast.error("⚠️ فشل تحميل بيانات الخصم من الذاكرة المؤقتة.");
      }
      setIsLoading(false);
    };
  
    fetchDiscountFromCache();
  }, [customerId]);
  

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
    </div>
  );
  
}

export default RecordOrderForCustomer;
