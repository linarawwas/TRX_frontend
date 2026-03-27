import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaBars, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../../images/logo.jpeg";
import type { RootState } from "../../../redux/store";
import { clearAuth } from "../../../features/auth/authStorage";
import { createLogger } from "../../../utils/logger";
import "../UnifiedAsideMenu.css";

const logger = createLogger("unified-aside-menu");

type NavItem = {
  to: string;
  label: string;
  icon: string;
};

const STATIC_NAV_ITEMS: NavItem[] = [
  { to: "/areas", label: "المناطق", icon: "🌍" },
  { to: "/customers", label: "الزبائن", icon: "👥" },
  { to: "/currentShipment", label: "بيانات الشحنة", icon: "📦" },
  { to: "/reports/orders-today", label: "طلبات شحنات اليوم", icon: "🧾" },
  { to: "/Expenses", label: "المصاريف", icon: "🧾" },
  { to: "/Profits", label: "الأرباح", icon: "💰" },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: "/distributors", label: "الموزعين", icon: "👥" },
  { to: "/Products", label: "المنتجات", icon: "📦" },
];

const NavMenuLink = memo(function NavMenuLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={item.to}
      className="menu-section-link uam-nav-link"
      onClick={onNavigate}
    >
      <span className="uam-nav-link__icon" aria-hidden="true">
        {item.icon}
      </span>
      <span className="uam-nav-link__label">{item.label}</span>
    </Link>
  );
});

function UnifiedAsideMenuInner(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const drawerId = useId();

  const isAdmin = useSelector((s: RootState) => s.user.isAdmin);
  const shipmentId = useSelector((s: RootState) => s.shipment._id);
  const dayId = useSelector((s: RootState) => s.shipment.dayId);
  const shipmentDefined = Boolean(shipmentId);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((v) => !v), []);

  const mainLinks = useMemo(() => {
    const items: NavItem[] = [];
    if (shipmentDefined && !isAdmin && dayId) {
      items.push({ to: `/areas/${dayId}`, label: "المسار", icon: "🛣️" });
    }
    items.push(...STATIC_NAV_ITEMS);
    return items;
  }, [shipmentDefined, isAdmin, dayId]);

  const handleLogout = useCallback(() => {
    toast.success("تم تسجيل الخروج بنجاح");
    clearAuth(dispatch);
    window.location.reload();
  }, [dispatch]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen, closeMenu]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  return (
    <div className="uam-root" dir="rtl" lang="ar">
      <ToastContainer position="top-right" autoClose={1000} />

      <header className="top-navbar uam-topbar">
        <button
          type="button"
          className="menu-toggle uam-menu-toggle"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls={drawerId}
          aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {isMenuOpen ? <FaTimes aria-hidden /> : <FaBars aria-hidden />}
        </button>
        <button
          type="button"
          className="uam-logo-btn"
          onClick={() => navigate("/")}
          aria-label="الصفحة الرئيسية"
        >
          <img className="logo-icon uam-logo" src={logo} alt="" />
        </button>
      </header>

      {isMenuOpen ? (
        <div
          className="menu-overlay uam-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        />
      ) : null}

      <aside
        id={drawerId}
        className={`sidebar-drawer uam-drawer ${isMenuOpen ? "open" : ""}`}
        dir="rtl"
        aria-hidden={!isMenuOpen}
        {...(isMenuOpen ? { "aria-modal": true as const } : {})}
      >
        <nav className="menu-section uam-nav" aria-label="القائمة الرئيسية">
          {mainLinks.map((item) => (
            <NavMenuLink key={item.to} item={item} onNavigate={closeMenu} />
          ))}
          {isAdmin
            ? ADMIN_NAV_ITEMS.map((item) => (
                <NavMenuLink key={item.to} item={item} onNavigate={closeMenu} />
              ))
            : null}
        </nav>

        <div className="menu-footer uam-footer">
          <button
            type="button"
            className="logout-btn uam-logout"
            onClick={handleLogout}
          >
            <span className="uam-btn-icon" aria-hidden="true">
              🔓
            </span>
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </div>
  );
}

type BoundaryState = { hasError: boolean };

class UnifiedAsideMenuErrorBoundary extends React.Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo): void {
    logger.error("UnifiedAsideMenu crashed", {
      message: err.message,
      stack: err.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="uam-root uam-root--error" dir="rtl" lang="ar" role="alert">
          <div className="uam-error-card">
            <p className="uam-error-text">تعذّر تحميل القائمة الجانبية.</p>
            <button
              type="button"
              className="uam-error-reload"
              onClick={() => window.location.reload()}
            >
              إعادة تحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function UnifiedAsideMenu(): JSX.Element {
  return (
    <UnifiedAsideMenuErrorBoundary>
      <UnifiedAsideMenuInner />
    </UnifiedAsideMenuErrorBoundary>
  );
}
