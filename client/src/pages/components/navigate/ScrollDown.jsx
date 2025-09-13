const ScrollDown = () => {
  return (
    <>
      <a href="#bricks" className="hero__scroll-down smoothscroll">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M10.25 6.75L4.75 12L10.25 17.25"
          ></path>
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M19.25 12H5"
          ></path>
        </svg>
        <span>Scroll</span>
      </a>
    </>
  );
};

export default ScrollDown;
