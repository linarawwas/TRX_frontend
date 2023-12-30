import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import './ProductsList.css';
import '../Customers/CustomerInvoices/CustomerInvoices.css'
import SpinLoader from '../UI reusables/SpinLoader/SpinLoader.jsx';
import AddProducts from './AddProducts';
interface Product {
    _id: string;
    type: string;
    priceInDollars: number;
    isReturnable: boolean;
    companyId: string;
}
const ProductsList: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(4);
    const [showAddProducts, setShowAddProducts] = useState<Boolean>(false);
    const companyId = useSelector((state: any) => state.user.companyId);
    const [extraProducts, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const token: string = useSelector((state: any) => state.user.token);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/products/company/${companyId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = response.data;
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching extra products:', error);
                setLoading(false);
            }
        }
        if (companyId) {
            fetchProducts();
        }
    }, [companyId, token, showAddProducts]);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = extraProducts.slice(indexOfFirstRecord, indexOfLastRecord);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        return (
            <ul className="pagination">
                {Array.from({ length: Math.ceil(extraProducts.length / recordsPerPage) }, (_, index) => (
                    <li key={index} onClick={() => paginate(index + 1)} className={`pagination-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        {index + 1}
                    </li>
                ))}
            </ul>
        );
    };

    const handleDeleteExpense = async (productId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success('product deleted successfully');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast.error('Error deleting product');
            }
        } catch (error) {
            toast.error('Error deleting product');
            console.error('Error deleting product:', error);
        }
    };
    return (
        <div className="products">
            <ToastContainer position="top-right" autoClose={1000} />

            <h2>Extra Products</h2>
            <h3 className='show-add-products' onClick={() => { setShowAddProducts(!showAddProducts) }}>{showAddProducts ? "hide form?" : "Add new products?"}</h3>
            {showAddProducts && <AddProducts />}
            {loading ? (
                <SpinLoader />
            ) :
                extraProducts.length > 0 ? (
                    <div className="receipt-details-container">
                        {currentRecords.map((product) => (<div className='receipt-details' key={product._id}>
                            <div className='container-button-div'>
                                <button className='delete-btn' onClick={() => { handleDeleteExpense(product._id) }}>delete</button></div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>Name:</p>
                                <p className='detail-value'>{product?.type}</p>
                            </div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>Value:</p>
                                <p className='detail-value'>{product?.priceInDollars}</p>
                            </div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>isReturnable:</p>
                                <p className='detail-value'>{product?.isReturnable}</p>
                            </div>

                        </div>
                        ))}
                    </div>
                ) : (
                    <p>No extra products found for this company</p>
                )}
            {renderPagination()}

        </div>
    );
};

export default ProductsList;
