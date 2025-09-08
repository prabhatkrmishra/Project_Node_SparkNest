import { useEffect } from "react";

const PreLoader = () => {
  useEffect(() => {
    const preloader = document.querySelector("#preloader");
    if (!preloader) return;

    document.documentElement.classList.add("ss-preload");

    const handleLoad = () => {
      document.documentElement.classList.remove("ss-preload");
      document.documentElement.classList.add("ss-loaded");

      preloader.addEventListener("transitionend", function afterTransition(e) {
        if (e.target.matches("#preloader")) {
          e.target.style.display = "none";
          preloader.removeEventListener(e.type, afterTransition);
        }
      });
    };

    window.addEventListener("load", handleLoad);
  }, []);

  return (
    <div id="preloader">
      <div id="loader" className="dots-fade">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default PreLoader;
