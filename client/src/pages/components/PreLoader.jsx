import { useLayoutEffect } from "react";

const PreLoader = () => {
  useLayoutEffect(() => {
    const preloader = document.querySelector("#preloader");
    if (!preloader) {
      return;
    }

    document.documentElement.classList.add("ss-preload");

    const handleLoad = () => {
      document.documentElement.classList.remove("ss-preload");
      document.documentElement.classList.add("ss-loaded");

      if (preloader.classList.contains("transition")) {
        preloader.addEventListener(
          "transitionend",
          function afterTransition(e) {
            if (e.target.matches("#preloader")) {
              e.target.style.display = "none";
              preloader.removeEventListener(e.type, afterTransition);
            }
          }
        );
      } else {
        preloader.style.display = "none";
      }

      setTimeout(() => {
        if (preloader.style.display !== "none") {
          preloader.style.display = "none";
        }
      }, 3000);
    };

    const handleDOMContentLoaded = () => {
      handleLoad();
    };

    document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);

    window.addEventListener("load", handleLoad);

    return () => {
      document.removeEventListener("DOMContentLoaded", handleDOMContentLoaded);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return (
    <div id="preloader" className="transition">
      <div id="loader" className="dots-fade">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default PreLoader;
