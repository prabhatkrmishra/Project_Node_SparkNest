import { useEffect } from "react";
import scrollLock from "scroll-lock";

const MobileMenu = () => {
  useEffect(() => {
    const toggleButton = document.querySelector(".s-header__menu-toggle");
    const mainNavWrap = document.querySelector(".s-header__nav-wrap");
    const mainNav = document.querySelector(".s-header__nav");
    const parentMenus = mainNav.querySelectorAll(".has-children");
    const siteBody = document.querySelector("body");
    if (!(toggleButton && mainNavWrap)) return;

    const handleResize = () => {
      if (window.matchMedia("(min-width: 1201px)").matches) {
        if (siteBody.classList.contains("menu-is-open"))
          siteBody.classList.remove("menu-is-open");
        if (toggleButton.classList.contains("is-clicked"))
          toggleButton.classList.remove("is-clicked");
        if (!scrollLock.getScrollState()) scrollLock.enablePageScroll();
        parentMenus.forEach((current) =>
          current.classList.remove("sub-menu-is-open")
        );
      }
    };

    const handleToggleButtonClick = (e) => {
      e.preventDefault();
      toggleButton.classList.toggle("is-clicked");
      siteBody.classList.toggle("menu-is-open");
      if (scrollLock.getScrollState()) {
        scrollLock.disablePageScroll(mainNavWrap);
      } else {
        scrollLock.enablePageScroll(mainNavWrap);
      }
    };

    const handleMainNavClick = (e) => {
      const target = e.target.closest(".has-children");
      if (!target) return;
      if (!target.classList.contains("sub-menu-is-open")) {
        parentMenus.forEach((current) =>
          current.classList.remove("sub-menu-is-open")
        );
        target.classList.add("sub-menu-is-open");
      } else {
        target.classList.remove("sub-menu-is-open");
      }
    };

    toggleButton.addEventListener("click", handleToggleButtonClick);
    mainNav.addEventListener("click", handleMainNavClick);
    window.addEventListener("resize", handleResize);

    return () => {
      toggleButton.removeEventListener("click", handleToggleButtonClick);
      mainNav.removeEventListener("click", handleMainNavClick);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return null;
};

export default MobileMenu;