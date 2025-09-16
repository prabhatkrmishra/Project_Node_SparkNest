const Notifications = (prop) => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <h5 style={{ marginTop: 0 }}>Notification and Alerts</h5>
        <div className="profile-hr-container">
          <hr className="profile-hr" />
        </div>
        <label className="u-add-bottom">
          <input
            type="checkbox"
            id="newsletterSignup"
            name="newsletter"
            checked="true"
            style={{ width: "15px", height: "15px" }}
          />
          <span className="label-text" htmlFor="newsletterSignup">
            NewsLetters from SparkNest
          </span>
        </label>
        <button
          className="btn--primary u-quartorwidth"
          type="submit"
          style={{
            marginTop: prop.pSection === "notifications" ? "100px" : "0px",
          }}
        >
          Update
        </button>
      </form>
    </>
  );
};

export default Notifications;
