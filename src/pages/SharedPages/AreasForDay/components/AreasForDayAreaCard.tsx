import React, { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import type { AreaRow } from "../hooks/useAreasForDayData";

export type AreasForDayAreaCardProps = {
  area: AreaRow;
  onBeforeNavigate: (areaId: string) => void;
};

const AreasForDayAreaCardInner: React.FC<AreasForDayAreaCardProps> = ({
  area,
  onBeforeNavigate,
}) => {
  const handleClick = useCallback(() => {
    onBeforeNavigate(area._id);
  }, [area._id, onBeforeNavigate]);

  return (
    <Link
      to={`/customers/${area._id}`}
      className="areas-for-day-card-link"
      onClick={handleClick}
    >
      <div className="areas-for-day-card">
        <span className="areas-for-day-card__name">{area.name}</span>
      </div>
    </Link>
  );
};

export const AreasForDayAreaCard = memo(AreasForDayAreaCardInner);
