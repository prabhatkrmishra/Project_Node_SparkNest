import PropTypes from 'prop-types';

const SuccessMessage = ({ isSuccess, successMssg }) => {

  const handleClose = (event) => {
    const box = event.target.parentElement;
    box.classList.add("hideit");
    setTimeout(() => {
      box.style.display = "none";
    }, 500);
  };

  return (
    <>
      {isSuccess && (
        <div className="alert-box alert-box--success" style={{ height: "68px" }}>
          <p>{successMssg}</p>
          <span className="alert-box__close" onClick={handleClose}></span>
        </div>
      )}
    </>
  );
};

SuccessMessage.propTypes = {
  isSuccess: PropTypes.bool,
  successMssg: PropTypes.string
};

export default SuccessMessage;