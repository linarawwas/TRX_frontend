import React, { memo, useCallback } from "react";
import { t } from "../../../../utils/i18n";

const CustomersForAreaScrollTopInner: React.FC = () => {
  const scrollUp = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      type="button"
      className="cfa-scroll-top"
      onClick={scrollUp}
      aria-label={t("customersForArea.scrollTop")}
    >
      ↑
    </button>
  );
};

export const CustomersForAreaScrollTop = memo(CustomersForAreaScrollTopInner);
