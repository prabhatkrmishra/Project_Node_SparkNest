const FeaturedArticle = () => {
  return (
    <>
      <article className="hero__slide swiper-slide">
        <div
          className="hero__entry-image"
          style={{
            backgroundImage: `url('/images/thumbs/featured/featured-01_2000.jpg')`,
          }}
        ></div>
        <div className="hero__entry-text-inner">
          <div className="hero__entry-meta">
            <span className="cat-links">
              <a href="category.html">Inspiration</a>
            </span>
          </div>
          <h2 className="hero__entry-title">
            <a href="single-standard.html">
              Understanding and Using Negative Space.
            </a>
          </h2>
          <p className="hero__entry-desc">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud corporis est laudantium voluptatum
            consectetur adipiscing.
          </p>
          <a className="hero__more-link" href="/category?type=inspiration">
            Read More
          </a>
        </div>
      </article>
      <article className="hero__slide swiper-slide">
        <div
          className="hero__entry-image"
          style={{
            backgroundImage: `url('/images/thumbs/featured/featured-02_2000.jpg')`,
          }}
        ></div>
        <div className="hero__entry-text-inner">
          <div className="hero__entry-meta">
            <span className="cat-links">
              <a href="category.html">Health</a>
            </span>
          </div>
          <h2 className="hero__entry-title">
            <a href="single-standard.html">
              10 Reasons Why Being in Nature Is Good For You.
            </a>
          </h2>
          <p className="hero__entry-desc">
            Voluptas harum sequi rerum quasi quisquam. Est tenetur ut doloribus
            in aliquid animi nostrum. Tempora quibusdam ad nulla. Quis autem
            possimus dolores est est fugiat saepe vel aut. Earum consequatur.
          </p>
          <a className="hero__more-link" href="/category?type=health">
            Read More
          </a>
        </div>
      </article>
      <article className="hero__slide swiper-slide">
        <div
          className="hero__entry-image"
          style={{
            backgroundImage: `url('/images/thumbs/featured/featured-03_2000.jpg')`,
          }}
        ></div>
        <div className="hero__entry-text-inner">
          <div className="hero__entry-meta">
            <span className="cat-links">
              <a href="category.html">Lifestyle</a>
            </span>
          </div>
          <h2 className="hero__entry-title">
            <a href="single-standard.html">
              Six Relaxation Techniques to Reduce Stress.
            </a>
          </h2>
          <p className="hero__entry-desc">
            Quasi consequatur quia excepturi ullam velit. Repellat velit vel
            occaecati neque perspiciatis quibusdam nulla. Unde et earum. Nostrum
            nulla optio debitis odio modi. Quis autem possimus dolores est est
            fugiat saepe vel aut.
          </p>
          <a className="hero__more-link" href="/category?type=lifestyle">
            Read More
          </a>
        </div>
      </article>
    </>
  );
};

export default FeaturedArticle;
