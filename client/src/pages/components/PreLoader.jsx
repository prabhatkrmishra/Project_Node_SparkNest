import { useEffect, useRef } from "react";

const PreLoader = () => {
  const preloaderRef = useRef(null);

  useEffect(() => {
    const preloader = preloaderRef.current;
    if (!preloader) {
      return;
    }

    document.documentElement.classList.add("ss-preload");

    const handleLoad = () => {
      document.documentElement.classList.remove("ss-preload");
      document.documentElement.classList.add("ss-loaded");

      const afterTransition = (e) => {
        if (e.target === preloader) {
          preloader.style.display = "none";
          preloader.removeEventListener("transitionend", afterTransition);
        }
      };

      preloader.addEventListener("transitionend", afterTransition);

      const cleanup = () => {
        preloader.removeEventListener("transitionend", afterTransition);
        preloader.style.display = "none";
      };

      setTimeout(cleanup, 3000);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return (
    <div id="preloader" ref={preloaderRef}>
      <div id="loader" className="dots-fade">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default PreLoader;
