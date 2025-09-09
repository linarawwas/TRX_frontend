import { useSelector } from "react-redux";
import InitialImportView from "./admin/InitialImportView";
import UploadShipments from "./admin/UploadShipments";
const AdminActions = () => {
  const companyId = useSelector((state) => state.user.companyId);
  return (
    <>
      <InitialImportView companyId={companyId} />
      {/* <UploadShipments /> */}
    </>
  );
};

export default AdminActions;
