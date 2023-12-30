import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../../Orders/RecordOrder/RecordOrder.css';
import SelectInput from '../../UI reusables/SelectInput/SelectInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import NumberInput from '../../UI reusables/NumberInput/NumberInput';
import { RootState } from '../../../redux/store'; // Update this path with your Redux store structure

const AddProducts: React.FC = () => {
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const shipmentId = useSelector((state: RootState) => state.shipment._id);
  const token = useSelector((state: RootState) => state.user.token);
  const [products, setProducts] = useState({
    name: '',
    value: 0,
    paymentCurrency: '',
    exchangeRate: '6537789b6ed59ef09c18213d',
    companyId: companyId,
    shipmentId: shipmentId,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProducts({ ...products, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(products),
      });

      if (response.ok) {
        toast.success('Products successfully recorded.');
      } else {
        const errorData = await response.json();
        toast.error('Error recording Products:', errorData.error);
      }
    } catch (error: any) {
      toast.error('Network error:', error);
    }
  };

  return (
    <div className="record-order-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="record-order-title">Add Products</h1>
      <form className="record-order-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={products.name}
          placeholder="Name"
          onChange={handleChange}
        />
        <SelectInput
          label="Payment Currency:"
          name="paymentCurrency"
          value={products.paymentCurrency}
          options={[
            { value: '', label: 'Select Currency' },
            { value: 'USD', label: 'USD' },
            { value: 'LBP', label: 'LBP' },
          ]}
          onChange={handleChange}
        />
        <NumberInput
          label="Value:"
          name="value"
          value={products.value}
          onChange={handleChange}
        />
        <button className="record-order-button" type="submit">
          Add products
        </button>
      </form>
    </div>
  );
};

export default AddProducts;
