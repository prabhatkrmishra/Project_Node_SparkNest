import { useLocation } from "react-router-dom";
import { useState } from "react";

import MobileMenu from "./effects/MobileMenu";
import SearchEffect from "./effects/SearchEffect";

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActivePath = (path) =>
    currentPath === path || currentPath.startsWith(path);

  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  return (
    <header id="masthead" className="s-header">
      <div className="s-header__branding">
        <p className="site-title">
          <a href="/">BloggingVerse.</a>
        </p>
      </div>
      <div className="row s-header__navigation">
        <nav className="s-header__nav-wrap">
          <h3 className="s-header__nav-heading">Navigate to</h3>
          <ul className="s-header__nav" style={currentPath === "/" ? {paddingLeft: "40px"} : {}}>
            <li className={currentPath === "/" ? "current-menu-item" : ""}>
              <a href="/">Home</a>
            </li>

            <li
              className={`has-children ${
                isActivePath("/category") ? "current-menu-item" : ""
              }`}
            >
              <a>Categories</a>
              <ul className="sub-menu">
                <li>
                  <a href="/category?type=design">Design</a>
                </li>
                <li>
                  <a href="/category?type=lifestyle">Lifestyle</a>
                </li>
                <li>
                  <a href="/category?type=inspiration">Inspiration</a>
                </li>
                <li>
                  <a href="/category?type=workplace">Workplace</a>
                </li>
                <li>
                  <a href="/category?type=health">Health</a>
                </li>
                <li>
                  <a href="/category?type=photography">Photography</a>
                </li>
              </ul>
            </li>

            <li
              className={`has-children ${
                isActivePath("/blog") ? "current-menu-item" : ""
              }`}
            >
              <a>Blog</a>
              <ul className="sub-menu">
                <li>
                  <a href="/blog?type=standard-post">Standard Post</a>
                </li>
                <li>
                  <a href="/blog?type=video-post">Video Post</a>
                </li>
                <li>
                  <a href="/blog?type=audio-post">Audio Post</a>
                </li>
              </ul>
            </li>

            <li className={currentPath === "/about" ? "current-menu-item" : ""}>
              <a href="/about">About</a>
            </li>

            <li
              className={currentPath === "/contact" ? "current-menu-item" : ""}
            >
              <a href="/contact">Contact</a>
            </li>

            <li
              className={currentPath === "/styles" ? "current-menu-item" : ""}
            >
              <a href="/styles">Styles</a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="s-header__search">
        <div className="s-header__search-inner">
          <div className="row">
            <form
              role="search"
              method="get"
              className="s-header__search-form"
              action="#"
            >
              <label>
                <span className="u-screen-reader-text">Search for:</span>
                <input
                  type="search"
                  className="s-header__search-field"
                  placeholder="Search for..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  name="searCh"
                  title="Search for:"
                  autoComplete="off"
                />
              </label>
              <input
                type="submit"
                className="s-header__search-submit"
                value="Search"
              />
            </form>
            <a
              href="#0"
              title="Close Search"
              className="s-header__search-close"
            >
              Close
            </a>
          </div>
        </div>
      </div>
      <a className="s-header__menu-toggle" href="#0">
        <span>Menu</span>
      </a>
      <a className="s-header__search-trigger" href="#">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M19.25 19.25L15.5 15.5M4.75 11C4.75 7.54822 7.54822 4.75 11 4.75C14.4518 4.75 17.25 7.54822 17.25 11C17.25 14.4518 14.4518 17.25 11 17.25C7.54822 17.25 4.75 14.4518 4.75 11Z"
          ></path>
        </svg>
      </a>
      <MobileMenu />
      <SearchEffect />
    </header>
  );
};
export default Header;
