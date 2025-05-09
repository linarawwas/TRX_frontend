import React, { useState, ChangeEvent, useEffect } from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "../AddCustomers/AddCustomers.css";
import "./AddCustomerInitials.css";
const AddCustomerInitials = (): JSX.Element => {
  const [file, setFile] = useState<File | null>(null);
  const [areas, setAreas] = useState<Array<{ _id: string; name: string }>>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Preparing upload...");
  const token: string = useSelector((state: any) => state.user.token);
  const companyId: string = useSelector((state: any) => state.user.companyId);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/areas/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch areas");
        }

        const data = await response.json();
        setAreas(data);
      } catch (error) {
        toast.error("Error fetching areas");
      }
    };

    if (companyId) fetchAreas();
  }, [companyId, token]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAreaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedAreaId(e.target.value);
  };

  const handleUpload = async () => {
    if (!file || !selectedAreaId) {
      toast.error("Please select a file and an area.");
      return;
    }

    setIsLoading(true);
    setLoadingStep("Validating file format...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("areaId", selectedAreaId);

    try {
      await new Promise((res) => setTimeout(res, 700));
      setLoadingStep("Linking to area data...");

      await new Promise((res) => setTimeout(res, 700));
      setLoadingStep("Securing customer records...");

      await new Promise((res) => setTimeout(res, 700));
      setLoadingStep("Uploading to database...");

      const response = await fetch(
        "http://localhost:5000/api/customers/uploadCustomersWithOrders",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      toast.success(`${result.createdCount} customers added successfully`);

      setFile(null);
      setSelectedAreaId("");
    } catch (error) {
      toast.error("Error uploading customers");
    } finally {
      setIsLoading(false);
    }
  };

  return isLoading ? (
    <div className="loader">
      <div className="spinner"></div>
      <p>{loadingStep}</p>
    </div>
  ) : (
    <>
      <div className="form-group">
        <label htmlFor="areaId" className="customer-input-label">
          Area:
        </label>
        <select
          id="areaId"
          name="areaId"
          value={selectedAreaId}
          onChange={handleAreaChange}
          required
        >
          <option value="">Select an area</option>
          {areas.map((area) => (
            <option key={area._id} value={area._id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      <input
        type="file"
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
        className="file-input"
      />

      <button onClick={handleUpload} className="upload-btn">
        Upload
      </button>
    </>
  );
};

export default AddCustomerInitials;
