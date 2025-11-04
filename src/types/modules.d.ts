declare module "*.jsx";
declare module "*.js";
declare module "../Layout/Layout";
declare module "../Hooks/useSyncOfflineOrders";
declare module "*redux/*/action";
declare module "*redux/rootReducer";
declare module "*UI reusables/SpinLoader/SpinLoader";
declare module "*.css";
declare module "*.jpeg";
declare module "*.jpg";
declare module "*.png";
declare module "*.svg";

// Relax useSelector state typing to unblock migration
// (avoid overriding react-redux types to keep Provider/useDispatch available)


