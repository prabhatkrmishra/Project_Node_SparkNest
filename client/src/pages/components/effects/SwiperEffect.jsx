import { useEffect } from "react";
import Swiper from "swiper";
import { Pagination, EffectFade } from "swiper/modules";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const SwiperEffect = () => {
  useEffect(() => {
    const swiper = new Swiper(".swiper-container", {
      modules: [Pagination, EffectFade],
      direction: "vertical",
      loop: true,
      slidesPerView: 1,
      effect: "fade",
      speed: 2000,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        renderBullet: (index, className) => {
          return '<span class="' + className + '">' + (index + 1) + "</span>";
        },
      },
      on: {
        init: () => {
          document
            .querySelector(".swiper-pagination")
            .classList.remove("swiper-pagination-bullets");
        },
      },
    });

    return () => {
      swiper.destroy();
    };
  }, []);

  return null;
};

export default SwiperEffect;
