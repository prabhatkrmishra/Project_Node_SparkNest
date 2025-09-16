const Profile = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="u-fullwidth menu-section-profile">
          <div className="profile-input-names">
            <label htmlFor="pfName">First Name</label>
            <input
              className="profile-input-name"
              type="text"
              id="fName"
              name="pfName"
              placeholder="First Name"
            />
          </div>
          <div className="profile-input-name">
            <label htmlFor="plName">Last Name</label>
            <input
              className="profile-input-name"
              type="text"
              id="lName"
              name="plName"
              placeholder="Last Name"
            />
          </div>
        </div>
        <div>
          <label htmlFor="pRegion">Region</label>
          <input
            className="u-fullwidth"
            type="text"
            placeholder="City, State, Country"
            id="pRegion"
          />
        </div>
        <button className="btn--primary u-quartorwidth" type="submit">
          Update
        </button>
      </form>
    </>
  );
};

export default Profile;
