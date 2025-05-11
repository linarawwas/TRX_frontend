import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store"; // Update this path with your Redux store structure
import {
  setShipmentId,
  setShipmentTarget,
  setDateDay,
  setDateMonth,
  setDateYear,
  setDayId,
  clearShipmentInfo,
} from "../../../redux/Shipment/action";
import { useNavigate } from "react-router-dom";
import AddToModel from "../../AddToModel/AddToModel";

const StartShipment: React.FC = () => {
  interface ShipmentData {
    dayId: string;
    month: string;
    day: number;
    year: number;
  }
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.user.token);
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const [shipmentData, setShipmentData] = useState({
    dayId: "",
    day: null,
    month: null,
    year: null,
    companyId: "",
  });

  const updateShipmentData = (data: any) => {
    setShipmentData({
      ...shipmentData,
      companyId: companyId,
      dayId: data.dayId,
      day: data.day,
      month: data.month,
      year: data.year,
    });
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  useEffect(() => {
    // Fetch and set the initial data when the component mounts
    const initializeDate = async () => {
      try {
        // Get the current date
        const currentDate = new Date();
        setSelectedDate(currentDate);
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const year = currentDate.getFullYear();

        const dayName = currentDate.toLocaleDateString("en-US", {
          weekday: "long",
        });

        // Perform your API request and dispatch actions here based on the current date
        const response = await fetch(
          `http://localhost:5000/api/days/name/${dayName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch day information");
        }

        const dayData = await response.json();
        if (dayData.length === 0) {
          throw new Error("Day information not found");
        }

        const dayId = dayData[0]._id;

        const shipmentData: ShipmentData = {
          dayId,
          month: `${month}`, // Convert month to a string with leading zero if needed
          day,
          year,
        };

        updateShipmentData(shipmentData);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    initializeDate();
  }, []);
  const handleShipmentSubmit = async (formData: any) => {
    try {
      const response = await fetch("http://localhost:5000/api/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId: shipmentData.companyId,
          dayId: shipmentData.dayId,
          day: shipmentData.day,
          month: shipmentData.month,
          year: shipmentData.year,
          carryingForDelivery: formData.carryingForDelivery,
        }),
      });

      if (response.ok) {
        const shipmentDataResponse = await response.json();
        dispatch(clearShipmentInfo());
        dispatch(setDayId(shipmentData.dayId));
        dispatch(setDateMonth(shipmentData.month));
        dispatch(setDateDay(shipmentData.day));
        dispatch(setDateYear(shipmentData.year));
        dispatch(setShipmentId(shipmentDataResponse._id));
        dispatch(setShipmentTarget(shipmentDataResponse.carryingForDelivery));
        toast.success("Shipment successfully recorded.");
        const dayId = shipmentData.dayId;
        navigate(`/areas/${dayId}`);
      } else {
        toast.error("Error recording Shipment");
      }
    } catch (error: any) {
      toast.error("Network error:", error);
    }
  };
  const shipmentConfig = {
    "component-related-fields": {
      modelName: "الشحنات",
      title: "أدخل معلومات الشحنة",
      "button-label": "بدء الشحنة",
    },
    "model-related-fields": {
      carryingForDelivery: {
        label: "الكمية المحملة للتوصيل",
        "input-type": "digit-carousal",
      },
    },
  };

  return (
    <AddToModel
      modelName={shipmentConfig["component-related-fields"].modelName}
      title={shipmentConfig["component-related-fields"].title}
      buttonLabel={shipmentConfig["component-related-fields"]["button-label"]}
      modelFields={shipmentConfig["model-related-fields"]}
      onSubmit={handleShipmentSubmit}
    />
  );
};

export default StartShipment;
