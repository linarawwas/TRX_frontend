import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "./AddArea.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

interface Day {
  _id: string;
  name: string;
}

function AddArea(): JSX.Element {
  const token: string = useSelector((state: any) => state.user.token);
  const companyId: string = useSelector((state: any) => state.user.companyId);
  const [name, setName] = useState<string>("");
  const [dayId, setDayId] = useState<string>("");
  const [days, setDays] = useState<Day[]>([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/days`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data: Day[]) => setDays(data))
      .catch((error) => toast.error("فشل في تحميل الأيام"));
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newArea = { name, dayId, companyId };

    try {
      const response = await fetch("http://localhost:5000/api/areas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newArea),
      });

      if (response.ok) {
        toast.success("تمت إضافة المنطقة بنجاح");
        setName("");
        setDayId("");
      } else {
        toast.error("فشل في إنشاء المنطقة");
      }
    } catch {
      toast.error("حدث خطأ أثناء الإضافة");
    }
  };
  const dayTranslations: Record<string, string> = {
    Sunday: "الأحد",
    Monday: "الإثنين",
    Tuesday: "الثلاثاء",
    Wednesday: "الأربعاء",
    Thursday: "الخميس",
    Friday: "الجمعة",
    Saturday: "السبت",
  };

  return (
    <div className="add-area-container" dir="rtl">
      <ToastContainer position="top-right" autoClose={1000} />
      <h2 className="add-area-title">إضافة منطقة جديدة</h2>

      <form className="add-area-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">اسم المنطقة:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dayId">اختر اليوم:</label>
          <select
            id="dayId"
            value={dayId}
            onChange={(e) => setDayId(e.target.value)}
            required
          >
            <option value="">اختر يوماً</option>
            {days.map((day) => (
              <option key={day._id} value={day._id}>
                {dayTranslations[day.name] || day.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="submit-button">
          ➕ إضافة المنطقة
        </button>
      </form>
    </div>
  );
}

export default AddArea;
