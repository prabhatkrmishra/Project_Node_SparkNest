import { useEffect } from "react";
import Swiper from "swiper/bundle";
import "swiper/css/pagination";

const SwiperEffect = () => {
  useEffect(() => {
    const swiper = new Swiper(".swiper-container", {
      direction: "vertical",
      slidesPerView: 1,
      effect: "fade",
      speed: 1000,
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
