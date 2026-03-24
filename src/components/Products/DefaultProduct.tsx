import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import SpinLoader from '../UI reusables/SpinLoader/SpinLoader';
import './DefaultProducts.css'
import { fetchDefaultProductsByCompany } from '../../features/products/api';
interface DefaultProduct {
    _id: string;
    key: string;
    value: string;
    companyId: string;
    __v: number;
}

const DefaultProducts: React.FC = () => {
    const [defaultProduct, setDefaultProduct] = useState<string>('');
    const companyId = useSelector((state: any) => state.user.companyId);
    const token: string = useSelector((state: any) => state.user.token);

    useEffect(() => {
        // Fetch default product based on company ID
        const fetchData = async () => {
            try {
                const response = await fetchDefaultProductsByCompany(token, companyId);
                // Filter the data to find the default product
                const defaultProductData = response.find(
                    (item) => item.key === 'defaultProduct'
                );
                if (defaultProductData) {
                    setDefaultProduct(defaultProductData.value);
                } else {
                    // Handle scenario where default product is not found
                    console.error('Default product not found.');
                }
            } catch (error) {
                // Handle API fetch errors
                console.error('Error fetching data:', error);
            }
        };

        fetchData(); // Fetch data when component mounts
    }, [companyId,token]);

    return (
        <div>
            <h2>Your Default Product Is: </h2>
            {defaultProduct ? (
                <p className='default-product'>{defaultProduct}</p>
            ) : (
                <SpinLoader />
            )}
        </div>
    );
};

export default DefaultProducts;
