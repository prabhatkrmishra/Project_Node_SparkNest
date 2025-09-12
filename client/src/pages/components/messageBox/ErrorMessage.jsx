import PropTypes from 'prop-types';

const ErrorMessage = ({ isError, errorMssg }) => {
  return (
    <>
      {isError && (
        <div className="alert-box alert-box--error" style={{ height: "68px" }}>
          <p>{errorMssg}</p>
        </div>
      )}
    </>
  );
};

ErrorMessage.propTypes = {
  isError: PropTypes.bool.isRequired,
  errorMssg: PropTypes.string.isRequired,
};

export default ErrorMessage;