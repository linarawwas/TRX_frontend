import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../UI reusables/UpdateSingleRecord/UpdateSingleRecord.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UpdateCustomer.css';

function UpdateCustomer() {
  const navigate = useNavigate();

  const { customerId } = useParams();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatedInfo, setUpdatedInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [originalData, setOriginalData] = useState(null); // Store original customer data

  const [formVisible, setFormVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && !/^\d*$/.test(value)) {
      toast.error('Enter only numeric values for phone number.');
    }
    setUpdatedInfo({ ...updatedInfo, [name]: value });
  };

  const handleFormToggle = () => {
    setFormVisible(!formVisible);
  };

  useEffect(() => {
    fetch(`http://localhost:5000/api/customers/${customerId}`)
      .then((response) => response.json())
      .then((data) => {
        setCustomerData(data);
        setOriginalData(data); // Store the original customer data
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching customer details:', error);
        setLoading(false);
      });
  }, [customerId]);

  const handleSubmitUpdate = async () => {
    try {
      // Create an object to represent the updated data
      const updatedData = {
        name: updatedInfo.name !== "" ? updatedInfo.name : originalData.name,
        phone: updatedInfo.phone !== "" ? updatedInfo.phone : originalData.phone,
        address: updatedInfo.address !== "" ? updatedInfo.address : originalData.address,
      };

      // Send a PUT request with the updated data
      const response = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        toast.success('Customer Updated successfully');
        setCustomerData((prevData) => ({
          ...prevData,
          ...updatedData,
        }));
      } else {
        toast.error('Error updating customer');
      }
    } catch (error) {
      toast.error('Error updating customer');
      console.error('Error updating customer:', error);
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Customer deleted successfully');
        setTimeout(() => {
          navigate('/customers');
        }, 1500);
      } else {
        toast.error('Error deleting customer');
        console.error('Error deleting customer');
      }
    } catch (error) {
      toast.error('Error deleting customer');
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <div className="update-container">
      <ToastContainer position="top-right" autoClose={1000} />

      <div className="update-header">
        <h1 className="update-title">Customer Information:</h1>
        <button
          type="button"
          onClick={handleDeleteCustomer}
          className="delete-button"
        >
          <FontAwesomeIcon icon={faTrash} />
          Delete
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : customerData ? (
        <div>
          <table className="details-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(customerData).map(([key, value]) => (
                <tr key={key}>
                  <td className="field-name">{key}</td>
                  <td className="field-value">{JSON.stringify(value, null, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h1 className="update-title edit-button" onClick={handleFormToggle}>
            Edit Customer
          </h1>
          {formVisible && (
            <form className="update-customer-form" onSubmit={handleSubmitUpdate}>
              <input
                type="text"
                name="name"
                value={updatedInfo.name}
                placeholder="New Name"
                onChange={handleChange}
              ></input>
              <input
                type="text"
                name="phone"
                value={updatedInfo.phone}
                placeholder="New Phone"
                onChange={handleChange}
              ></input>
              <input
                type="text"
                name="address"
                value={updatedInfo.address}
                placeholder="New address"
                onChange={handleChange}
              ></input>
              <button type="submit">Update Customer</button>
            </form>
          )}
        </div>
      ) : (
        <p>Customer not found</p>
      )}
    </div>
  );
}

export default UpdateCustomer;
