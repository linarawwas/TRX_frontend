import { useSelector } from "react-redux";
import InitialImportView from "./admin/InitialImportView";
import UploadShipments from "./admin/UploadShipments";
const AdminActions = () => {
  return (
    <>
      <InitialImportView />
      {/* <UploadShipments /> */}
    </>
  );
};

export default AdminActions;
