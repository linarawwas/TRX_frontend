// Refactored RecordOrder.tsx to only use IndexedDB for product info
import React, { useState, useEffect } from "react";
import "./RecordOrder.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import {
  addCustomerWithEmptyOrder,
  addCustomerWithFilledOrder,
  addPendingOrder,
  removePendingOrder,
  setShipmentDelivered,
  setShipmentPayments,
  setShipmentPaymentsInDollars,
  setShipmentPaymentsInLiras,
  setShipmentReturned,
} from "../../../redux/Shipment/action.js";
import {
  setProductId,
  setProductName,
  setProductPrice,
} from "../../../redux/Order/action";
import { useNavigate } from "react-router-dom";
import { getProductTypeFromDB, saveRequest } from "../../../utils/indexedDB";

const RecordOrder = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const companyId = useSelector((state) => state.user.companyId);

  useEffect(() => {
    const loadProductFromCache = async () => {
      try {
        const cachedProduct = await getProductTypeFromDB(companyId);
        if (cachedProduct) {
          dispatch(setProductId(cachedProduct.id));
          dispatch(setProductName(cachedProduct.type));
          dispatch(setProductPrice(cachedProduct.priceInDollars));
          return;
        }

        console.warn("❌ No product info found in IndexedDB");
        toast.warn(
          "⚠️ المنتج غير متوفر في الوضع دون اتصال. يرجى الاتصال لاحقاً."
        );
      } catch (error) {
        console.error("Failed to load product info from IndexedDB", error);
        toast.error("⚠️ خطأ في تحميل بيانات المنتج من الذاكرة.");
      }
    };

    loadProductFromCache();
  }, [companyId, dispatch]);

  const token = useSelector((state) => state.user.token);
  const customerId = useSelector((state) => state.order.customer_Id);
  const customer_name = useSelector((state) => state.order.customer_name);
  const areaId = useSelector((state) => state.order.area_Id);
  const shipmentId = useSelector((state) => state.shipment._id);
  const customersWithPendingOrders =
    useSelector((state) => state.shipment?.CustomersWithPendingOrders) || [];
  const productName = useSelector((state) => state.order.product_name);
  const productId = useSelector((state) => state.order.product_id);
  const productPrice = useSelector((state) => state.order.product_price);
  const [orderData, setOrderData] = useState({
    delivered: 0,
    returned: 0,
    customerid: customerId,
    areaId: areaId,
    paid: 0,
    productId: productId,
    paymentCurrency: "USD",
    exchangeRate: "6537789b6ed59ef09c18213d",
    companyId: companyId,
    shipmentId: shipmentId,
  });
  let deliveredInShipment = useSelector((state) => state.shipment.delivered);
  let returnedInShipment = useSelector((state) => state.shipment.returned);
  let shipmentPaymentsInLiras = useSelector(
    (state) => state.shipment.liraPayments
  );
  let shipmentPaymentsInDollars = useSelector(
    (state) => state.shipment.dollarPayments
  );
  let totalPayments = useSelector((state) => state.shipment.payments);
  let checkout = props.customerData?.hasDiscount
    ? props.customerData?.valueAfterDiscount * orderData.delivered
    : orderData.delivered * productPrice;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData({ ...orderData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const request = {
      url: "http://localhost:5000/api/orders",
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      },
    };

    if (!navigator.onLine) {
      dispatch(
        setShipmentDelivered(
          deliveredInShipment + parseInt(orderData.delivered)
        )
      );
      dispatch(
        setShipmentReturned(returnedInShipment + parseInt(orderData.returned))
      );
      orderData.paymentCurrency === "USD"
        ? dispatch(
            setShipmentPaymentsInDollars(
              shipmentPaymentsInDollars + parseInt(orderData.paid)
            )
          )
        : dispatch(
            setShipmentPaymentsInLiras(
              shipmentPaymentsInLiras + parseInt(orderData.paid)
            )
          );
      dispatch(setShipmentPayments(totalPayments + parseInt(orderData.paid)));
      dispatch(addPendingOrder(customerId));
      await saveRequest(request);
      toast.info(
        "You're offline. Your order will be submitted when you're back online."
      );
      navigate(-1);
      return;
    }

    try {
      const response = await fetch(request.url, request.options);
      if (response.ok) {
        const responseData = await response.json();
        if (customersWithPendingOrders.includes(customerId)) {
          dispatch(removePendingOrder(customerId));
        }
        dispatch(
          setShipmentDelivered(
            deliveredInShipment + parseInt(orderData.delivered)
          )
        );
        dispatch(
          setShipmentReturned(returnedInShipment + parseInt(orderData.returned))
        );
        dispatch(
          setShipmentPaymentsInLiras(
            shipmentPaymentsInLiras +
              parseInt(responseData.SumOfPaymentsInLiras)
          )
        );
        dispatch(
          setShipmentPaymentsInDollars(
            shipmentPaymentsInDollars +
              parseInt(responseData.SumOfPaymentsInDollars)
          )
        );
        dispatch(
          setShipmentPayments(totalPayments + parseInt(responseData.paid))
        );
        if (
          parseInt(orderData.delivered) === 0 &&
          parseInt(orderData.returned) === 0 &&
          parseInt(orderData.paid) === 0
        ) {
          dispatch(addCustomerWithEmptyOrder(customerId));
        } else {
          dispatch(addCustomerWithFilledOrder(customerId));
        }
        toast.success("Order successfully recorded.");
        navigate(-1);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      toast.error(`Network error: ${error.message}`);
    }
  };

  const handleCurrencySelection = (currency) => {
    setOrderData({ ...orderData, paymentCurrency: currency });
  };

  return (
    <div
      className="record-order-container"
      style={{ direction: "rtl", textAlign: "right" }}
    >
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="record-order-title">تسجيل طلب ل {customer_name}</h1>

      <form className="record-order-form" onSubmit={handleSubmit}>
        <div className="default-product-name">
          المنتج الافتراضي: {productName}، السعر الافتراضي: {productPrice} $
        </div>

        <div className="number-inputs">
          <div className="up-down-input">
            <p>الكمية المسلّمة:</p>
            <div className="up-down-buttons">
              <button
                type="button"
                className="arrow"
                onClick={() =>
                  setOrderData({
                    ...orderData,
                    delivered: orderData.delivered
                      ? parseInt(orderData.delivered) + 1
                      : 1,
                  })
                }
              >
                ▲
              </button>
              <input
                type="number"
                className="number-input"
                placeholder="الكمية المسلّمة"
                name="delivered"
                value={orderData.delivered}
                onChange={handleChange}
              />
              <button
                type="button"
                className="arrow"
                onClick={() =>
                  setOrderData({
                    ...orderData,
                    delivered:
                      orderData.delivered && orderData.delivered > 0
                        ? parseInt(orderData.delivered) - 1
                        : 0,
                  })
                }
              >
                ▼
              </button>
            </div>
          </div>

          <p>المبلغ المستحق: {checkout.toFixed(2)} $</p>

          <div className="up-down-input">
            <p>الكمية المرجعة:</p>
            <div className="up-down-buttons">
              <button
                type="button"
                className="arrow"
                onClick={() =>
                  setOrderData({
                    ...orderData,
                    returned: orderData.returned
                      ? parseInt(orderData.returned) + 1
                      : 1,
                  })
                }
              >
                ▲
              </button>
              <input
                type="number"
                className="number-input"
                placeholder="الكمية المرجعة"
                name="returned"
                value={orderData.returned}
                onChange={handleChange}
              />
              <button
                type="button"
                className="arrow"
                onClick={() =>
                  setOrderData({
                    ...orderData,
                    returned:
                      orderData.returned && orderData.returned > 0
                        ? parseInt(orderData.returned) - 1
                        : 0,
                  })
                }
              >
                ▼
              </button>
            </div>
          </div>

          <div className="currency-buttons">
            <p className="paid-label">المبلغ المدفوع:</p>
            <button
              type="button"
              className={`currency-button ${
                orderData.paymentCurrency === "USD" ? "selected" : ""
              }`}
              onClick={() => handleCurrencySelection("USD")}
            >
              دولار
            </button>
            <button
              type="button"
              className={`currency-button ${
                orderData.paymentCurrency === "LBP" ? "selected" : ""
              }`}
              onClick={() => handleCurrencySelection("LBP")}
            >
              ليرة
            </button>
          </div>

          <input
            type="number"
            className="number-input free-select"
            placeholder="المدفوع"
            name="paid"
            value={orderData.paid}
            onChange={handleChange}
          />
        </div>

        <button className="record-order-button" type="submit">
          تسجيل
        </button>
      </form>
    </div>
  );
};

export default RecordOrder;
