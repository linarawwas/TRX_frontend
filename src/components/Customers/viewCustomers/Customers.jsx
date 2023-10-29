import React, { useState, useEffect } from 'react';
import '../../Orders/OrdersTable/OrdersTable.jsx'; // Import your CSS file
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import {Link} from 'react-router-dom';
import './Customers.css'
export default function Customers({ match }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);

  useEffect(() => {
    // Fetch customers data
    fetch('http://localhost:5000/api/customers')
      .then((response) => response.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching customers:', error);
        setLoading(false);
      });
  }, []);
  // Number of records to display on each page
  const recordsPerPage = 7;

  // Calculate the total number of pages
  const totalPages = Math.ceil(customers.length / recordsPerPage);

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

  // Get the customers for the current page
  const customersForPage = customers.slice(
    currentPage * recordsPerPage,
    (currentPage + 1) * recordsPerPage
  );

  return (
    <div className='customers-body'>
      <h2 className='customers-title'>Customers</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {customersForPage.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.address}</td>
                  <td>
                    {/* Create a Link for the action button */}
                    <Link to={`/updateCustomer/${customer._id}`}>
                      Edit Customer
                    </Link>
                  </td>                </tr>
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
                  <div key={i} onClick={() => handlePageChange(i)}>
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
};