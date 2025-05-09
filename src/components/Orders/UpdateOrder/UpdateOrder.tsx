import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../UI reusables/UpdateSingleRecord/UpdateSingleRecord.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import './UpdateOrder.css'
import AddPaymentForm from './AddPaymentForm/AddPaymentForm';
import OrderReceipt from './OrderReceipt/OrderReceipt';
import PaymentInfo from './PaymentInfo/PaymentInfo';

function UpdateOrder(): JSX.Element {
  const token = useSelector((state: any) => state.user.token);
  const navigate = useNavigate();

  const { orderId } = useParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formVisible, setFormVisible] = useState(false);
  const handleFormToggle = () => {
    setFormVisible(!formVisible);
  };

  const handleDeleteOrder = async (): Promise<void> => {
    try {
      const response = await fetch(`https://trx-api.linarawas.com/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Order deleted successfully');
        setTimeout(() => {
          navigate('/viewOrders');
        }, 1500);
      } else {
        toast.error('Error deleting order');
        console.error('Error deleting order');
      }
    } catch (error) {
      toast.error('Error deleting order');
      console.error('Error deleting order:', error);
    }
  };
  useEffect(() => {
    // Fetch the order details based on orderId
    fetch(`https://trx-api.linarawas.com/api/orders/${orderId}`, {
      headers: {
        'Content-Type': 'application/json', Authorization: `Bearer ${token}`,

      }
    })
      .then((response) => response.json())
      .then((data) => {
        setOrderData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching order details:', error);
        setLoading(false);
      });
  }, [orderId, token]);

  return (
    <div className="update-container" style={{ direction: "rtl", textAlign: "right" }}>
      <ToastContainer position="top-right" autoClose={1000} />
  
      <div className='update-header'>
        <h1 className="update-title">معلومات الفوترة:</h1>
        {/* <button
          type="button"
          onClick={handleDeleteOrder}
          className="delete-button"
        >          حذف الطلب
        </button> */}
      </div>
      <OrderReceipt orderData={orderData} loading={loading} />
      <PaymentInfo payments={orderData?.payments} />
      <h1 className="update-title edit-button" onClick={handleFormToggle}>
        {formVisible ? "إخفاء النموذج" : "إضافة دفع جديد؟"}
      </h1>
      {formVisible &&
        <AddPaymentForm orderData={orderData} orderId={orderId} setOrderData={setOrderData} />
      }
    </div>
  );
  
}

export default UpdateOrder;