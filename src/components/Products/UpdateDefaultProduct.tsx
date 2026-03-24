import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { API_BASE } from '../../config/api';

interface Product {
    _id: string;
    type: string;
    priceInDollars: number;
    isReturnable: boolean;
    companyId: string;
}

interface UpdateDefaultProductProps {
    products: Product[]; // Products passed as props
    companyId: string; // Assuming companyId is available as a prop
}

const UpdateDefaultProduct: React.FC<UpdateDefaultProductProps> = ({ products, companyId }) => {
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const token: string = useSelector((state: any) => state.user.token);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProduct(event.target.value);
    };

    const handleUpdateDefaultProduct = async () => {
        try {
            // Prepare the data object to send in the request body
            const data = {
                value: selectedProduct, // Chosen product type
                companyId: companyId // Company ID passed as prop
            };

            // Update default product based on selectedProduct
            await apiClient.put(`${API_BASE}/api/adminDeterminedDefaults/defaultProduct`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Handle success or update UI accordingly
            toast.success('Default product updated successfully.');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            toast.error('Error updating default product');
            console.error('Error updating default product:', error);
        }
    };

    return (
        <div>
            <h2>Update Default Product</h2>
            <div className='select-default-div'>
            <select value={selectedProduct} onChange={handleSelectChange}>
                <option value="">Select a product</option>
                {products.map((product) => (
                    <option key={product._id} value={product.type}>
                        {product.type}
                    </option>
                ))}
            </select>
            <button onClick={handleUpdateDefaultProduct}>Update</button>
   
            </div>
                </div>
    );
};

export default UpdateDefaultProduct;
