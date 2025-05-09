import React, { useState, useEffect, ChangeEvent } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { toast } from 'react-toastify';
import './AddDiscount.css';
interface Area {
  _id: string;
  name: string;
}

interface Customer {
  _id: string;
  name: string;
}

interface FormData {
  areaId: string;
  customerId: string;
  hasDiscount: boolean;
  noteAboutCustomer: string;
  discountCurrency: string;
  valueAfterDiscount: number;
}

const AddDiscount: React.FC = () => {
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const token = useSelector((state: RootState) => state.user.token);
  const [areaOptions, setAreaOptions] = useState<Area[]>([]);
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    areaId: '',
    customerId: '',
    hasDiscount: true,
    noteAboutCustomer: '',
    discountCurrency: 'USD',
    valueAfterDiscount: 0,
  });

  // Fetch areas from the API
  useEffect(() => {
    fetch(`http://localhost:5000/api/areas/company/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => setAreaOptions(data))
      .catch(error => console.error('Error fetching areas:', error));
  }, [companyId, token]);

  // Fetch exchange rate from the API
  useEffect(() => {
    fetch(`http://localhost:5000/api/exchangeRates/6537789b6ed59ef09c18213d`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => setExchangeRate(data.exchangeRateInLBP))
      .catch(error => console.error('Error fetching exchange rate:', error));
  }, []);

  // Fetch customers based on selected area
  useEffect(() => {
    if (formData.areaId) {
      fetch(`http://localhost:5000/api/customers/area/${formData.areaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => setCustomerOptions(data))
        .catch(error => console.error('Error fetching customers:', error));
    }
  }, [formData.areaId, token]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    if (field === 'discountCurrency' && value !== 'USD') {
      // Convert valueAfterDiscount to USD using exchange rate
      console.log(exchangeRate);

      const convertedValue = formData.valueAfterDiscount! / exchangeRate;
      setFormData(prevData => ({
        ...prevData,
        discountCurrency: 'USD',
        valueAfterDiscount: convertedValue,
      }));
      console.log(convertedValue);
    } else {
      setFormData(prevData => ({
        ...prevData,
        [field]: value,
      }));
    }
  };

  const handleSubmit = () => {
    fetch(`http://localhost:5000/api/customers/${formData.customerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then(response => response.json())
      .then(data => {
        // Handle success response
        console.log('Data sent successfully:', data);
        console.log("customer id: ", formData.customerId)
        toast.success('Customer Discount Saved Successfully!')
      })
      .catch(error => {
        // Handle error
        console.error('Error sending data:', error);
      });
  };

  return (
    <div className='add-discount-container'>
      <h1 className="title">Add Customer Discount</h1>
      <form>

        <label>
          Area:
          <select
            value={formData.areaId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              handleInputChange('areaId', e.target.value)
            }
          >
            <option value="">Select an area</option>
            {areaOptions.map(area => (
              <option key={area._id} value={area._id}>
                {area.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Customer:
          <select
            value={formData.customerId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              handleInputChange('customerId', e.target.value)
            }
            }
          >
            <option value="">Select a customer</option>
            {customerOptions.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Explain Briefly:
          <textarea
            value={formData.noteAboutCustomer}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleInputChange('noteAboutCustomer', e.target.value)
            }
          />
        </label>
        <label>
          Value After Discount:
          <input
            type="number"
            value={formData.valueAfterDiscount || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleInputChange('valueAfterDiscount', e.target.value)
            }
          />
        </label>
        <label>
          Discount Currency:
          <select
            value={formData.discountCurrency}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              handleInputChange('discountCurrency', e.target.value)
            }
          >
            <option value="USD">USD</option>
            <option value="LBP">LBP</option>
          </select>
        </label>
        <button onClick={handleSubmit}>Submit</button>
      </form>

    </div>
  );
};

export default AddDiscount;
