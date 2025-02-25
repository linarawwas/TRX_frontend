must be provided by prop: 
the initial state of record: (the fields of it):
const [record, setRecord] = useState({
..state,
  companyId: companyId,
  shipmentId: shipmentId,
});
<AddOneRecordOfShipment record={ } isFinancial={boolean, (if true:provide state name for values in Liras, inUSD, dispatch functions for both)} nameOfModel={ } />


import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../../Orders/RecordOrder/RecordOrder.css';
import SelectInput from '../SelectInput/SelectInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import NumberInput from '../NumberInput/NumberInput';
import { RootState } from '../../../redux/store'; // Update this path with your Redux store structure
import './AddRecords.css'
const AddRecords: React.FC = () => {
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const shipmentId = useSelector((state: RootState) => state.shipment._id);
  const token = useSelector((state: RootState) => state.user.token);

  const dispatch = useDispatch();
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRecords({ ...records, [name]: value });
  };
  { isFinancial && const shipmentRecordsInLiras = useSelector((state: any) => state.shipment.recordsInLiras) }
  { isFinancial && const shipmentRecordsInUSD = useSelector((state: any) => state.shipment.recordsInUSD) }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://api-trx.linarawas.com/api/${nameOfModel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(records),
      });

      if (response.ok) {

        toast.success('Records successfully recorded.');
        {
          isFinancial &&  if (records.paymentCurrency === 'USD') {
            dispatch(setShipmentRecordsInUSD(parseInt(shipmentRecordsInUSD) + parseInt(records.value)))
          } else {
            dispatch(setShipmentRecordsInLiras(parseInt(shipmentRecordsInLiras) + parseInt(records.value)))
          }
        }
      } else {
        const errorData = await response.json();
        toast.error('Error recording Records:', errorData.error);
      }
    } catch (error: any) {
      toast.error('Network error:', error);
    }
  };

  return (
    <div className="record-order-container add-records-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="record-order-title">Add Records</h1>
      <form className="record-order-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={records.name}
          placeholder="Name"
          onChange={handleChange}
        />
        <SelectInput
          label="Payment Currency:"
          name="paymentCurrency"
          value={records.paymentCurrency}
          options={[
            { value: '', label: 'Select Currency' },
            { value: 'USD', label: 'USD' },
            { value: 'LBP', label: 'LBP' },
          ]}
          onChange={handleChange}
        />
        <NumberInput
          label="Value:"
          name="value"
          value={records.value}
          onChange={handleChange}
        />
        <button className="record-order-button" type="submit">
          Add records
        </button>
      </form>
    </div>
  );
};

export default AddRecords;
