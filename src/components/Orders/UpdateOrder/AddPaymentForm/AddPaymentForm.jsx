import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import './AddPaymentForm.css';

const AddPaymentForm = ({ orderId, orderData, setOrderData }) => {
  const token = useSelector((state) => state.user.token);
  const [paymentData, setPaymentData] = useState({
    paymentAmount: '',
    paymentCurrency: '',
    exchangeRateId: '6878aa9ac9f1a18731a5b8a4',
  });

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/orders/addPayment/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        toast.success('تمت إضافة الدفعة بنجاح');

        const updated = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (updated.ok) {
          const newOrder = await updated.json();
          setOrderData(newOrder);
        } else {
          toast.error('حدث خطأ عند تحميل الطلب بعد التحديث');
        }
      } else {
        toast.error('فشل في إضافة الدفعة');
      }
    } catch (error) {
      toast.error('فشل في إضافة الدفعة');
    }
  };

  return (
    <div className="payment-form" style={{ direction: 'rtl' }}>
      <h2 className="payment-heading">إضافة دفعة</h2>
      <form onSubmit={handleAddPayment}>
        <div className="form-group">
          <label htmlFor="paymentAmount" className="form-label">مبلغ الدفعة</label>
          <input
            type="number"
            name="paymentAmount"
            id="paymentAmount"
            value={paymentData.paymentAmount}
            onChange={handlePaymentChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="paymentCurrency" className="form-label">عملة الدفعة</label>
          <select
            name="paymentCurrency"
            id="paymentCurrency"
            value={paymentData.paymentCurrency}
            onChange={handlePaymentChange}
            className="form-input"
            required
          >
            <option value="">اختر العملة</option>
            <option value="LBP">ليرة لبنانية</option>
            <option value="USD">دولار أمريكي</option>
          </select>
        </div>

        <button type="submit" className="add-payment-button">
          إضافة دفعة
        </button>
      </form>
    </div>
  );
};

export default AddPaymentForm;
