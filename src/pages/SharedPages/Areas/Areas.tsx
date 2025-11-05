import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Areas.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useSelector } from "react-redux";
import { selectUserToken, selectUserCompanyId } from "../../../redux/selectors/user";
import { fetchAreasByCompany } from "../../../features/areas/apiAreas";
import AddArea from "../../../components/Areas/AddArea/AddArea";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";
import { t } from "../../../utils/i18n";

interface Area {
  _id: string;
  name: string;
}

export default function Areas(): JSX.Element {
  const token = useSelector(selectUserToken);
  const companyId = useSelector(selectUserCompanyId);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState<boolean>(false);

  const handleFormToggle = () => {
    setFormVisible(!formVisible);
  };

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAreasByCompany(token);
        if (cancelled) return;
        setAreas(data);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error("Error fetching areas:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, formVisible]);

  return (
    <div className="areas-body" dir="rtl">
      <div className="areas-header">
        <h2 className="areas-title">{t("addresses.areas.title")}</h2>
        <button
          type="button"
          className="toggle-form-btn"
          onClick={handleFormToggle}
          aria-expanded={formVisible}
          aria-controls="add-area-form"
        >
          {formVisible ? t("addresses.areas.showAreas") : t("addresses.areas.addToggle")}
        </button>
      </div>

      {loading ? (
        <SpinLoader />
      ) : error ? (
        <p role="alert">{t("common.error")}: {error}</p>
      ) : (
        <>
          {!formVisible && (
            <div className="areas-grid">
              {areas.length === 0 ? (
                <p>{t("addresses.empty")}</p>
              ) : (
                areas.map((area) => (
                  <Link
                    to={`/addresses/${area._id}`}
                    key={area._id}
                    className="area-box"
                  >
                    {area.name}
                  </Link>
                ))
              )}
            </div>
          )}
          {formVisible && (
            <div id="add-area-form" className="add-area-form">
              <AddArea />
            </div>
          )}
        </>
      )}
    </div>
  );
}
