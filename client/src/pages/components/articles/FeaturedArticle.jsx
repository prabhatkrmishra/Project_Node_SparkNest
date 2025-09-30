/* eslint-disable react/prop-types */
const FeaturedArticle = (props) => {
  const link = `/article/view/${props.articleId}`;
  return (
    <article className="hero__slide swiper-slide">
      <div
        className="hero__entry-image"
        style={{
          backgroundImage: `url(${props.previewImage})`,
        }}
      ></div>
      <div className="hero__entry-text-inner">
        <div className="hero__entry-meta">
          {props.categories.length > 0 && (
            <span className="cat-links">
              <a href={`/category/${props.categories[0]}`}>
                {props.categories[0]}
              </a>
            </span>
          )}
        </div>
        <h2 className="hero__entry-title">
          <a href={link}>{props.previewTitle}</a>
        </h2>
        <p className="hero__entry-desc">{props.previewSubtitle}</p>
        <a className="hero__more-link" href={link}>
          Read More
        </a>
      </div>
    </article>
  );
};

export default FeaturedArticle;
