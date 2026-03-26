import React, { memo } from "react";
import { t } from "../../../../utils/i18n";

const EmployeeHomeFooterInner: React.FC = () => (
  <footer className="employee-home-footer">
    <p>{t("emp.footer.copyright")}</p>
  </footer>
);

export const EmployeeHomeFooter = memo(EmployeeHomeFooterInner);
