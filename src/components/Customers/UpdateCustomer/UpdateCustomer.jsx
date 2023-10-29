import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../UI reusables/UpdateSingleRecord/UpdateSingleRecord.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function UpdateCustomer() {
  const navigate = useNavigate();

  const { customerId } = useParams();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
 
 
  const handleDeleteCustomer = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Customer deleted successfully');
        setTimeout(() => {
          navigate('/viewCustomers'); // Navigate to the desired route after 3 seconds
        }, 1500);
      } else {
        toast.error('Error deleting customer');

        // Handle errors here
        console.error('Error deleting customer');
      }
    } catch (error) {
      toast.error('Error deleting customer');

      console.error('Error deleting customer:', error);
    }
  };

  useEffect(() => {
    // Fetch the customer details based on customerId
    fetch(`http://localhost:5000/api/customers/${customerId}`)
      .then((response) => response.json())
      .then((data) => {
        setCustomerData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching customer details:', error);
        setLoading(false);
      });
  }, [customerId]);

  return (
    <div className="update-container">
      <ToastContainer position="top-right" autoClose={1000} />

      <div className='update-header'>
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
        </div>
      ) : (
        <p>Customer not found</p>
      )}

    </div>
  );
}

export default UpdateCustomer;