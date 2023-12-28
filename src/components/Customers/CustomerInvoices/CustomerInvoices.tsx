import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

interface Sums {
  deliveredSum: number;
  returnedSum: number;
  bottlesLeft: number;
  checkoutSum: number;
  paidSum: number;
  totalSum: number;
}

interface CustomerInvoicesProps {
  customerId: string;
}

const CustomerInvoices: React.FC<CustomerInvoicesProps> = ({ customerId }) => {
  const [sums, setSums] = useState<Sums | null>(null);
  const [loading, setLoading] = useState(true);
  const token: string = useSelector((state: any) => state.user.token);

  useEffect(() => {
    const fetchCustomerInvoices = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/customers/reciept/${customerId}`,
        {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        setSums(data.sums);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customer receipt:', error);
        setLoading(false);
      }
    };

    fetchCustomerInvoices();
  }, [customerId]);

  return (
    <div className="customer-receipt">
      <h2>Customer Receipt</h2>
      {loading ? (
        <p>Loading...</p>
      ) : sums ? (
        <div className="receipt-details">
          <p>Delivered Sum: {sums.deliveredSum}</p>
          <p>Returned Sum: {sums.returnedSum}</p>
          <p>Bottles Left: {sums.bottlesLeft}</p>
          <p>Checkout Sum: {sums.checkoutSum}</p>
          <p>Paid Sum: {sums.paidSum}</p>
          <p>Total Sum: {sums.totalSum}</p>
        </div>
      ) : (
        <p>No data available for this customer</p>
      )}
    </div>
  );
};

export default CustomerInvoices;
