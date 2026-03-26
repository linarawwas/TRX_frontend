import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Areas.css";
import { useSelector } from "react-redux";
import { selectUserToken } from "../../../redux/selectors/user";
import AddArea from "../../../components/Areas/AddArea/AddArea";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";
import { t } from "../../../utils/i18n";
import { useAreasCompanyList } from "./hooks/useAreasCompanyList";
import { AreasConnectivityBar } from "./components/AreasConnectivityBar";
import { AreasErrorPanel } from "./components/AreasErrorPanel";

export default function Areas(): JSX.Element {
  const token = useSelector(selectUserToken);
  const [formVisible, setFormVisible] = useState(false);

  const { areas, loading, error, reload } = useAreasCompanyList(
    token,
    formVisible
  );

  const handleFormToggle = () => {
    setFormVisible((v) => !v);
  };

  return (
    <div className="areas-page areas-page--shell" dir="rtl" lang="ar">
      <div className="areas-page__glow" aria-hidden />
      <div className="areas-page__inner">
        <AreasConnectivityBar />

        <div className="areas-page__surface">
          <header className="areas-header">
            <h1 className="areas-title">{t("addresses.areas.title")}</h1>
            <button
              type="button"
              className="toggle-form-btn"
              onClick={handleFormToggle}
              aria-expanded={formVisible}
              aria-controls="add-area-form"
            >
              {formVisible
                ? t("addresses.areas.showAreas")
                : t("addresses.areas.addToggle")}
            </button>
          </header>

          {loading ? (
            <div className="areas-loading" aria-busy="true">
              <SpinLoader />
            </div>
          ) : error ? (
            <AreasErrorPanel message={error} onRetry={reload} />
          ) : (
            <>
              {!formVisible && (
                <div className="areas-grid">
                  {areas.length === 0 ? (
                    <p className="areas-empty">{t("addresses.empty")}</p>
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
      </div>
    </div>
  );
}
