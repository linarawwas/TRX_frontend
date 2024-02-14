import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCustomerId, setCustomerId } from "../../redux/Order/action";
import './CustomersForArea.css'
interface Customer {
  _id: string;
  name: string;
  address: string;
  phone: string;
}

const CustomersForArea = (): JSX.Element => {
  const token: string = useSelector((state: any) => state.user.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { areaId } = useParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    dispatch(clearCustomerId());

    // Fetch areas data for the specified day
    fetch(`http://localhost:5000/api/customers/area/${areaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then((response) => response.json())
      .then((data: Customer[]) => {
        setCustomers(data);
        console.log("number of customers in your company: ",data.length)

        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching areas:', error);
        setLoading(false);
      });
  }, [areaId, token, dispatch]);

  const handleOrderState = (customerId: string) => {
    dispatch(setCustomerId(customerId));
    navigate('/recordOrderforCustomer');
  };

  return (<>
    <h3 className="table-title">Customers of This Area
    </h3>
    <table className="customers-for-area-table">
      <thead>
        <tr>
          <th>name</th>
          <th>Address</th>
          <th>Phone Number</th>
          <th>Record Order</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={4}>Loading...</td>
          </tr>
        ) : (
          customers.map((customer) => (
            <tr key={customer._id}>
              <td> {customer.name}</td>
              <td>{customer.address}</td>
              <td>{customer.phone}</td>
              <td>
                <button className="customer-for-area-record-button" onClick={() => handleOrderState(customer._id)}>➡️</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
   </>
  );
};

export default CustomersForArea;
