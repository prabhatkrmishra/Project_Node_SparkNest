const DeleteAccount = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="consentBox">Type {`'YES'`}</label>
          <input
            className="u-fullwidth"
            type="text"
            placeholder=""
            id="consentBox"
          />
        </div>
        <button className="btn--primary u-quartorwidth" type="submit">
          DELETE
        </button>
      </form>
    </>
  );
};

export default DeleteAccount;
