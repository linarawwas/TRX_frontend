import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "./ProductsList.css";
import "../../../components/Customers/CustomerInvoices/CustomerInvoices.css";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader.jsx";
import AddProducts from "../../../components/Products/AddProducts";
interface Product {
  _id: string;
  type: string;
  priceInDollars: number;
  isReturnable: boolean;
  companyId: string;
}
const ProductsList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(4);
  const [showAddProducts, setShowAddProducts] = useState<Boolean>(false);
  const companyId = useSelector((state: any) => state.user.companyId);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const token: string = useSelector((state: any) => state.user.token);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching  products:", error);
        setLoading(false);
      }
    };
    if (companyId) {
      fetchProducts();
    }
  }, [companyId, token, showAddProducts]);

  const handleDeleteExpense = async (productId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("product deleted successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Error deleting product");
      }
    } catch (error) {
      toast.error("Error deleting product");
      console.error("Error deleting product:", error);
    }
  };
  return (
    <div className="products" dir="rtl">
      <ToastContainer position="top-right" autoClose={1000} />
      <h2>المنتجات</h2>
      <h3
        className="show-add-products"
        onClick={() => {
          setShowAddProducts(!showAddProducts);
        }}
      >
        {showAddProducts ? "هل تريد إخفاء النموذج؟" : "هل تريد إضافة منتجات جديدة؟"}
      </h3>
      {showAddProducts && <AddProducts />}
      {loading ? (
        <SpinLoader />
      ) : products?.length > 0 ? (
        <div className="receipt-details-container">
          {products.map((product) => (
            <div className="receipt-details" key={product._id}>
              <div className="container-button-div">
                <button
                  className="delete-btn"
                  onClick={() => {
                    handleDeleteExpense(product._id);
                  }}
                >
                  حذف
                </button>
              </div>
              <div className="receipt-detail">
                <p className="detail-name">الاسم:</p>
                <p className="detail-value">{product?.type}</p>
              </div>
              <div className="receipt-detail">
                <p className="detail-name">القيمة:</p>
                <p className="detail-value">{product?.priceInDollars}</p>
              </div>
              <div className="receipt-detail">
                <p className="detail-name">هل يمكن إرجاعه:</p>
                <p className="detail-value">
                  {product.isReturnable ? "نعم" : "لا"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>لا توجد منتجات لهذه الشركة</p>
      )}
    </div>
  );
  
};

export default ProductsList;
