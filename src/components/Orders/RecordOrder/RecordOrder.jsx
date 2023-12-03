import React, { useState, useEffect } from 'react';
import './RecordOrder.css';
import SelectInput from '../../UI reusables/SelectInput/SelectInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import NumberInput from '../../UI reusables/NumberInput/NumberInput.js'
import { setShipmentDelivered, setShipmentPayments, setShipmentPaymentsInDollars, setShipmentPaymentsInLiras, setShipmentReturned } from '../../../redux/Shipment/action.js'
import { setProductId, setProductName } from '../../../redux/Order/action';
const RecordOrder = () => {
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
            type: data.value, // Send the value obtained from adminDeterminedDefaults as type
          }),
        })
          .then((response) => response.json())
          .then((productData) => {
            dispatch(setProductId(productData.id))
            dispatch(setProductName(productData.type))

            // Perform operations with the obtained product _id here if needed
          })
          .catch((error) => {
            console.error("Error fetching product:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching adminDeterminedDefaults:", error);
      });
  }, [token, dispatch, companyId]);
  const customerId = useSelector(state => state.order.customer_Id);
  const areaId = useSelector(state => state.order.area_Id);
  const shipmentId = useSelector(state => state.shipment._id);
const productname=useSelector(state=>state.order.product_name)
  const productId = useSelector(state => state.order.product_id)

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

  const handleIncrement = (field) => {
    setOrderData({
      ...orderData,
      [field]: orderData[field] ? parseInt(orderData[field]) + 1 : 1,
    });
  };

  const handleDecrement = (field) => {
    setOrderData({
      ...orderData,
      [field]: orderData[field] && orderData[field] > 0 ? parseInt(orderData[field]) - 1 : 0,
    });
  };

  return (
    <div className="record-order-container">
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="record-order-title">Record an Order</h1>
      <form className="record-order-form" onSubmit={handleSubmit}>
        <div className="default-product-name">Your Default Product: {productname}</div>
        
        {/* Currency Selection Buttons */}
        <div className="currency-buttons">
          <button
            className={`currency-button ${orderData.paymentCurrency === 'USD' ? 'selected' : ''}`}
            onClick={() => handleCurrencySelection('USD')}
          >
            USD
          </button>
          <button
            className={`currency-button ${orderData.paymentCurrency === 'LBP' ? 'selected' : ''}`}
            onClick={() => handleCurrencySelection('LBP')}
          >
            LBP
          </button>
        </div>
        
        {/* Number Inputs */}
        <div className="number-inputs">
          {/* <input
            type="number"
            className="number-input"
            placeholder="Delivered"
            name="delivered"
            value={orderData.delivered}
            onChange={handleChange}
          />
          <input
            type="number"
            className="number-input"
            placeholder="Returned"
            name="returned"
            value={orderData.returned}
            onChange={handleChange}
          /> */}
          {/* Number Inputs with Up and Down Arrows */}
        <div className="number-inputs">
          <div className="up-down-input">
            <input
              type="number"
              className="number-input"
              placeholder="Delivered"
              name="delivered"
              value={orderData.delivered}
              onChange={handleChange}
            />
            <div className="up-down-buttons">
              <button
                type="button"
                onClick={() =>
                  setOrderData({
                    ...orderData,
                    delivered: orderData.delivered ? parseInt(orderData.delivered) + 1 : 1,
                  })
                }
              >
                ▲
              </button>
              <button
                type="button"
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
          <div className="up-down-input">
            <input
              type="number"
              className="number-input"
              placeholder="Returned"
              name="returned"
              value={orderData.returned}
              onChange={handleChange}
            />
            <div className="up-down-buttons">
              <button
                type="button"
                onClick={() =>
                  setOrderData({
                    ...orderData,
                    returned: orderData.returned ? parseInt(orderData.returned) + 1 : 1,
                  })
                }
              >
                ▲
              </button>
              <button
                type="button"
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
        </div>
          <input
            type="number"
            className="number-input"
            placeholder="Paid"
            name="paid"
            value={orderData.paid}
            onChange={handleChange}
          />
        </div>
        
        {/* Record Order Button */}
        <button className="record-order-button" type="submit">
          Record Order
        </button>
      </form>
    </div>
  );
};

export default RecordOrder;
