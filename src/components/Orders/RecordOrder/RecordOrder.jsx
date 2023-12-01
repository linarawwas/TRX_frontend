import React, { useState, useEffect } from 'react';
import './RecordOrder.css';
import SelectInput from '../../UI reusables/SelectInput/SelectInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import NumberInput from '../../UI reusables/NumberInput/NumberInput.js'
import { setShipmentDelivered, setShipmentPayments, setShipmentPaymentsInDollars, setShipmentPaymentsInLiras, setShipmentReturned } from '../../../redux/Shipment/action.js'
const RecordOrder = () => {
  const dispatch = useDispatch();
  const customerId = useSelector(state => state.order.customer_Id);
  const areaId = useSelector(state => state.order.area_Id);
  const companyId = useSelector(state => state.user.companyId);
  const shipmentId = useSelector(state => state.shipment._id);
  const token = useSelector(state => state.user.token);
  const [products, setProducts] = useState([]);
  const [orderData, setOrderData] = useState({
    delivered: 0,
    returned: 0,
    customerid: customerId,
    areaId: areaId,
    paid: 0,
    productId: '',
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
  useEffect(() => {
    // Fetch days data from your API
    fetch(`http://localhost:5000/api/products/company/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Error fetching days:", error);
      });
  }, [token, companyId]);

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


  return (
    <div className="record-order-container">
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="record-order-title">Record an Order</h1>
      <form className="record-order-form" onSubmit={handleSubmit}>
        <SelectInput
          label="Type of Order:"
          name="productId"
          value={orderData.productId}
          options={products.map((product) => ({ value: product.id, label: product.type }))}
          onChange={handleChange}
        />
        <SelectInput
          label="Payment Currency:"
          name="paymentCurrency"
          value={orderData.paymentCurrency}
          options={[
            { value: '', label: 'Select Currency' },
            { value: 'USD', label: 'USD' },
            { value: 'LBP', label: 'LBP' },
          ]}
          onChange={handleChange}
        />
        <NumberInput
          label="Delivered:"
          name="delivered"
          value={orderData.delivered}
          onChange={handleChange}
        />
        <NumberInput
          label="Returned:"
          name="returned"
          value={orderData.returned}
          onChange={handleChange}
        />
        <NumberInput
          label="Paid:"
          name="paid"
          value={orderData.paid}
          onChange={handleChange}
        />
        <button className="record-order-button" type="submit">
          Record Order
        </button>
      </form>
    </div>
  );
}

export default RecordOrder;
