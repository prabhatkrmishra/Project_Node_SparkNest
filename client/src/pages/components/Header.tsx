// @ts-nocheck
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import MobileMenu from "./effects/MobileMenu";
import SearchEffect from "./effects/SearchEffect";

import logout from "../components/tools/auth";
import { useAuth } from "../../components/auth/AuthProvider";
import { api } from "../../api/API";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user } = useAuth();
  const sessionLogged = Boolean(user);

  const isActivePath = (path) => currentPath === path || currentPath.startsWith(path);

  const [searchValue, setSearchValue] = useState("");
  const [topBlogs, setTopBlogs] = useState([]);

  // Top blogs for the header listing (by likes). Falls back to an empty
  // state so the dropdown never breaks the nav.
  useEffect(() => {
    let active = true;
    api
      .get("/articles/top?limit=8")
      .then((response) => {
        if (!active) return;
        setTopBlogs(Array.isArray(response.data?.data) ? response.data.data : []);
      })
      .catch(() => {
        if (active) setTopBlogs([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  // No dedicated search backend exists; route the query to the categories page,
  // which supports filtering topics client-side.
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    document.body.classList.remove("search-is-visible");
    if (query) {
      navigate(`/categories?q=${encodeURIComponent(query)}`);
    } else {
      navigate("/categories");
    }
    setSearchValue("");
  };

  const toggleMenu = (event) => {
    event.preventDefault();
    const parentLi = event.target.closest(".has-children");
    parentLi.classList.toggle("active");
  };

  return (
    <header id="masthead" className="s-header">
      <div className="s-header__branding">
        <p className="site-title">
          <a href="/">SparkNest</a>
        </p>
      </div>
      <div className="row s-header__navigation">
        <nav className="s-header__nav-wrap">
          <h3 className="s-header__nav-heading">Navigate to</h3>
          <ul className="s-header__nav">
            <li className={currentPath === "/" ? "current-menu-item" : ""}>
              <a href="/">Home</a>
            </li>
            <li className={`has-children ${isActivePath("/category") ? "current-menu-item" : ""}`}>
              <a href="#" onClick={toggleMenu}>
                Categories
              </a>
              <ul className="sub-menu">
                <li>
                  <a href="/category/health">Health</a>
                </li>
                <li>
                  <a href="/category/lifestyle">Lifestyle</a>
                </li>
                <li>
                  <a href="/category/inspiration">Inspiration</a>
                </li>
                <li>
                  <a href="/category/photography">Photography</a>
                </li>
                <li>
                  <a href="/category/workplace">Workplace</a>
                </li>
                <li>
                  <a href="/category/design">Design</a>
                </li>
                <li>
                  <a href="/categories">More...</a>
                </li>
              </ul>
            </li>
            <li className="has-children">
              <a href="#" onClick={toggleMenu}>
                Top Blogs
              </a>
              <ul className="sub-menu sub-menu--top">
                {topBlogs.length === 0 ? (
                  <li className="sub-menu__status">No top blogs yet</li>
                ) : (
                  topBlogs.map((blog, index) => (
                    <li key={blog.article_id}>
                      <a href={`/article/view/${blog.article_id}`} className="sub-menu__top-link">
                        <span className="sub-menu__rank">{index + 1}</span>
                        <span className="sub-menu__text">{blog.preview_title}</span>
                        <span className="sub-menu__likes">{blog.like_count} likes</span>
                      </a>
                    </li>
                  ))
                )}
              </ul>
            </li>
            <li
              className={
                currentPath === "/create" || currentPath === "/publish" ? "current-menu-item" : ""
              }
            >
              <a href="/create">Create</a>
            </li>
            {sessionLogged ? (
              <li
                className={` has-children ${currentPath === "/profile" ? "current-menu-item" : ""}`}
              >
                <a href="#" onClick={toggleMenu}>
                  User
                </a>
                <ul className="sub-menu">
                  <li>
                    <a href="/profile">Profile</a>
                  </li>
                  <li>
                    <a href="/account/settings">Settings</a>
                  </li>
                  <li>
                    <a href="/about">About</a>
                  </li>
                  <li>
                    <a href="/contact">Contact</a>
                  </li>
                  <li>
                    <a href=" " onClick={logout}>
                      Logout
                    </a>
                  </li>
                </ul>
              </li>
            ) : (
              <li className={currentPath === "/login" ? "current-menu-item" : ""}>
                <a className="text-dark-emphasis" href="/session/new">
                  Log in
                </a>
              </li>
            )}
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
              onSubmit={handleSearchSubmit}
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
              <input type="submit" className="s-header__search-submit" value="Search" />
            </form>
            <a href="#0" title="Close Search" className="s-header__search-close">
              Close
            </a>
          </div>
        </div>
      </div>
      <a className="s-header__search-trigger" href=" ">
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
      <a className="s-header__menu-toggle" href=" ">
        <span>Menu</span>
      </a>
      <MobileMenu />
      <SearchEffect />
    </header>
  );
};
export default Header;
