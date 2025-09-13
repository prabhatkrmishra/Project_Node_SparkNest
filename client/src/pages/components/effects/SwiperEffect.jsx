import { useEffect } from "react";
import Swiper from "swiper";
import { Pagination, EffectFade } from "swiper/modules";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css";

const SwiperEffect = () => {
  useEffect(() => {
    const getSwiperDirection = () => {
      return window.innerWidth > 1290 ? "vertical" : "horizontal";
    };

    const swiper = new Swiper(".swiper-container", {
      modules: [Pagination, EffectFade],
      direction: getSwiperDirection(),
      loop: true,
      slidesPerView: 1,
      effect: "fade",
      speed: 2000,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        renderBullet: (index, className) => {
          return `<span class="${className}">${index + 1}</span>`;
        },
      },
      on: {
        init: () => {
          const paginationEl = document.querySelector(".swiper-pagination");
          if (paginationEl) {
            paginationEl.classList.remove("swiper-pagination-bullets");
          }
        },
      },
    });

    const handleResize = () => {
      const newDirection = getSwiperDirection();
      if (swiper.params.direction !== newDirection) {
        swiper.changeDirection(newDirection);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (swiper) swiper.destroy(true, true);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return null;
};

export default SwiperEffect;
