/* eslint-disable react/prop-types */
import ErrorMessage from "../messageBox/ErrorMessage";

const ResetError = ({ isError, mssg }) => {
  return (
    <div className="column lg-6 tab-12" style={{ paddingBottom: "50px" }}>
      <ErrorMessage isError={isError} errorMssg={mssg} />
    </div>
  );
};

export default ResetError;
