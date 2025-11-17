import React from "react";
import "./ProductSelectionPrompt.css";

interface ProductSelectionPromptProps {
  products: Array<{ _id: string; type: string; priceInDollars: number }>;
  selectedProductId: string;
  onSelect: (productId: string) => void;
  loading?: boolean;
}

/**
 * Prominent call-to-action component that requires product selection
 * before showing distributor sales and commission calculations.
 */
const ProductSelectionPrompt: React.FC<ProductSelectionPromptProps> = ({
  products,
  selectedProductId,
  onSelect,
  loading = false,
}) => {
  if (selectedProductId) return null;

  return (
    <div className="product-prompt" role="alert" aria-live="assertive">
      <div className="product-prompt__icon">📊</div>
      <div className="product-prompt__content">
        <h3 className="product-prompt__title">
          اختر المنتج لحساب المبيعات والعمولات
        </h3>
        <p className="product-prompt__subtitle">
          يجب اختيار منتج أولاً لعرض بيانات المبيعات والعمولات للموزّعين
        </p>
        <div className="product-prompt__select-wrapper">
          <label htmlFor="product-prompt-select" className="product-prompt__label">
            المنتج:
          </label>
          <select
            id="product-prompt-select"
            className="product-prompt__select"
            value={selectedProductId}
            onChange={(e) => onSelect(e.target.value)}
            disabled={loading || products.length === 0}
            aria-disabled={loading || products.length === 0}
            aria-required="true"
          >
            <option value="">
              {loading ? "جارٍ التحميل…" : "اختر المنتج"}
            </option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.type} — ${product.priceInDollars.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionPrompt;

