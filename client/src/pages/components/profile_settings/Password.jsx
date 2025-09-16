const Password = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="pOldPass">Old Password</label>
          <input
            className="u-fullwidth"
            type="text"
            placeholder=""
            id="pOldPass"
          />
        </div>
        <div>
          <label htmlFor="pNewPass">New Password</label>
          <input
            className="u-fullwidth"
            type="text"
            placeholder=""
            id="pNewPass"
          />
        </div>
        <div>
          <label htmlFor="pNewPassConfirm">Confirm New Password</label>
          <input
            className="u-fullwidth"
            type="text"
            placeholder=""
            id="pNewPassConfirm"
          />
        </div>
        <button className="btn--primary u-quartorwidth" type="submit">
          Update
        </button>
      </form>
    </>
  );
};

export default Password;
