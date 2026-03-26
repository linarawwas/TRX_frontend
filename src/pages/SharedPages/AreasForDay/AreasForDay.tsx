// AreasForDay — areas for the active delivery day (IndexedDB-backed, offline-safe)
import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAreaId } from "../../../redux/Order/action";
import { useNavigatorOnline } from "../../../hooks/useNavigatorOnline";
import { t } from "../../../utils/i18n";
import { ARABIC_DAY_NAME_MAP } from "./areasForDayConstants";
import { useAreasForDayData } from "./hooks/useAreasForDayData";
import { AreasForDayStatusBar } from "./components/AreasForDayStatusBar";
import { AreasForDayAreaCard } from "./components/AreasForDayAreaCard";
import { AreasForDaySkeleton } from "./components/AreasForDaySkeleton";
import { AreasForDayBackLink } from "./components/AreasForDayBackLink";
import "./AreasForDay.css";

export default function AreasForDay(): JSX.Element {
  const dispatch = useDispatch();
  const { dayId } = useParams<{ dayId: string }>();
  const isOnline = useNavigatorOnline();
  const { areas, dayNameRaw, loading, error, reload } =
    useAreasForDayData(dayId);

  const translatedDayName = ARABIC_DAY_NAME_MAP[dayNameRaw] || dayNameRaw;

  const onBeforeAreaNavigate = useCallback(
    (areaId: string) => {
      dispatch(setAreaId(areaId));
    },
    [dispatch]
  );

  return (
    <div className="areas-for-day-page areas-for-day-page--shell" dir="rtl" lang="ar">
      <div className="areas-for-day-page__glow" aria-hidden />
      <div className="areas-for-day-page__inner">
        <div className="areas-for-day-page__surface">
          <AreasForDayStatusBar isOnline={isOnline} />

          <header className="areas-for-day-header">
            <h1 className="areas-for-day-title">
              {t("addresses.areasForDay.title", { dayName: translatedDayName })}
            </h1>
          </header>

          <main className="areas-for-day-main">
            {loading ? (
              <AreasForDaySkeleton />
            ) : error ? (
              <div className="areas-for-day-error" role="alert">
                <p className="areas-for-day-error__text">
                  {t("common.error")}: {error}
                </p>
                <button
                  type="button"
                  className="areas-for-day-btn areas-for-day-btn--primary"
                  onClick={() => void reload()}
                >
                  {t("addresses.areasForDay.retry")}
                </button>
              </div>
            ) : areas.length > 0 ? (
              <ul className="areas-for-day-list">
                {areas.map((area) => (
                  <li key={area._id} className="areas-for-day-list__item">
                    <AreasForDayAreaCard
                      area={area}
                      onBeforeNavigate={onBeforeAreaNavigate}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="areas-for-day-empty" role="status">
                {t("addresses.areasForDay.empty")}
              </p>
            )}
          </main>
        </div>

        <AreasForDayBackLink />
      </div>
    </div>
  );
}
