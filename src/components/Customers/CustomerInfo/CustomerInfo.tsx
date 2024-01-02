import React from 'react';
import SpinLoader from '../../UI reusables/SpinLoader/SpinLoader';

interface CustomerInfoProps {
    customerData: any; // Change 'any' to the type of your orderData if available
    loading: boolean;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customerData, loading }: CustomerInfoProps) => {
    return (
        <>
            {loading ? (
                <SpinLoader/>
            ) : customerData ? (
                <div className="receipt-details">
                    <div className='receipt-detail'>
                        <p className='detail-name'>name </p>
                        <p className='detail-value'>{customerData?.name}</p>
                    </div>
                    <div className='receipt-detail'>
                        <p className='detail-name'>phone: </p>
                        <p className='detail-value'>{customerData?.phone}</p>
                    </div>
                    <div className='receipt-detail'>
                        <p className='detail-name'>area id:</p>
                        <p className='detail-value area-id'> {customerData?.areaId?._id}</p>
                    </div>
                    <div className='receipt-detail'>
                        <p className='detail-name'>area name:</p>
                        <p className='detail-value'> {customerData?.areaId?.name}</p>
                    </div>
                    <div className='receipt-detail'>
                        <p className='detail-name'>address </p>
                        <p className='detail-value'>{customerData?.address}</p>
                    </div>

                </div>
            ) : (
                <p>Order not found</p>
            )}
        </>
    );
};

export default CustomerInfo;
