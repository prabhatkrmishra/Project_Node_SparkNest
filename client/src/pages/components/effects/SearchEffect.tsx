// @ts-nocheck
import { useEffect } from "react";
import scrollLock from "scroll-lock";

const SearchEffect = () => {
  useEffect(() => {
    const searchWrap = document.querySelector(".s-header__search");
    const searchTrigger = document.querySelector(".s-header__search-trigger");
    if (!(searchWrap && searchTrigger)) return;
    const searchField = searchWrap.querySelector(".s-header__search-field");
    const closeSearchButton = searchWrap.querySelector(".s-header__search-close");
    const siteBody = document.querySelector("body");

    const handleSearchTriggerClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      siteBody.classList.add("search-is-visible");
      searchTrigger.setAttribute("aria-expanded", "true");
      if (scrollLock.getScrollState()) {
        scrollLock.disablePageScroll(searchWrap);
      } else {
        scrollLock.enablePageScroll(searchWrap);
      }
      setTimeout(() => searchField.focus(), 100);
    };

    const closeOverlay = ({ restoreFocus = false } = {}) => {
      if (!siteBody.classList.contains("search-is-visible")) return;
      siteBody.classList.remove("search-is-visible");
      searchTrigger.setAttribute("aria-expanded", "false");
      setTimeout(() => searchField.blur(), 100);
      if (scrollLock.getScrollState()) {
        scrollLock.disablePageScroll(searchWrap);
      } else {
        scrollLock.enablePageScroll(searchWrap);
      }
      if (restoreFocus) searchTrigger.focus();
    };

    const handleCloseSearchClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeOverlay({ restoreFocus: true });
    };

    const handleSearchWrapClick = (e) => {
      if (!e.target.matches(".s-header__search-inner")) {
        e.stopPropagation();
        closeOverlay();
      }
    };

    const handleSearchFieldClick = (e) => e.stopPropagation();
    // Keyboard users: Escape closes the overlay.
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && siteBody.classList.contains("search-is-visible")) {
        e.stopPropagation();
        closeOverlay({ restoreFocus: true });
      }
    };

    searchTrigger.addEventListener("click", handleSearchTriggerClick);
    closeSearchButton.addEventListener("click", handleCloseSearchClick);
    searchWrap.addEventListener("click", handleSearchWrapClick);
    searchField.addEventListener("click", handleSearchFieldClick);
    document.addEventListener("keydown", handleKeyDown);
    searchField.setAttribute("placeholder", "Search for...");
    searchField.setAttribute("autocomplete", "off");

    return () => {
      searchTrigger.removeEventListener("click", handleSearchTriggerClick);
      closeSearchButton.removeEventListener("click", handleCloseSearchClick);
      searchWrap.removeEventListener("click", handleSearchWrapClick);
      searchField.removeEventListener("click", handleSearchFieldClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
};

export default SearchEffect;
