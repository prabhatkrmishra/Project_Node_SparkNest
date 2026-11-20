// @ts-nocheck
import { useEffect, useState } from "react";
import { getFeatured } from "../../../api/ARTICLESAPI";
import SwiperEffect from "../effects/SwiperEffect";
import FeaturedArticle from "../articles/FeaturedArticle";
import ScrollDown from "../navigate/ScrollDown";

const HomeBanner = () => {
  const [articles, setArticles] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchFeatured = async () => {
      try {
        const response = await getFeatured();
        if (!ignore) {
          setArticles(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        if (!ignore) {
          console.log("Error fetching featured articles:", error.response?.data || error.message);
        }
      } finally {
        if (!ignore) {
          setImagesLoaded(true);
          setLoading(false);
        }
      }
    };
    fetchFeatured();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <div className={`hero${articles.length === 0 ? " hero--empty" : ""}`}>
        {articles.length > 0 ? (
          <div className="hero__slider swiper-container">
            <div className="swiper-wrapper">
              {articles.map((article) => (
                <FeaturedArticle
                  key={article.article_id}
                  articleId={article.article_id}
                  previewTitle={article.preview_title}
                  previewSubtitle={article.preview_subtitle}
                  previewImage={article.featured_images[0]}
                  categories={article.categories}
                />
              ))}
            </div>
            <div className="swiper-pagination"></div>
          </div>
        ) : (
          <div className="hero__empty-inner">
            {loading ? (
              <p className="hero__empty-status" role="status">
                Loading featured stories…
              </p>
            ) : (
              <>
                <p className="hero__empty-eyebrow">SparkNest</p>
                <h2 className="hero__empty-title">Stories worth your attention.</h2>
                <p className="hero__empty-desc">
                  There are no featured stories right now. Browse the latest articles from the
                  community below.
                </p>
                <a className="hero__more-link" href="#bricks">
                  Browse latest articles
                </a>
              </>
            )}
          </div>
        )}
        <ScrollDown />
      </div>
      {articles.length > 0 && <SwiperEffect imagesLoaded={imagesLoaded} />}
    </>
  );
};

export default HomeBanner;
