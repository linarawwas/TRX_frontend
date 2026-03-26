import React, { memo, useState } from "react";
import { t } from "../../../../utils/i18n";

export type EmployeeHomeHeaderProps = {
  userName: string;
};

const EmployeeHomeHeaderInner: React.FC<EmployeeHomeHeaderProps> = ({
  userName,
}) => {
  const [dateLabel] = useState(() =>
    new Date().toLocaleDateString("ar-LB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  );

  return (
    <header className="employee-home-header">
      <h1 className="employee-home-header__title">
        {t("emp.home.hello")} {userName}
      </h1>
      <p className="employee-home-header__date">{dateLabel}</p>
    </header>
  );
};

export const EmployeeHomeHeader = memo(EmployeeHomeHeaderInner);
