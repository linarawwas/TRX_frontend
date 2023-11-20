import React, { useState, useEffect } from 'react';
import './OrdersTable.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);

  const companyId = useSelector(state => state.user.companyId);
  const token = useSelector(state => state.user.token);
  console.log(companyId)
  console.log(token)
  useEffect(() => {
    if (companyId) {
      fetch(`http://localhost:5000/api/orders/company/${companyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
        .then((response) => response.json())
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching orders:', error);
          setLoading(false);
        });
    }
  }, [token, companyId]);

  // Number of records to display on each page
  const recordsPerPage = 7;

  // Function to handle page change
  const handlePageChange = (newPage) => {
    setSelectedItem(newPage);
    setCurrentPage(newPage);
  };

  // Function to go to the previous page
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  // Function to go to the next page
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      handlePageChange(currentPage + 1);
    }
  };

  // Calculate the total number of pages
  const totalPages = Math.ceil(orders.length / recordsPerPage);

  // Get the orders for the current page
  const ordersForPage = orders?.slice(
    currentPage * recordsPerPage,
    (currentPage + 1) * recordsPerPage
  );

  return (
    <div className='ordersBody'>
      <h2 className='ordersTitle'> Orders</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product Type</th>
                <th>Total Checkout</th>
                <th>See More...</th>
              </tr>
            </thead>
            <tbody>
              {ordersForPage.map((order) => (
                <tr key={order._id}>
                  <td>{order.customer.name}</td>
                  <td>{order.product.type}</td>
                  <td>{order.total}</td>
                  <td>
                    {/* Create a Link for the action button */}
                    <Link to={`/updateOrder/${order._id}`}>
                      Edit Order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="pagination">
              <div className="nav-arrow left" onClick={goToPreviousPage}>
                &lt;
              </div>
              <Carousel
                showStatus={false}
                showArrows={false}
                showThumbs={false}
                selectedItem={selectedItem}
              >
                {Array.from({ length: totalPages }, (_, i) => (
                  <div
                    key={i}
                  // onClick={() => handlePageChange(i)}
                  >
                    Page {i + 1}
                  </div>
                ))}
              </Carousel>
              <div className="nav-arrow right" onClick={goToNextPage}>
                &gt;
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OrdersTable;
