import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Areas.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useSelector } from "react-redux";
import AddArea from "../../../components/Areas/AddArea/AddArea";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";

interface Area {
  _id: string;
  name: string;
}

export default function Areas(): JSX.Element {
  const token: string = useSelector((state: any) => state.user.token);
  const companyId: string = useSelector((state: any) => state.user.companyId);

  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [formVisible, setFormVisible] = useState<boolean>(false);

  const handleFormToggle = () => {
    setFormVisible(!formVisible);
  };

  useEffect(() => {
    async function fetchAreas() {
      setLoading(true);

      // 📌 Fetch data from API if online
      fetch(`https://trx-api.linarawas.com/api/areas/company/${companyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then(async (data: Area[]) => {
          setAreas(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching areas:", error);
          setLoading(false);
        });
    }

    fetchAreas();
  }, [token, formVisible]);

  return (
    <div className="areas-body" dir="rtl">
      <div className="areas-header">
        <h2 className="areas-title">مناطق التوزيع</h2>
        <button onClick={handleFormToggle}>
          {formVisible ? "عرض المناطق" : "إضافة منطقة جديدة؟"}
        </button>
      </div>
  
      {loading ? (
        <SpinLoader />
      ) : (
        <>
          <div className="areas-div">
            {!formVisible &&
              areas?.map((area) => (
                <div key={area._id}>
                  <Link to={`/addresses/${area._id}`} className="area-link">
                    {area.name}
                  </Link>
                </div>
              ))}
          </div>
          <div className="add-area-div">{formVisible && <AddArea />}</div>
        </>
      )}
    </div>
  );
  
}
