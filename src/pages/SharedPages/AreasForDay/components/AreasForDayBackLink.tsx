import React, { memo } from "react";
import { Link } from "react-router-dom";
import { t } from "../../../../utils/i18n";

const AreasForDayBackLinkInner: React.FC = () => (
  <div className="areas-for-day-back">
    <Link to="/areas" className="areas-for-day-back__link">
      {t("addresses.areasForDay.otherAreas")}
    </Link>
  </div>
);

export const AreasForDayBackLink = memo(AreasForDayBackLinkInner);
