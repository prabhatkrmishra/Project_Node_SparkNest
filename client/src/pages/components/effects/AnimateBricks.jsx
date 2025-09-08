import { useEffect } from "react";

const AnimateBricks = () => {
  useEffect(() => {
    const animateBlocks = document.querySelectorAll("[data-animate-block]");
    const pageWrap = document.querySelector(".s-pagewrap");

    if (!(pageWrap && animateBlocks)) return;

    const doAnimate = (current) => {
      const els = current.querySelectorAll("[data-animate-el]");
      const p = new Promise((resolve) => {
        els.forEach((el, index, array) => {
          const dly = index * 200;
          el.style.setProperty("--transition-delay", `${dly}ms`);
          if (index === array.length - 1) resolve();
        });
      });

      p.then(() => {
        current.classList.add("ss-animated");
      });
    };

    const animateOnScroll = () => {
      const scrollY = window.scrollY;

      animateBlocks.forEach((current) => {
        const viewportHeight = window.innerHeight;
        const triggerTop =
          current.offsetTop + viewportHeight * 0.1 - viewportHeight;
        const blockHeight = current.offsetHeight;
        const blockSpace = triggerTop + blockHeight;
        const inView = scrollY > triggerTop && scrollY <= blockSpace;
        const isAnimated = current.classList.contains("ss-animated");

        if (inView && !isAnimated) {
          doAnimate(current);
        }
      });
    };

    if (pageWrap.classList.contains("ss-home")) {
      window.addEventListener("scroll", animateOnScroll);
    } else {
      window.addEventListener("load", () => {
        doAnimate(animateBlocks[0]);
      });
    }

    return () => {
      window.removeEventListener("scroll", animateOnScroll);
      window.removeEventListener("load", () => {
        doAnimate(animateBlocks[0]);
      });
    };
  }, []);

  return null;
};

export default AnimateBricks;
