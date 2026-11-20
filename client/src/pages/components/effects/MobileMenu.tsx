// @ts-nocheck
import { useEffect } from "react";
import scrollLock from "scroll-lock";

const MobileMenu = () => {
  useEffect(() => {
    const toggleButton = document.querySelector(".s-header__menu-toggle");
    const mainNavWrap = document.querySelector(".s-header__nav-wrap");
    const mainNav = document.querySelector(".s-header__nav");
    const siteBody = document.querySelector("body");
    if (!(toggleButton && mainNavWrap && mainNav)) return;
    const parentMenus = mainNav.querySelectorAll(".has-children");

    const syncMenuState = (isOpen) => {
      toggleButton.setAttribute("aria-expanded", String(isOpen));
      toggleButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    };

    const closeMenu = () => {
      toggleButton.classList.remove("is-clicked");
      siteBody.classList.remove("menu-is-open");
      parentMenus.forEach((current) => {
        current.classList.remove("sub-menu-is-open");
        current.querySelector(":scope > a")?.setAttribute("aria-expanded", "false");
      });
      if (!scrollLock.getScrollState()) scrollLock.enablePageScroll();
      syncMenuState(false);
    };

    const handleResize = () => {
      if (
        window.matchMedia("(min-width: 1201px)").matches &&
        siteBody.classList.contains("menu-is-open")
      ) {
        closeMenu();
      }
    };

    const handleToggleButtonClick = (e) => {
      e.preventDefault();
      const isOpen = !siteBody.classList.contains("menu-is-open");
      toggleButton.classList.toggle("is-clicked", isOpen);
      siteBody.classList.toggle("menu-is-open", isOpen);
      syncMenuState(isOpen);
      if (scrollLock.getScrollState()) {
        scrollLock.disablePageScroll(mainNavWrap);
      } else {
        scrollLock.enablePageScroll(mainNavWrap);
      }
    };

    const handleMainNavClick = (e) => {
      const target = e.target.closest(".has-children");
      if (!target) return;
      const isOpen = !target.classList.contains("sub-menu-is-open");
      if (isOpen) {
        parentMenus.forEach((current) => {
          current.classList.remove("sub-menu-is-open");
          current.querySelector(":scope > a")?.setAttribute("aria-expanded", "false");
        });
      }
      target.classList.toggle("sub-menu-is-open", isOpen);
      target.querySelector(":scope > a")?.setAttribute("aria-expanded", String(isOpen));
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && siteBody.classList.contains("menu-is-open")) {
        closeMenu();
        toggleButton.focus();
      }
    };

    syncMenuState(false);

    toggleButton.addEventListener("click", handleToggleButtonClick);
    mainNav.addEventListener("click", handleMainNavClick);
    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      toggleButton.removeEventListener("click", handleToggleButtonClick);
      mainNav.removeEventListener("click", handleMainNavClick);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
};

export default MobileMenu;
