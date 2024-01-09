import React, { useState, useEffect } from 'react';
import './RecordOrder.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { setShipmentDelivered, setShipmentPayments, setShipmentPaymentsInDollars, setShipmentPaymentsInLiras, setShipmentReturned } from '../../../redux/Shipment/action.js'
import { setProductId, setProductName, setProductPrice } from '../../../redux/Order/action';
const RecordOrder = (props) => {
  const dispatch = useDispatch();

  const token = useSelector(state => state.user.token);
  const companyId = useSelector(state => state.user.companyId);
  // const [products, setProducts] = useState([]); since the admin chose to only have one product default, no product array will be mapped
  useEffect(() => {
    // Fetch days data from your API
    fetch("http://localhost:5000/api/adminDeterminedDefaults/defaultProduct", {
      method: "GET", // Assuming this endpoint uses a GET request method
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Send the defaultProduct to another API endpoint to retrieve product _id
        fetch(`http://localhost:5000/api/products/productType/company/${companyId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: data.value, // Send the value obtained from adminDeterminedProducts as type
          }),
        })
          .then((response) => response.json())
          .then((productData) => {
            dispatch(setProductId(productData.id))
            dispatch(setProductName(productData.type))
            dispatch(setProductPrice(productData.priceInDollars))
            // Perform operations with the obtained product _id here if needed
          })
          .catch((error) => {
            console.error("Error fetching product:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching adminDeterminedProducts:", error);
      });
  }, [token, dispatch, companyId]);
  const customerId = useSelector(state => state.order.customer_Id);
  const areaId = useSelector(state => state.order.area_Id);
  const shipmentId = useSelector(state => state.shipment._id);
  const productName = useSelector(state => state.order.product_name)
  const productId = useSelector(state => state.order.product_id)
  const productPrice = useSelector(state => state.order.product_price)
  const [orderData, setOrderData] = useState({
    delivered: 0,
    returned: 0,
    customerid: customerId,
    areaId: areaId,
    paid: 0,
    productId: productId,
    paymentCurrency: '',
    exchangeRate: '6537789b6ed59ef09c18213d',
    companyId: companyId,
    shipmentId: shipmentId
  });
  let deliveredInShipment = useSelector(state => state.shipment.delivered);
  let returnedInShipment = useSelector(state => state.shipment.returned);
  let shipmentPaymentsInLiras = useSelector(state => state.shipment.liraPayments);
  let shipmentPaymentsInDollars = useSelector(state => state.shipment.dollarPayments);
  let totalPayments = useSelector(state => state.shipment.payments)
  let checkout = props.customerData?.hasDiscount ? props.customerData?.valueAfterDiscount * orderData.delivered : orderData.delivered * productPrice;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData({ ...orderData, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const responseData = await response.json();

        // Update shipment details based on the order response
        dispatch(setShipmentDelivered(deliveredInShipment + parseInt(orderData.delivered)));
        dispatch(setShipmentReturned(returnedInShipment + parseInt(orderData.returned)));
        dispatch(setShipmentPaymentsInLiras(shipmentPaymentsInLiras + parseInt(responseData.SumOfPaymentsInLiras)));
        dispatch(setShipmentPaymentsInDollars(shipmentPaymentsInDollars + parseInt(responseData.SumOfPaymentsInDollars)));
        dispatch(setShipmentPayments(totalPayments + parseInt(responseData.paid)));
        toast.success('Order successfully recorded.');
      } else {
        const errorData = await response.json();
        toast.error('Error recording order:', errorData.error);
      }
    } catch (error) {
      toast.error('Network error:', error);
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
        <div className="default-product-name">Your Default Product: {productName}, default price: {productPrice} $</div>
        {/* Number Inputs with Up and Down Arrows */}
        <div className="number-inputs">

          <div className="up-down-input">
            <p>delivered: </p>

            <div className="up-down-buttons">
              <button className='arrow'

                type="button"
                onClick={() =>
                  setOrderData({
                    ...orderData,
                    delivered: orderData.delivered ? parseInt(orderData.delivered) + 1 : 1,
                  })
                }
              > ▲ </button>
              <input
                type="number"
                className="number-input"
                placeholder="Delivered"
                name="delivered"
                value={orderData.delivered}
                onChange={handleChange}
              />
              <button
                type="button" className='arrow'

                onClick={() =>
                  setOrderData({
                    ...orderData,
                    delivered: orderData.delivered && orderData.delivered > 0 ? parseInt(orderData.delivered) - 1 : 0,
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
                className='arrow'
                onClick={() =>
                  setOrderData({
                    ...orderData,
                    returned: orderData.returned ? parseInt(orderData.returned) + 1 : 1,
                  })
                }
              >
                ▲
              </button>  <input
                type="number"
                className="number-input"
                placeholder="Returned"
                name="returned"
                value={orderData.returned}
                onChange={handleChange}
              />
              <button
                type="button" className='arrow'

                onClick={() =>
                  setOrderData({
                    ...orderData,
                    returned: orderData.returned && orderData.returned > 0 ? parseInt(orderData.returned) - 1 : 0,
                  })
                }
              >
                ▼
              </button>
            </div>
          </div>
          <div className="currency-buttons">
            <p className='paid-label'>paid: </p>
            <button type="button"
              className={`currency-button ${orderData.paymentCurrency === 'USD' ? 'selected' : ''}`}
              onClick={() => handleCurrencySelection('USD')}
            >
              USD
            </button>
            <button type="button"
              className={`currency-button ${orderData.paymentCurrency === 'LBP' ? 'selected' : ''}`}
              onClick={() => handleCurrencySelection('LBP')}
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
        {/* Currency Selection Buttons */}

        {/* Record Order Button */}
        <button className="record-order-button" type="submit">
          Record
        </button>
      </form>
    </div>
  );
};

export default RecordOrder;