import { useLayoutEffect, useRef } from "react";

const BackToTop = () => {
  const goTopButtonRef = useRef(null);

  useLayoutEffect(() => {
    const pxShow = 900;
    goTopButtonRef.current = document.querySelector(".ss-go-top");
    if (!goTopButtonRef.current) return;

    const handleScroll = () => {
      if (window.scrollY >= pxShow) {
        if (!goTopButtonRef.current.classList.contains("link-is-visible"))
          goTopButtonRef.current.classList.add("link-is-visible");
      } else {
        goTopButtonRef.current.classList.remove("link-is-visible");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
};

export default BackToTop;
