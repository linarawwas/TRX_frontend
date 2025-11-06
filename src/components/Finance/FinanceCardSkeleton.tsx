import React from "react";

interface FinanceCardSkeletonProps {
  count?: number;
}

const FinanceCardSkeleton: React.FC<FinanceCardSkeletonProps> = ({ count = 3 }) => {
  const items = Array.from({ length: Math.max(1, count) });

  return (
    <ul className="finance-list" aria-busy="true" aria-live="polite">
      {items.map((_, index) => (
        <li key={index} className="finance-card finance-card--skeleton" aria-hidden="true">
          <div className="finance-card__header">
            <div className="finance-card__title-group">
              <span className="skeleton-line skeleton-line--md" />
              <span className="skeleton-line skeleton-line--sm" />
            </div>
            <span className="skeleton-pill skeleton-pill--badge" />
            <span className="skeleton-pill skeleton-pill--icon" />
          </div>

          <div className="finance-card__content">
            <dl className="finance-grid">
              {Array.from({ length: 3 }).map((__, slotIndex) => (
                <div key={slotIndex} className="finance-grid__item">
                  <span className="skeleton-line skeleton-line--xs" />
                  <span className="skeleton-line skeleton-line--lg" />
                </div>
              ))}
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default FinanceCardSkeleton;

