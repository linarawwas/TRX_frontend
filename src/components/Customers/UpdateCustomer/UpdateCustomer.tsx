import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../UI reusables/UpdateSingleRecord/UpdateSingleRecord.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UpdateCustomer.css';
import { useSelector } from 'react-redux';
import SelectInput from '../../UI reusables/SelectInput/SelectInput';

interface Area {
  _id: string;
  name: string;
}

interface CustomerData {
  name: string;
  phone: string;
  address: string;
  areaId: string;
  companyId: string; 
}

function UpdateCustomer(): JSX.Element {
  const token: string = useSelector((state: any) => state.user.token);
  const companyId: string = useSelector((state: any) => state.user.companyId);
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const { customerId } = useParams();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedInfo, setUpdatedInfo] = useState<CustomerData>({
    name: '',
    phone: '',
    address: '',
    areaId: '',
    companyId: companyId
  });
  const [originalData, setOriginalData] = useState<CustomerData | null>(null);

  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/areas/company/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data: Area[]) => {
        setAreas(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching days:", error);
        setLoading(false);
      });
  }, [token, companyId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' && !/^\d*$/.test(value)) {
      toast.error('Enter only numeric values for phone number.');
    }
    setUpdatedInfo({ ...updatedInfo, [name]: value });
  };

  const handleFormToggle = () => {
    setFormVisible(!formVisible);
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (response.ok) {
        const data: CustomerData = await response.json();
        setCustomerData(data);
        setOriginalData(data);
        setLoading(false);
      } else {
        console.error('Error fetching customer details:', response.status);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setLoading(false);
    }
  }, [customerId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData, token]);

  const handleSubmitUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const updatedData: CustomerData = {
        name: updatedInfo.name !== "" ? updatedInfo.name : originalData!.name,
        phone: updatedInfo.phone !== "" ? updatedInfo.phone : originalData!.phone,
        address: updatedInfo.address !== "" ? updatedInfo.address : originalData!.address,
        areaId: updatedInfo.areaId !== "" ? updatedInfo.areaId : originalData!.areaId,
        companyId: companyId
      };

      const response = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        toast.success('Customer Updated successfully');
        fetchData();
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        <SpinLoader/> 
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
            Edit Customer ?
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
              <SelectInput
                label="Area:"
                name="areaId"
                value={updatedInfo.areaId}
                options={areas.map((area) => ({ value: area._id, label: area.name }))}
                onChange={handleChange}
              />
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
