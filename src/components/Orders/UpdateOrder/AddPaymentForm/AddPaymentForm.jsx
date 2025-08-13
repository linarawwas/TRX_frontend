import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import './AddPaymentForm.css';

const AddPaymentForm = ({ orderId, orderData, setOrderData }) => {
  const token = useSelector((state) => state.user.token);

  const [paymentData, setPaymentData] = useState({
    paymentAmount: '',          // keep as string for input control
    paymentCurrency: '',        // "USD" | "LBP"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic validation
    const amountNum = Number(paymentData.paymentAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (!paymentData.paymentCurrency) {
      toast.error('يرجى اختيار العملة');
      return;
    }

    // Build minimal payload (server derives exchange rate & company)
    const payload = {
      paymentAmount: amountNum,
      paymentCurrency: String(paymentData.paymentCurrency).toUpperCase(),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/addPayment/${orderId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        toast.error(err?.error || 'فشل في إضافة الدفعة');
        return;
      }

      toast.success('تمت إضافة الدفعة بنجاح');

      // Refresh order details so totals/paid update on screen
      const updated = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (updated.ok) {
        const newOrder = await updated.json();
        setOrderData(newOrder);
        // Optional: reset the form
        setPaymentData({ paymentAmount: '', paymentCurrency: '' });
      } else {
        toast.error('حدث خطأ عند تحميل الطلب بعد التحديث');
      }
    } catch (error) {
      toast.error('فشل في إضافة الدفعة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-form" style={{ direction: 'rtl' }} aria-busy={isSubmitting}>
      {isSubmitting && <div className="payment-progress" aria-hidden="true" />}
      <h2 className="payment-heading">إضافة دفعة</h2>

      <form onSubmit={handleAddPayment} className={isSubmitting ? 'is-submitting' : ''}>
        <div className="form-group">
          <label htmlFor="paymentAmount" className="form-label">مبلغ الدفعة</label>
          <input
            type="number"
            name="paymentAmount"
            id="paymentAmount"
            value={paymentData.paymentAmount}
            onChange={handlePaymentChange}
            className="form-input"
            min="0"
            step="0.01"
            required
            disabled={isSubmitting}
            inputMode="decimal"
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
            disabled={isSubmitting}
          >
            <option value="">اختر العملة</option>
            <option value="LBP">ليرة لبنانية</option>
            <option value="USD">دولار أمريكي</option>
          </select>
        </div>

        <button type="submit" className={`add-payment-button ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              <span>جارٍ الإضافة…</span>
            </>
          ) : (
            'إضافة دفعة'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddPaymentForm;
