import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './AddCustomers.css'
import { useSelector } from 'react-redux';
const AddCustomers = () => {
  const [file, setFile] = useState(null);
  const token = useSelector(state => state.user.token);
  const companyId = useSelector(state => state.user.companyId);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const binaryString = e.target.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
        // Assuming the first row in 'data' array is the header row
        const headers = data[0];
      
        // Assuming subsequent rows contain customer data
        const customerData = data.slice(1).map((row) => {
          const customer = {};
          headers.forEach((header, index) => {
            customer[header] = row[index];
          });
          return customer;
        });
      try {
        const response = await fetch('http://localhost:5000/api/customers/many', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,

          },
          body: JSON.stringify({ customerData: customerData }), // Convert customerData array to JSON
                  // Log the customer data to verify the structure before sending it to the backend
        });
        console.log('Customer Data:', customerData);

        const responseData = await response.json();
        console.log('Response:', responseData);
      } catch (error) {
        console.error('Error uploading customers:', error);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="customer-uploader">
    <h2 className="uploader-title">Upload Customer Data</h2>
    <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" className="file-input" />
    <button onClick={handleUpload} className="upload-button">
      Upload
    </button>
  </div>
  );
};

export default AddCustomers;
