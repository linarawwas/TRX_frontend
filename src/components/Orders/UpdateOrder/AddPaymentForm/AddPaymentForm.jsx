import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import './AddPaymentForm.css'
export const AddPaymentForm = (props) => {
    const token = useSelector((state) => state.user.token);
    const orderId = props.orderId;
    const orderData = props.orderData;
    const setOrderData = props.setOrderData;
    const [paymentData, setPaymentData] = useState({
        paymentAmount: '',
        paymentCurrency: '',
        exchangeRateId: '6537789b6ed59ef09c18213d',
    });
    const handleCurrencySelection = (currency) => {
        setOrderData({ ...orderData, paymentCurrency: currency });
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setPaymentData({
            ...paymentData,
            [name]: value,
        });
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://trx-api.linarawas.com/api/orders/addPayment/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(paymentData),
            });

            if (response.ok) {
                toast.success('Payment added successfully');

                const updatedOrderResponse = await fetch(`https://trx-api.linarawas.com/api/orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (updatedOrderResponse.ok) {
                    const updatedOrderData = await updatedOrderResponse.json();
                    setOrderData(updatedOrderData);
                    console.log('Payment added successfully');
                } else {
                    toast.error('Error fetching updated order data');
                    console.error('Error fetching updated order data');
                }
            } else {
                toast.error('Error adding payment');
                console.error('Error adding payment');
            }
        } catch (error) {
            toast.error('Error adding payment');
            console.error('Error adding payment:', error);
        }
    };

    return (
        <div className="payment-form" style={{ direction: "rtl", textAlign: "right" }}>
          <h2 className="payment-heading">إضافة دفعة</h2>
          <form>
            <div className="form-group">
              <label htmlFor="paymentAmount" className="form-label">
                مبلغ الدفعة
              </label>
              <input
                type="number"
                id="paymentAmount"
                name="paymentAmount"
                value={paymentData.paymentAmount}
                onChange={handlePaymentChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="paymentCurrency" className="form-label">
                عملة الدفعة
              </label>
              <select
                id="paymentCurrency"
                name="paymentCurrency"
                value={paymentData.paymentCurrency}
                onChange={handlePaymentChange}
                className="form-input"
              >
                <option value="">اختر العملة</option>
                <option value="LBP">ليرة لبنانية</option>
                <option value="USD">دولار أمريكي</option>
              </select>
            </div>
            <button type="button" onClick={handleAddPayment} className="add-payment-button">
              إضافة دفعة
            </button>
          </form>
        </div>
      );
      
};

export default AddPaymentForm;
