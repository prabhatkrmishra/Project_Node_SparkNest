import BackToTop from "../effects/BackToTop";

const ScrollUp = () => {
  return (
    <>
      <div className="ss-go-top">
        <a className="smoothscroll" title="Back to Top" href="#root">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M17.25 10.25L12 4.75L6.75 10.25"
            />
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 19.25V5.75"
            />
          </svg>
        </a>
      </div>
      <BackToTop />
    </>
  );
};

export default ScrollUp;
