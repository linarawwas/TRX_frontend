import React, { useState, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import './AddCustomers.css';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';

const AddCustomers = (): JSX.Element => {
  const [file, setFile] = useState<File | null>(null);
  const token: string = useSelector((state: any) => state.user.token);
  const companyId: string = useSelector((state: any) => state.user.companyId);
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target && e.target.result) {
        const binaryString = e.target.result as string;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
          const headers: string[] = data[0].map((header: any) => String(header));
  
          const customerData: Array<Record<string, unknown>> = [];
          let stopProcessing = false;
  
          for (let i = 1; i < data.length && !stopProcessing; i++) {
            const row = data[i];
            const customer: { [key: string]: any } = {};
  
            headers.forEach((header: string, index: number) => {
              if (index < row.length) {
                customer[header] = row[index];
              }
            });
  
            if (customer.name) {
              customerData.push({ ...customer, companyId });
            } else {
              stopProcessing = true;
            }
          }
  
          try {
            const response = await fetch('http://localhost:5000/api/customers/many', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(customerData),
            });
  
            toast.success('Customers Added successfully');
          } catch (error) {
            toast.error('Error uploading customers');
          }
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="customer-uploader">
      <ToastContainer position="top-right" autoClose={2000} />

      <h2 className="uploader-title">Upload Customer Data</h2>
      <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" className="file-input" />
      <button onClick={handleUpload} className='upload-btn'>
        Upload
      </button>
    </div>
  );
};

export default AddCustomers;
