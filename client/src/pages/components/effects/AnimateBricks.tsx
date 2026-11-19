// @ts-nocheck
import { useLayoutEffect } from "react";

/**
 * Progressive enhancement for the brick grid.
 *
 * Content is visible by default (no JS class = no hiding). When JS runs we
 * prepare each block, then reveal it with an IntersectionObserver. A short
 * fallback timer reveals everything if the observer never fires, and reduced
 * motion users get an immediate, animation-free reveal.
 */
const AnimateBricks = () => {
  useLayoutEffect(() => {
    const blocks = Array.from(document.querySelectorAll("[data-animate-block]"));
    if (!blocks.length) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let observer;

    const reveal = (block) => {
      if (!block || block.classList.contains("ss-animated")) return;
      const elements = block.querySelectorAll("[data-animate-el]");
      elements.forEach((el, index) => {
        el.style.setProperty("--transition-delay", `${Math.min(index * 80, 480)}ms`);
      });
      block.classList.add("reveal-prepared");
      block.classList.add("ss-animated");
    };

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      blocks.forEach(reveal);
      return;
    }

    blocks.forEach((block) => block.classList.add("reveal-prepared"));

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer?.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );

    blocks.forEach((block) => observer.observe(block));

    // Safety net: never leave prepared content invisible.
    const fallback = window.setTimeout(() => blocks.forEach(reveal), 1500);

    return () => {
      window.clearTimeout(fallback);
      observer?.disconnect();
    };
  }, []);

  return null;
};

export default AnimateBricks;
