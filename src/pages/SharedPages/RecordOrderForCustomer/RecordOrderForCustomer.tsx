import { useSelector } from "react-redux";
import "./RecordOrderForCustomer.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import CustomerInvoices from "../../../components/Customers/CustomerInvoices/CustomerInvoices";
import RecordOrder from "../../../components/Orders/RecordOrder/RecordOrder";
import {
  saveCustomerDiscountToDB,
  getCustomerDiscountFromDB,
} from "../../../utils/indexedDB";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DiscountCard from "./DiscountCard";
import { selectOrderCustomerId } from "../../../redux/selectors/order";
import { selectUserToken } from "../../../redux/selectors/user";
import { t } from "../../../utils/i18n";

interface CustomerData {
  hasDiscount: boolean;
  valueAfterDiscount: number;
  discountCurrency: string;
  noteAboutCustomer: string;
}

function RecordOrderForCustomer(): JSX.Element {
  const customerId = useSelector(selectOrderCustomerId);
  const token = useSelector(selectUserToken);
  const [customerDiscountStatus, setCustomerDiscountStatus] =
    useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const isExternal = Boolean((state as { isExternal?: boolean })?.isExternal);

  useEffect(() => {
    if (!customerId) return;

    const fetchDiscountFromCache = async () => {
      setIsLoading(true);
      try {
        const cachedDiscountData = await getCustomerDiscountFromDB(customerId);
        if (cachedDiscountData) {
          setCustomerDiscountStatus(cachedDiscountData);
        } else {
          console.warn("❌ No discount data found in IndexedDB");
          toast.warn("⚠️ لم يتم العثور على بيانات الخصم في وضع عدم الاتصال.");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
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
      <div className="back-row">
        <button
          type="button"
          className="back-pill"
          onClick={() => navigate(-1)}
          aria-label={t("common.back")}
        >
          {/* chevron points right for RTL */}
          <svg
            className="back-icon"
            viewBox="0 0 24 24"
            focusable="false"
            aria-hidden="true"
          >
            <path
              d="M10 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="back-text">{t("common.back")}</span>
        </button>
      </div>
      {customerDiscountStatus?.hasDiscount && (
        <DiscountCard
          unitPriceUSD={customerDiscountStatus.valueAfterDiscount}
          note={customerDiscountStatus.noteAboutCustomer}
        />
      )}
      <RecordOrder
        customerData={customerDiscountStatus || null}
        isExternal={isExternal}
      />
    </div>
  );
}

export default RecordOrderForCustomer;
