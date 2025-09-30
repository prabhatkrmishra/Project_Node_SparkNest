import { useEffect, useState } from "react";
import { getFeatured } from "../../../api/ARTICLESAPI";
import SwiperEffect from "../effects/SwiperEffect";
import FeaturedArticle from "../articles/FeaturedArticle";
import ScrollDown from "../navigate/ScrollDown";

const HomeBanner = () => {
  const [articles, setArticles] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await getFeatured();
        setArticles(response.data);
        setImagesLoaded(true);
      } catch (error) {
        console.log("Error fetching featured articles:", error.response);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <>
      <div className="hero">
        <div className="hero__slider swiper-container">
          <div className="swiper-wrapper">
            {articles.length > 0 ? (
              articles.map((article) => (
                <FeaturedArticle
                  key={article.article_id}
                  articleId={article.article_id}
                  previewTitle={article.preview_title}
                  previewSubtitle={article.preview_subtitle}
                  previewImage={article.featured_images[0]}
                  categories={article.categories}
                />
              ))
            ) : (
              <p>No featured articles available.</p>
            )}
          </div>
          <div className="swiper-pagination"></div>
        </div>
        <ScrollDown />
      </div>
      <SwiperEffect imagesLoaded={imagesLoaded} />
    </>
  );
};

export default HomeBanner;
