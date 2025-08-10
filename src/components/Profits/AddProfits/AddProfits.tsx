import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store"; // Update this path with your Redux store structure
import {
  setShipmentProfitsInLiras,
  setShipmentProfitsInUSD,
} from "../../../redux/Shipment/action";
import AddToModel from "../../AddToModel/AddToModel";

const AddProfits: React.FC = () => {
  const exchangeRate = "6878aa9ac9f1a18731a5b8a4";
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const shipmentId = useSelector((state: RootState) => state.shipment._id);
  const token = useSelector((state: RootState) => state.user.token);
  const dispatch = useDispatch();
  const shipmentProfitsInLiras = useSelector(
    (state: any) => state.shipment.profitsInLiras
  );
  const shipmentProfitsInUSD = useSelector(
    (state: any) => state.shipment.profitsInUSD
  );
  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch("http://localhost:5000/api/extraProfits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          value: Number(formData.value), // <-- force number!
          companyId,
          shipmentId,
          exchangeRate,
        }),
      });
      if (response.ok) {
        toast.success("Profits successfully recorded.");
        if (formData.paymentCurrency === "USD") {
          dispatch(
            setShipmentProfitsInUSD(
              parseInt(shipmentProfitsInUSD) + parseInt(formData.value)
            )
          );
        } else {
          dispatch(
            setShipmentProfitsInLiras(
              parseInt(shipmentProfitsInLiras) + parseInt(formData.value)
            )
          );
        }
      } else {
        const errorData = await response.json();
        toast.error(`Error recording Profits: ${errorData.error}`);
      }

      return response;
    } catch (error: any) {
      toast.error(`Network error: ${error}`);
      throw error;
    }
  };
  const profitsConfig = {
    "component-related-fields": {
      modelName: "الأرباح الإضافية",
      title: "إضافة إلى الأرباح",
      "button-label": "إضافة ربح",
    },
    "model-related-fields": {
      name: { label: "الاسم", "input-type": "text" },
      value: { label: "القيمة", "input-type": "number" },
      paymentCurrency: {
        label: "عملة الدفع",
        "input-type": "selectOption",
        options: [
          { value: "USD", label: "دولار أمريكي" },
          { value: "LBP", label: "ليرة لبنانية" },
        ],
      },
    },
  };

  return (
    <AddToModel
      modelName={profitsConfig["component-related-fields"].modelName}
      title={profitsConfig["component-related-fields"].title}
      buttonLabel={profitsConfig["component-related-fields"]["button-label"]}
      modelFields={profitsConfig["model-related-fields"]}
      onSubmit={handleSubmit}
    />
  );
};

export default AddProfits;
