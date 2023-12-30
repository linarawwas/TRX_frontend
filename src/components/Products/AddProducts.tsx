import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../Orders/RecordOrder/RecordOrder.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import NumberInput from '../UI reusables/NumberInput/NumberInput';
import SelectInput from '../UI reusables/SelectInput/SelectInput';

const AddProducts: React.FC = () => {
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const token = useSelector((state: RootState) => state.user.token);
  const [products, setProducts] = useState({
    type:'',
    priceInDollars: 0,
    isReturnable: false,
    companyId: companyId,
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
          name="type"
          value={products.type}
          placeholder="type"
          onChange={handleChange}
        />
        <SelectInput
          label="isReturnable:"
          name="isReturnable"
          value={products.isReturnable}
          options={[
            { value: '', label: 'Select' },
            { value: true, label: 'true' },
            { value: false, label: 'false' },
          ]}
          onChange={handleChange}
        />
        <NumberInput
          label="priceInDollars:"
          name="priceInDollars"
          value={products.priceInDollars}
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
