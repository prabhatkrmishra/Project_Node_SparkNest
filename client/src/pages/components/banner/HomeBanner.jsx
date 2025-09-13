import SwiperEffect from "../effects/SwiperEffect";
import FeaturedArticle from "../articles/FeaturedArticle";
import ScrollDown from "../navigate/ScrollDown";

const HomeBanner = () => {
  return (
    <>
      <div className="hero">
        <div className="hero__slider swiper-container">
          <div className="swiper-wrapper">
            <FeaturedArticle />
          </div>
          <div className="swiper-pagination"></div>
        </div>
        <ScrollDown />
      </div>
      <SwiperEffect />
    </>
  );
};

export default HomeBanner;
