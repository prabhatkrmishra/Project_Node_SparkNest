const General = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="pUsername">Username</label>
          <input
            className="u-fullwidth"
            type="text"
            placeholder="Username"
            id="pUsername"
          />
        </div>
        <div>
          <label htmlFor="pEmail">Your email</label>
          <input
            className="u-fullwidth"
            type="email"
            placeholder="Email"
            id="pEmail"
          />
        </div>
        <button className="btn--primary u-quartorwidth" type="submit">
          Update
        </button>
      </form>
    </>
  );
};

export default General;
