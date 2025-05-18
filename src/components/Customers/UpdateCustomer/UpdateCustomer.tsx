import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../UI reusables/UpdateSingleRecord/UpdateSingleRecord.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UpdateCustomer.css';
import { useDispatch, useSelector } from 'react-redux';
import SelectInput from '../../UI reusables/SelectInput/SelectInput';
import CustomerInvoices from '../CustomerInvoices/CustomerInvoices';
import CustomerOrders from '../CustomerOrders/CustomerOrders';
import CustomerInfo from '../CustomerInfo/CustomerInfo';
import { setCustomerId } from '../../../redux/Order/action';

interface Area {
  _id: string;
  name: string;
}

interface CustomerData {
  _id: string;
  name: string;
  phone: string;
  address: string;
  areaId: Area;
  companyId: string;
  hasDiscount: Boolean;
  valueAfterDiscount: Number;
  discountCurrency: string;
  noteAboutCustomer: string;
}

function UpdateCustomer(): JSX.Element {
  const dispatch = useDispatch();
  const token: string = useSelector((state: any) => state.user.token);
  const companyId: string = useSelector((state: any) => state.user.companyId);
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const { customerId } = useParams();
  dispatch(setCustomerId(customerId))
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedInfo, setUpdatedInfo] = useState<CustomerData>({
    _id: '',
    name: '',
    phone: '',
    address: '',
    areaId: { _id: '', name: '' }, // Initialize as an empty object of type Area
    companyId: companyId,
    hasDiscount: false,
    valueAfterDiscount: 0,
    discountCurrency: '',
    noteAboutCustomer: '',
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
        _id: updatedInfo._id !== "" ? updatedInfo._id : originalData!._id,
        name: updatedInfo.name !== "" ? updatedInfo.name : originalData!.name,
        phone: updatedInfo.phone !== "" ? updatedInfo.phone : originalData!.phone,
        address: updatedInfo.address !== "" ? updatedInfo.address : originalData!.address,
        areaId: updatedInfo.areaId._id !== "" ? updatedInfo.areaId : originalData!.areaId,
        hasDiscount: updatedInfo.hasDiscount !== false ? updatedInfo.hasDiscount : originalData!.hasDiscount,
        valueAfterDiscount: updatedInfo.valueAfterDiscount !== 0 ? updatedInfo.valueAfterDiscount : originalData!.valueAfterDiscount,
        discountCurrency: updatedInfo.discountCurrency !== "" ? updatedInfo.discountCurrency : originalData!.discountCurrency,
        noteAboutCustomer: updatedInfo.noteAboutCustomer !== "" ? updatedInfo.noteAboutCustomer : originalData!.noteAboutCustomer,
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
    <div className="update-container customer-info-container" style={{ direction: "rtl", textAlign: "right" }}>
      <ToastContainer position="top-right" autoClose={1000} />
  
      <div className="update-header">
        <h1 className="update-title">معلومات الزبون:</h1>
        {/* <button
          type="button"
          onClick={handleDeleteCustomer}
          className="delete-button"
        >
          حذف
        </button> */}
      </div>
  
      <CustomerInfo customerData={customerData} loading={loading} />
      {customerData && <CustomerInvoices />}
      {customerData && <CustomerOrders />}
  
      <h1 className="update-title edit-button" onClick={handleFormToggle}>
        تعديل الزبون؟
      </h1>
  
      {formVisible && (
        <form className="update-customer-form" onSubmit={handleSubmitUpdate}>
          <input
            type="text"
            name="name"
            value={updatedInfo.name}
            placeholder="الاسم الجديد"
            onChange={handleChange}
          />
          <input
            type="text"
            name="phone"
            value={updatedInfo.phone}
            placeholder="رقم الهاتف الجديد"
            onChange={handleChange}
          />
          <input
            type="text"
            name="address"
            value={updatedInfo.address}
            placeholder="العنوان الجديد"
            onChange={handleChange}
          />
          <SelectInput
            label="المنطقة:"
            name="areaId"
            value={updatedInfo.areaId._id}
            options={areas.map((area) => ({
              value: area._id,
              label: area.name,
            }))}
            onChange={handleChange}
          />
  
          <button type="submit">تحديث الزبون</button>
        </form>
      )}
    </div>
  );
  
}

export default UpdateCustomer;
