import React, { useState, useEffect } from 'react';
import './AddCustomer.css';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';

const AddCustomer = () => {
  const companyId = useSelector(state => state.user.companyId)
  const token = useSelector(state => state.user.token)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    areaId: '',
    address: '',
    companyId: companyId
  });
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    // Fetch areas based on companyId (replace 'YOUR_COMPANY_ID' with actual companyId)
    fetchAreas(companyId);
  }, []);

  const fetchAreas = async (companyId) => {
    try {
      const response = await fetch(`https://api.trx-bi.com/api/areas/company/${companyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch areas');
      }
      const areasData = await response.json();
      setAreas(areasData);
    } catch (error) {
      toast.error('Error fetching areas:', error);
      // Handle error state or display error message to the user
    }
  };

  const handleAreaChange = (e) => {
    const selectedAreaId = e.target.value;
    setFormData({
      ...formData,
      areaId: selectedAreaId
    });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://api.trx-bi.com/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }
      const data = await response.json();
      toast.success('Created customer successfuly'); // Handle success message or further actions upon successful customer creation

    } catch (error) {
      toast.error('Customer creation error:', error);
    }
  };

  return (
    <div className="create-customer-container">
      <h2>Add Customer</h2>
      <ToastContainer position="top-right" autoClose={2000} />

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className='customer-input-label'>Name:</label>
          <input type="text" className='customer-text-input'id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="phone" className='customer-input-label'>Phone:</label>
          <input type="text" className='customer-text-input' id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="areaId" className='customer-input-label'>Area:</label>
          <select id="areaId" name="areaId" value={formData.areaId} onChange={handleAreaChange} required>
            <option value="">Select an area</option>
            {areas.map((area) => (
              <option key={area._id} value={area._id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className='customer-input-label' htmlFor="address">Address:</label>
          <input type="text" className='customer-text-input' id="address" name="address" value={formData.address} onChange={handleChange} required />
        </div>
        <button type="submit" className='add-customer-button'>Add Customer</button>
      </form>
    </div>
  );
};

export default AddCustomer;
