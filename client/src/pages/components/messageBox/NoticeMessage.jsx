import PropTypes from 'prop-types';

const NoticeMessage = ({ showMssg, noticeMssg }) => {

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
          <p>{noticeMssg}</p>
          <span className="alert-box__close" onClick={handleClose}></span>
        </div>
      )}
    </>
  );
};

NoticeMessage.propTypes = {
  showMssg: PropTypes.bool,
  noticeMssg: PropTypes.string
};

export default NoticeMessage;