// src/components/Products/ProductCard.tsx
import React from "react";
import { Product } from "../../features/products/hooks/useProducts";
import { t } from "../../utils/i18n";

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete }) => {
  return (
    <div className="receipt-details">
      <div className="container-button-div">
        <button
          type="button"
          className="delete-btn"
          onClick={() => onDelete(product._id)}
          aria-label={t("products.delete")}
        >
          {t("products.delete")}
        </button>
      </div>
      <div className="receipt-detail">
        <p className="detail-name">{t("products.fields.name")}:</p>
        <p className="detail-value">{product?.type}</p>
      </div>
      <div className="receipt-detail">
        <p className="detail-name">{t("products.fields.price")}:</p>
        <p className="detail-value">{product?.priceInDollars}</p>
      </div>
      <div className="receipt-detail">
        <p className="detail-name">{t("products.fields.returnable")}:</p>
        <p className="detail-value">
          {product.isReturnable ? t("products.returnable.yes") : t("products.returnable.no")}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;

