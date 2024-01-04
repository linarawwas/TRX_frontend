import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Link } from 'react-router-dom';
import './Customers.css';
import { useSelector } from 'react-redux';
import AddCustomers from '../AddCustomers/AddCustomers';
import AddCustomer from '../AddCustomer/AddCustomer';
import SpinLoader from '../../UI reusables/SpinLoader/SpinLoader';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: string;
}

const Customers: React.FC = () => {
  const token: string = useSelector((state: any) => state.user.token);
  const companyId: string = useSelector((state: any) => state.user.companyId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [showInsertBulk, setShowInsertBulk] = useState<boolean>(false);
  const [showInsertOne, setShowInsertOne] = useState<boolean>(false);
  useEffect(() => {
    fetch(`http://localhost:5000/api/customers/company/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data: Customer[]) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching customers:', error);
        setLoading(false);
      });
  }, [token, companyId, showInsertBulk, showInsertOne]);

  const recordsPerPage: number = 4;
  const totalPages: number = Math.ceil(customers.length / recordsPerPage);

  const handlePageChange = (newPage: number): void => {
    setSelectedItem(newPage);
    setCurrentPage(newPage);
  };

  const goToPreviousPage = (): void => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  const goToNextPage = (): void => {
    if (currentPage < totalPages - 1) {
      handlePageChange(currentPage + 1);
    }
  };

  const customersForPage: Customer[] = customers.slice(
    currentPage * recordsPerPage,
    (currentPage + 1) * recordsPerPage
  );

  return (
    <div className='customers-body'>
      <div className='customer-header'>
        <h2 className='customers-title'>Customers</h2>
        <div className='customer-adding-options'>
          <button className='customer-adding-option' onClick={() => {
            setShowInsertBulk(!showInsertBulk)
          }}> {showInsertBulk ? 'Hide Form' : 'Add Many?'} </button>
          <button className='customer-adding-option'
            onClick={() => {
              setShowInsertOne(!showInsertOne)
            }}> {showInsertOne ? 'Show customers' : 'Add one?'}  </button>
          {showInsertBulk &&
            <AddCustomers />}
          {showInsertOne &&
            <AddCustomer />}
        </div>
      </div>


      {loading ? (
        <SpinLoader/> 
      ) : (<div>
        {!showInsertOne && <table className="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {customersForPage.map((customer) => (
              <tr key={customer._id}>
                <td>{customer?.name}</td>
                <td>{customer?.address}</td>
                <td className='link-to-edit'>
                  <Link to={`/updateCustomer/${customer._id}`}>
                    📝
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
        {totalPages > 1 && (
          <div className="pagination">
            
            
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
            <div className='nav-arrows'>  
              <div className="nav-arrow left" onClick={goToPreviousPage}>
              &lt;
            </div>
            <div className="nav-arrow right" onClick={goToNextPage}>
              &gt;
            </div></div>
          
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default Customers;
