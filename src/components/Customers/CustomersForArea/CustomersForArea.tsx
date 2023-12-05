import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCustomerId, setCustomerId } from "../../../redux/Order/action";

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
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching areas:', error);
        setLoading(false);
      });
  }, [areaId, token, dispatch]);

  const handleOrderState = (customerId: string) => {
    dispatch(setCustomerId(customerId));
    navigate('/recordOrder');
  };

  return (
    <table className="days-table">
      <thead>
        <tr>
          <th className="table-title">Customers of This Area</th>
        </tr>
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
              <td>{customer.name}</td>
              <td>{customer.address}</td>
              <td>{customer.phone}</td>
              <td>
                <button onClick={() => handleOrderState(customer._id)}>record order</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default CustomersForArea;
