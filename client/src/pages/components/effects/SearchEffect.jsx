import { useEffect } from "react";
import scrollLock from "scroll-lock";

const SearchEffect = () => {
  useEffect(() => {
    const searchWrap = document.querySelector(".s-header__search");
    const searchTrigger = document.querySelector(".s-header__search-trigger");
    if (!(searchWrap && searchTrigger)) return;
    const searchField = searchWrap.querySelector(".s-header__search-field");
    const closeSearch = searchWrap.querySelector(".s-header__search-close");
    const siteBody = document.querySelector("body");

    const handleSearchTriggerClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      siteBody.classList.add("search-is-visible");
      if (scrollLock.getScrollState()) {
        scrollLock.disablePageScroll(searchWrap);
      } else {
        scrollLock.enablePageScroll(searchWrap);
      }
      setTimeout(() => searchField.focus(), 100);
    };

    const handleCloseSearchClick = (e) => {
      e.stopPropagation();
      if (siteBody.classList.contains("search-is-visible")) {
        siteBody.classList.remove("search-is-visible");
        setTimeout(() => searchField.blur(), 100);
        if (scrollLock.getScrollState()) {
          scrollLock.disablePageScroll(searchWrap);
        } else {
          scrollLock.enablePageScroll(searchWrap);
        }
      }
    };

    const handleSearchWrapClick = (e) => {
      if (!e.target.matches(".s-header__search-inner")) {
        handleCloseSearchClick(e);
      }
    };

    searchTrigger.addEventListener("click", handleSearchTriggerClick);
    closeSearch.addEventListener("click", handleCloseSearchClick);
    searchWrap.addEventListener("click", handleSearchWrapClick);
    searchField.addEventListener("click", (e) => e.stopPropagation());
    searchField.setAttribute("placeholder", "Search for...");
    searchField.setAttribute("autocomplete", "off");

    return () => {
      searchTrigger.removeEventListener("click", handleSearchTriggerClick);
      closeSearch.removeEventListener("click", handleCloseSearchClick);
      searchWrap.removeEventListener("click", handleSearchWrapClick);
      searchField.removeEventListener("click", (e) => e.stopPropagation());
    };
  }, []);

  return null;
};

export default SearchEffect;
