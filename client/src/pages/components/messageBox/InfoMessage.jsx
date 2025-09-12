import PropTypes from 'prop-types';

const InfoMessage = ({ showMssg, infoMssg }) => {

  const handleClose = (event) => {
    const box = event.target.parentElement;
    box.classList.add("hideit");
    setTimeout(() => {
      box.style.display = "none";
    }, 500);
  };

  return (
    <>
      {showMssg && (
        <div className="alert-box alert-box--info">
          <p>{infoMssg}</p>
          <span className="alert-box__close" onClick={handleClose}></span>
        </div>
      )}
    </>
  );
};

InfoMessage.propTypes = {
  showMssg: PropTypes.bool,
  infoMssg: PropTypes.string
};

export default InfoMessage;