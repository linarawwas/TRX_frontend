import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import "./ProductsList.css";
import "../../../components/Customers/CustomerInvoices/CustomerInvoices.css";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";
import AddProducts from "../../../components/Products/AddProducts";
import ProductCard from "../../../components/Products/ProductCard";
import { useProducts } from "../../../features/products/hooks/useProducts";
import { t } from "../../../utils/i18n";

const ProductsList: React.FC = () => {
  const [showAddProducts, setShowAddProducts] = useState<boolean>(false);
  const companyId = useSelector((s: RootState) => s.user.companyId);
  const token = useSelector((s: RootState) => s.user.token);
  const { items: products, loading, error, remove, refetch } = useProducts(token, companyId);

  const handleDelete = async (productId: string) => {
    try {
      await remove(productId);
      toast.success(t("products.delete.success"));
    } catch {
      toast.error(t("products.delete.error"));
    }
  };

  // Refetch when AddProducts form is submitted (when showAddProducts changes back to false)
  React.useEffect(() => {
    if (!showAddProducts && companyId) {
      refetch();
    }
  }, [showAddProducts, companyId, refetch]);
  return (
    <div className="products" dir="rtl">
      <h2>{t("products.title")}</h2>
      <h3
        className="show-add-products"
        onClick={() => {
          setShowAddProducts(!showAddProducts);
        }}
      >
        {showAddProducts ? t("products.add.toggleHide") : t("products.add.toggleShow")}
      </h3>
      {showAddProducts && (
        <AddProducts
          config={{
            modelName: t("products.title"),
            title: t("products.add.title"),
            buttonLabel: t("products.add.buttonLabel"),
            fields: {
              type: { label: t("products.fields.type"), "input-type": "text" },
              priceInDollars: {
                label: t("products.fields.priceInDollars"),
                "input-type": "number",
              },
              isReturnable: {
                label: t("products.fields.returnable"),
                "input-type": "selectOption",
                options: [
                  { value: true, label: t("products.returnable.yes") },
                  { value: false, label: t("products.returnable.no") },
                ],
              },
            },
          }}
          onSuccess={() => {
            setShowAddProducts(false);
            refetch();
          }}
        />
      )}
      {loading ? (
        <SpinLoader />
      ) : error ? (
        <p>{t("products.fetch.error")}</p>
      ) : products?.length > 0 ? (
        <div className="receipt-details-container">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <p>{t("products.none")}</p>
      )}
    </div>
  );
};

export default ProductsList;
