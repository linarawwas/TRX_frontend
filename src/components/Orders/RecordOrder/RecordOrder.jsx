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
import {
  getPendingRequests,
  getProductTypeFromDB,
  removeRequestFromDb,
  saveProductTypeToDB,
  saveRequest,
} from "../../../utils/indexedDB";
const RecordOrder = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.token);
  const companyId = useSelector((state) => state.user.companyId);

  // // Place the useEffect for online status listener here
  // useEffect(() => {
  //   const handleOnline = async () => {
  //     console.log(
  //       "Device is back online. Waiting 3 seconds before processing pending orders..."
  //     );

  //     await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay for 3 seconds

  //     const pendingRequests = await getPendingRequests(); // Fetch pending requests from IndexedDB

  //     console.log(`Total pending requests: ${pendingRequests.length}`);

  //     if (pendingRequests.length > 0) {
  //       for (const request of pendingRequests) {
  //         try {
  //           console.log(`Processing request: ${JSON.stringify(request)}`);

  //           // Reconstruct the request object properly
  //           const response = await fetch(request.url, {
  //             method: request.options.method,
  //             headers: request.options.headers,
  //             body: request.options.body
  //               ? JSON.stringify(request.options.body)
  //               : null,
  //           });

  //           if (response.ok) {
  //             console.log(
  //               "Order successfully submitted. Removing from IndexedDB."
  //             );
  //             await removeRequestFromDb(request.id);
  //             toast.success("Order submitted after coming online.");
  //           } else {
  //             const errorData = await response.json();
  //             console.error("Server responded with an error:", errorData);
  //             toast.error(`Failed to sync order: ${errorData.message}`);
  //           }
  //         } catch (error) {
  //           console.error("Error syncing offline order:", error);
  //           toast.error(
  //             `Failed to submit order after coming online: ${error.message}`
  //           );
  //         }
  //       }
  //     }
  //   };

  //   window.addEventListener("online", handleOnline);

  //   // Clean up the event listener when the component unmounts
  //   return () => window.removeEventListener("online", handleOnline);
  // }, []);
  useEffect(() => {
    const fetchProduct = async () => {
      const cachedProduct = await getProductTypeFromDB(companyId);
      if (cachedProduct) {
        dispatch(setProductId(cachedProduct.id));
        dispatch(setProductName(cachedProduct.type));
        dispatch(setProductPrice(cachedProduct.priceInDollars));
        return;
      }

      if (navigator.onLine) {
        try {
          const response = await fetch(
            `https://trx-api.linarawas.com//api/products/productType/company/${companyId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ type: "Bottles" }),
            }
          );
          const productData = await response.json();
          dispatch(setProductId(productData.id));
          dispatch(setProductName(productData.type));
          dispatch(setProductPrice(productData.priceInDollars));
          saveProductTypeToDB(companyId, productData);
        } catch (error) {
          toast.error(`Error fetching product data: ${error.message}`);
        }
      } else {
        toast.warn("No cached product found. Please come online to fetch it.");
      }
    };

    fetchProduct();
  }, [token, dispatch, companyId]);

  const customerId = useSelector((state) => state.order.customer_Id);
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
      url: "https://trx-api.linarawas.com//api/orders",
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      },
    };

    // Offline Scenario: Save the order as pending and update shipment details
    if (!navigator.onLine) {
      console.log(orderData);
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

      // Save the order as pending and store in IndexedDB
      dispatch(addPendingOrder(customerId));
      await saveRequest(request); // Save to IndexedDB for future submission
      toast.info(
        "You're offline. Your order will be submitted when you're back online."
      );
      navigate(-1);
      return;
    }

    // Online Scenario: Make the API request to submit the order
    try {
      const response = await fetch(request.url, request.options);

      if (response.ok) {
        const responseData = await response.json();

        // After a successful request, remove from pending orders (if it was pending)
        if (customersWithPendingOrders.includes(customerId)) {
          dispatch(removePendingOrder(customerId));
        }

        // Update shipment details based on the response
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

        // Determine whether the order is filled or empty, and update Redux state
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
        toast.error(`Error fetching product data: ${errorData.message}`);
      }
    } catch (error) {
      toast.error(`Network error: ${error.message}`);
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
