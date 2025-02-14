import React, { useState, useEffect } from "react";
import "./RecordOrder.css";
import {
  getPendingRequests,
  removeRequestFromDb,
  saveRequest,
} from "../../../services/indexedDb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import {
  addCustomerWithEmptyOrder,
  addCustomerWithFilledOrder,
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
import { getProductTypeFromDB } from "../../../utils/indexedDB";
const RecordOrder = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.token);
  const companyId = useSelector((state) => state.user.companyId);

  // Place the useEffect for online status listener here
  useEffect(() => {
    const handleOnline = async () => {
      const pendingRequests = await getPendingRequests(); // Fetch pending requests from IndexedDB
      if (pendingRequests.length > 0) {
        for (const request of pendingRequests) {
          try {
            const response = await fetch(request.url, request.options);
            if (response.ok) {
              // If successful, remove the request from IndexedDB
              removeRequestFromDb(request); // Assuming you have this function
              toast.success("Order submitted after coming online.");
            }
          } catch (error) {
            toast.error("Failed to submit order after coming online:", error);
          }
        }
      }
    };

    window.addEventListener("online", handleOnline);

    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener("online", handleOnline);
  }, []);
  useEffect(() => {
    const fetchProduct = async () => {
      if (navigator.onLine) {
        // User is online, fetch product from API
        try {
          const response = await fetch(
            `http://localhost:5000/api/products/productType/company/${companyId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                type: "Bottles", // Default product type
              }),
            }
          );
          const productData = await response.json();
          dispatch(setProductId(productData.id));
          dispatch(setProductName(productData.type));
          dispatch(setProductPrice(productData.priceInDollars));
          // You could also cache this product in IndexedDB here if needed
        } catch (error) {
          toast.error("Error fetching product data", error);
        }
      } else {
        // User is offline, fetch product from IndexedDB cache
        const product = await getProductTypeFromDB(companyId);
        if (product) {
          // If product exists in the cache, dispatch it
          dispatch(setProductId(product.id));
          dispatch(setProductName(product.type));
          dispatch(setProductPrice(product.priceInDollars));
        } else {
          toast.warn(
            "No cached product found. Please come online to fetch it."
          );
        }
      }
    };

    fetchProduct();
  }, [token, dispatch, companyId]);

  const customerId = useSelector((state) => state.order.customer_Id);
  const areaId = useSelector((state) => state.order.area_Id);
  const shipmentId = useSelector((state) => state.shipment._id);
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
      // Save the request in IndexedDB when offline
      await saveRequest(request);
      toast.info(
        "You're offline. Your order will be submitted when you're back online."
      );
      return;
    }

    try {
      const response = await fetch(request.url, request.options);

      if (response.ok) {
        const responseData = await response.json();

        // Update shipment details based on the order response
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

        // Check delivered value and dispatch appropriate action
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
        toast.error("Error recording order:", errorData.error);
      }
    } catch (error) {
      toast.error("Network error:", error);
      console.log(error);
    }
  };

  const handleCurrencySelection = (currency) => {
    setOrderData({ ...orderData, paymentCurrency: currency });
  };

  return (
    <div className="record-order-container">
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="record-order-title">Record an Order</h1>
      <form className="record-order-form" onSubmit={handleSubmit}>
        <div className="default-product-name">
          Your Default Product: {productName}, default price: {productPrice} $
        </div>
        {/* Number Inputs with Up and Down Arrows */}
        <div className="number-inputs">
          <div className="up-down-input">
            <p>delivered: </p>

            <div className="up-down-buttons">
              <button
                className="arrow"
                type="button"
                onClick={() =>
                  setOrderData({
                    ...orderData,
                    delivered: orderData.delivered
                      ? parseInt(orderData.delivered) + 1
                      : 1,
                  })
                }
              >
                {" "}
                ▲{" "}
              </button>
              <input
                type="number"
                className="number-input"
                placeholder="Delivered"
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
          <p>checkout: {checkout.toFixed(2)} $</p>
          <div className="up-down-input">
            <p>returned: </p>

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
              </button>{" "}
              <input
                type="number"
                className="number-input"
                placeholder="Returned"
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
            <p className="paid-label">paid: </p>
            <button
              type="button"
              className={`currency-button ${
                orderData.paymentCurrency === "USD" ? "selected" : ""
              }`}
              onClick={() => handleCurrencySelection("USD")}
            >
              USD
            </button>
            <button
              type="button"
              className={`currency-button ${
                orderData.paymentCurrency === "LBP" ? "selected" : ""
              }`}
              onClick={() => handleCurrencySelection("LBP")}
            >
              LBP
            </button>
          </div>

          <input
            type="number"
            className="number-input free-select"
            placeholder="Paid"
            name="paid"
            value={orderData.paid}
            onChange={handleChange}
          />
        </div>
        <button className="record-order-button" type="submit">
          Record
        </button>
      </form>
    </div>
  );
};

export default RecordOrder;
