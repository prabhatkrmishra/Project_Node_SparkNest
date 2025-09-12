import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MasonryEffect from "./components/effects/MasonryEffect";
import AnimateBricks from "./components/effects/AnimateBricks";
import MoveToEffect from "./components/effects/MoveToEffect";

const Category = () => {
  const [searchParams] = useSearchParams();
  const categoryType = searchParams.get("type")
    ? searchParams.get("type")
    : "design";

  var category = "";
  const validCategoryTypes = [
    "design",
    "lifestyle",
    "inspiration",
    "workplace",
    "health",
    "photography",
  ];

  if (validCategoryTypes.includes(categoryType)) {
    category = categoryType.charAt(0).toUpperCase() + categoryType.slice(1);
  } else {
    return (window.location.href = "/");
  }

  return (
    <>
      <Helmet>
        <title>Category - {category} : BloggingVerse</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content">
          <div className="s-pageheader">
            <div className="row">
              <div className="column large-12">
                <h1 className="page-title">
                  <span
                    className="page-title__small-type"
                    style={{ marginBottom: "25px" }}
                  >
                    Category:
                  </span>
                  {category}
                </h1>
              </div>
            </div>
          </div>

          <div id="bricks" className="bricks">
            <div className="masonry">
              <div className="bricks-wrapper" data-animate-block>
                <div className="grid-sizer"></div>

                <article className="brick entry" data-animate-el>
                  <div className="entry__thumb">
                    <a href="single-standard.html" className="thumb-link">
                      <img
                        src="/images/thumbs/masonry/statue-600.jpg"
                        srcSet="/images/thumbs/masonry/statue-600.jpg 1x, /images/thumbs/masonry/statue-1200.jpg 2x"
                        alt=""
                      />
                    </a>
                  </div>

                  <div className="entry__text">
                    <div className="entry__header">
                      <div className="entry__meta">
                        <span className="cat-links">
                          <a href="#">Design</a>
                        </span>
                        <span className="byline">
                          By:
                          <a href="#0">Naruto Uzumaki</a>
                        </span>
                      </div>
                      <h1 className="entry__title">
                        <a href="single-standard.html">
                          Just a Normal Simple Blog Post.
                        </a>
                      </h1>
                    </div>
                    <div className="entry__excerpt">
                      <p>
                        Lorem ipsum Sed eiusmod esse aliqua sed incididunt
                        aliqua incididunt mollit id et sit proident dolor nulla
                        sed commodo est ad minim elit reprehenderit nisi officia
                        aute incididunt velit sint in aliqua cillum in.
                      </p>
                    </div>
                    <a className="entry__more-link" href="#0">
                      Read More
                    </a>
                  </div>
                </article>

                <article className="brick entry" data-animate-el>
                  <div className="entry__thumb">
                    <a href="single-standard.html" className="thumb-link">
                      <img
                        src="/images/thumbs/masonry/beetle-600.jpg"
                        srcSet="/images/thumbs/masonry/beetle-600.jpg 1x, /images/thumbs/masonry/beetle-1200.jpg 2x"
                        alt=""
                      />
                    </a>
                  </div>

                  <div className="entry__text">
                    <div className="entry__header">
                      <div className="entry__meta">
                        <span className="cat-links">
                          <a href="#">Lifestyle</a>
                        </span>
                        <span className="post-date">
                          By:
                          <a href="#0">Sasuke Uchiha</a>
                        </span>
                      </div>
                      <h1 className="entry__title">
                        <a href="single-standard.html">
                          Throwback To The Good Old Days.
                        </a>
                      </h1>
                    </div>
                    <div className="entry__excerpt">
                      <p>
                        Ipsam odio corrupti et dolores odit aliquid quo. Dolore
                        consectetur a sit modi quam debitis non omnis. Enim
                        ullam voluptatem ipsum soluta sed debitis nihil quasi.
                        Et et et sit. Lorem ipsum Sed eiusmod esse aliqua sed
                        incididunt.
                      </p>
                    </div>
                    <a className="entry__more-link" href="#0">
                      Read More
                    </a>
                  </div>
                </article>

                <article className="brick entry" data-animate-el>
                  <div className="entry__thumb">
                    <a href="single-standard.html" className="thumb-link">
                      <img
                        src="/images/thumbs/masonry/grayscale-600.jpg"
                        srcSet="/images/thumbs/masonry/grayscale-600.jpg 1x, /images/thumbs/masonry/grayscale-1200.jpg 2x"
                        alt=""
                      />
                    </a>
                  </div>

                  <div className="entry__text">
                    <div className="entry__header">
                      <div className="entry__meta">
                        <span className="cat-links">
                          <a href="#">Design</a>
                        </span>
                        <span className="byline">
                          By:
                          <a href="#0">Naruto Uzumaki</a>
                        </span>
                      </div>
                      <h1 className="entry__title">
                        <a href="single-standard.html">
                          5 Grayscale Coloring Techniques.
                        </a>
                      </h1>
                    </div>
                    <div className="entry__excerpt">
                      <p>
                        Quo saepe magni magnam expedita nobis. Rerum assumenda
                        necessitatibus tempora dolorem. Harum animi tempora odio
                        natus et et perferendis possimus. Aut quo mollitia
                        libero molestiae aut molestiae voluptate tempore. Eius
                        voluptatem eligendi .
                      </p>
                    </div>
                    <a className="entry__more-link" href="#0">
                      Read More
                    </a>
                  </div>
                </article>

                <article className="brick entry" data-animate-el>
                  <div className="entry__thumb">
                    <a href="single-standard.html" className="thumb-link">
                      <img
                        src="/images/thumbs/masonry/woodcraft-600.jpg"
                        srcSet="/images/thumbs/masonry/woodcraft-600.jpg 1x, /images/thumbs/masonry/woodcraft-1200.jpg 2x"
                        alt=""
                      />
                    </a>
                  </div>

                  <div className="entry__text">
                    <div className="entry__header">
                      <div className="entry__meta">
                        <span className="cat-links">
                          <a href="#">Lifestyle</a>
                        </span>
                        <span className="byline">
                          By:
                          <a href="#0">Shikamaru Nara</a>
                        </span>
                      </div>
                      <h1 className="entry__title">
                        <a href="single-standard.html">
                          What Minimalism Really Looks Like.
                        </a>
                      </h1>
                    </div>
                    <div className="entry__excerpt">
                      <p>
                        Lorem ipsum Sed eiusmod esse aliqua sed incididunt
                        aliqua incididunt mollit id et sit proident dolor nulla
                        sed commodo est ad minim elit reprehenderit nisi officia
                        aute incididunt velit sint in aliqua cillum in consequat
                        consequat.
                      </p>
                    </div>
                    <a className="entry__more-link" href="#0">
                      Read More
                    </a>
                  </div>
                </article>

                <article className="brick entry" data-animate-el>
                  <div className="entry__thumb">
                    <a href="single-standard.html" className="thumb-link">
                      <img
                        src="/images/thumbs/masonry/tulips-600.jpg"
                        srcSet="/images/thumbs/masonry/tulips-600.jpg 1x, /images/thumbs/masonry/tulips-1200.jpg 2x"
                        alt=""
                      />
                    </a>
                  </div>

                  <div className="entry__text">
                    <div className="entry__header">
                      <div className="entry__meta">
                        <span className="cat-links">
                          <a href="#">Health</a>
                        </span>
                        <span className="byline">
                          By:
                          <a href="#0">Kakashi Hatake</a>
                        </span>
                      </div>
                      <h1 className="entry__title">
                        <a href="single-standard.html">
                          10 Interesting Facts About Caffeine.
                        </a>
                      </h1>
                    </div>
                    <div className="entry__excerpt">
                      <p>
                        Consequatur amet voluptatem aliquid fuga. Consequatur
                        tempora eos earum deleniti repellendus ducimus. Qui
                        ipsum voluptas sed et ad dignissimos explicabo maxime
                        dolor. Rerum quia et. Suscipit similique et. Atque
                        tenetur provident. Excepturi autem unde.
                      </p>
                    </div>
                    <a className="entry__more-link" href="#0">
                      Read More
                    </a>
                  </div>
                </article>

                <article className="brick entry" data-animate-el>
                  <div className="entry__thumb">
                    <a href="single-standard.html" className="thumb-link">
                      <img
                        src="/images/thumbs/masonry/red-and-blue-600.jpg"
                        srcSet="/images/thumbs/masonry/red-and-blue-600.jpg 1x, /images/thumbs/masonry/red-and-blue-1200.jpg 2x"
                        alt=""
                      />
                    </a>
                  </div>

                  <div className="entry__text">
                    <div className="entry__header">
                      <div className="entry__meta">
                        <span className="cat-links">
                          <a href="#">Work</a>
                          <a href="#">Design</a>
                        </span>
                        <span className="byline">
                          By:
                          <a href="#0">Shikamaru Nara</a>
                        </span>
                      </div>
                      <h1 className="entry__title">
                        <a href="single-standard.html">
                          Red and Blue Photo Effects.
                        </a>
                      </h1>
                    </div>
                    <div className="entry__excerpt">
                      <p>
                        Lorem ipsum Sed eiusmod esse aliqua sed incididunt
                        aliqua incididunt mollit id et sit proident dolor nulla
                        sed commodo est ad minim elit reprehenderit nisi officia
                        aute incididunt velit sint in aliqua cillum in consequat
                        consequat in culpa in anim.
                      </p>
                    </div>
                    <a className="entry__more-link" href="#0">
                      Read More
                    </a>
                  </div>
                </article>

                <article className="brick entry" data-animate-el>
                  <div className="entry__thumb">
                    <a href="single-standard.html" className="thumb-link">
                      <img
                        src="/images/thumbs/masonry/white-lamp-600.jpg"
                        srcSet="/images/thumbs/masonry/white-lamp-600.jpg 1x, /images/thumbs/masonry/white-lamp-1200.jpg 2x"
                        alt=""
                      />
                    </a>
                  </div>

                  <div className="entry__text">
                    <div className="entry__header">
                      <div className="entry__meta">
                        <span className="cat-links">
                          <a href="#">Lifestyle</a>
                          <a href="#">Work</a>
                        </span>
                        <span className="byline">
                          By:
                          <a href="#0">Naruto Uzumaki</a>
                        </span>
                      </div>
                      <h1 className="entry__title">
                        <a href="single-standard.html">
                          10 Practical Ways to Be Minimalist.
                        </a>
                      </h1>
                    </div>
                    <div className="entry__excerpt">
                      <p>
                        Ratione qui voluptas reprehenderit facilis soluta ut
                        nam. Distinctio cum excepturi et. Aperiam blanditiis
                        voluptatem. A esse sunt nesciunt voluptate. Architecto
                        voluptas id rerum placeat nostrum et optio. Placeat
                        occaecati voluptas.
                      </p>
                    </div>
                    <a className="entry__more-link" href="#0">
                      Read More
                    </a>
                  </div>
                </article>

                <article className="brick entry" data-animate-el>
                  <div className="entry__thumb">
                    <a href="single-standard.html" className="thumb-link">
                      <img
                        src="/images/thumbs/masonry/books-600.jpg"
                        srcSet="/images/thumbs/masonry/books-600.jpg 1x, /images/thumbs/masonry/books-1200.jpg 2x"
                        alt=""
                      />
                    </a>
                  </div>

                  <div className="entry__text">
                    <div className="entry__header">
                      <div className="entry__meta">
                        <span className="cat-links">
                          <a href="#">Health</a>
                          <a href="#">Lifestyle</a>
                        </span>
                        <span className="byline">
                          By:
                          <a href="#0">Sakura Haruno</a>
                        </span>
                      </div>
                      <h1 className="entry__title">
                        <a href="single-standard.html">
                          What Does Reading Do to Your Brain?
                        </a>
                      </h1>
                    </div>
                    <div className="entry__excerpt">
                      <p>
                        Lorem ipsum Sed eiusmod esse aliqua sed incididunt
                        aliqua incididunt mollit id et sit proident dolor nulla
                        sed commodo est ad minim elit reprehenderit nisi officia
                        aute incididunt velit sint in aliqua cillum in
                        consequat.
                      </p>
                    </div>
                    <a className="entry__more-link" href="#0">
                      Read More
                    </a>
                  </div>
                </article>

                <article className="brick entry" data-animate-el>
                  <div className="entry__thumb">
                    <a href="single-standard.html" className="thumb-link">
                      <img
                        src="/images/thumbs/masonry/lamp-600.jpg"
                        srcSet="/images/thumbs/masonry/lamp-600.jpg 1x, /images/thumbs/masonry/lamp-1200.jpg 2x"
                        alt=""
                      />
                    </a>
                  </div>

                  <div className="entry__text">
                    <div className="entry__header">
                      <div className="entry__meta">
                        <span className="cat-links">
                          <a href="#">Design</a>
                          <a href="#">Photography</a>
                        </span>
                        <span className="byline">
                          By:
                          <a href="#0">Shikamaru Narra</a>
                        </span>
                      </div>
                      <h1 className="entry__title">
                        <a href="single-standard.html">
                          Symmetry In Modern Design.
                        </a>
                      </h1>
                    </div>
                    <div className="entry__excerpt">
                      <p>
                        Praesentium vel similique laboriosam repudiandae
                        mollitia error. Inventore numquam occaecati omnis beatae
                        fugiat. Porro sed numquam doloribus dolores
                        exercitationem recusandae culpa. Sint vel vel quia quis.
                        Non velit eum ea tempora quas sapiente.
                      </p>
                    </div>
                    <a className="entry__more-link" href="#0">
                      Read More
                    </a>
                  </div>
                </article>

                <article className="brick entry" data-animate-el>
                  <div className="entry__thumb">
                    <a href="single-standard.html" className="thumb-link">
                      <img
                        src="/images/thumbs/masonry/clock-600.jpg"
                        srcSet="/images/thumbs/masonry/clock-600.jpg 1x, /images/thumbs/masonry/clock-1200.jpg 2x"
                        alt=""
                      />
                    </a>
                  </div>

                  <div className="entry__text">
                    <div className="entry__header">
                      <div className="entry__meta">
                        <span className="cat-links">
                          <a href="#">Lifestyle</a>
                          <a href="#">Work</a>
                        </span>
                        <span className="byline">
                          By:
                          <a href="#0">Sasuke Uchiha</a>
                        </span>
                      </div>
                      <h1 className="entry__title">
                        <a href="single-standard.html">
                          10 Tips for Managing Time Effectively.
                        </a>
                      </h1>
                    </div>
                    <div className="entry__excerpt">
                      <p>
                        Lorem ipsum Sed eiusmod esse aliqua sed incididunt
                        aliqua incididunt mollit id et sit proident dolor nulla
                        sed commodo est ad minim elit reprehenderit nisi officia
                        aute incididunt velit sint in aliqua cillum in anim.
                      </p>
                    </div>
                    <a className="entry__more-link" href="#0">
                      Read More
                    </a>
                  </div>
                </article>

                <article className="brick entry" data-animate-el>
                  <div className="entry__thumb">
                    <a href="single-standard.html" className="thumb-link">
                      <img
                        src="/images/thumbs/masonry/phone-and-keyboard-600.jpg"
                        srcSet="/images/thumbs/masonry/phone-and-keyboard-600.jpg 1x, /images/thumbs/masonry/phone-and-keyboard-1200.jpg 2x"
                        alt=""
                      />
                    </a>
                  </div>

                  <div className="entry__text">
                    <div className="entry__header">
                      <div className="entry__meta">
                        <span className="cat-links">
                          <a href="https://www.dreamhost.com/r.cgi?287326">
                            Dreamhost
                          </a>
                        </span>
                        <span className="byline">
                          By:
                          <a href="#0">StyleShout</a>
                        </span>
                      </div>
                      <h1 className="entry__title">
                        <a href="https://www.dreamhost.com/r.cgi?287326">
                          Need Web Hosting for Your Websites?
                        </a>
                      </h1>
                    </div>
                    <div className="entry__excerpt">
                      <p>
                        Need hosting? We would highly recommend DreamHost. Enjoy
                        100% in-house support, guaranteed performance and
                        uptime, 1-click installs, and a super-intuitive control
                        panel to make managing your websites and projects easy.
                      </p>
                    </div>
                    <a
                      className="entry__more-link"
                      href="https://www.dreamhost.com/r.cgi?287326"
                    >
                      Learn More
                    </a>
                  </div>
                </article>

                <article className="brick entry" data-animate-el>
                  <div className="entry__thumb">
                    <a href="single-standard.html" className="thumb-link">
                      <img
                        src="/images/thumbs/masonry/wheel-600.jpg"
                        srcSet="/images/thumbs/masonry/wheel-600.jpg 1x, /images/thumbs/masonry/wheel-1200.jpg 2x"
                        alt=""
                      />
                    </a>
                  </div>

                  <div className="entry__text">
                    <div className="entry__header">
                      <div className="entry__meta">
                        <span className="cat-links">
                          <a href="#">Photography</a>
                        </span>
                        <span className="byline">
                          By:
                          <a href="#0">Naruto Uzumaki</a>
                        </span>
                      </div>
                      <h1 className="entry__title">
                        <a href="single-standard.html">
                          Black And White Photography Tips.
                        </a>
                      </h1>
                    </div>
                    <div className="entry__excerpt">
                      <p>
                        Voluptatem maiores aut delectus accusamus et explicabo
                        et. Enim sunt quo odio sit. Hic consequatur et quia
                        voluptas saepe. Vel nostrum incidunt ab eum distinctio
                        recusandae. Labore dolore consequatur occaecati iste ex
                        consectetur et perferendis.
                      </p>
                    </div>
                    <a className="entry__more-link" href="#0">
                      Read More
                    </a>
                  </div>
                </article>
              </div>
            </div>

            <div className="row pagination">
              <div className="column lg-12">
                <nav className="pgn">
                  <ul>
                    <li>
                      <a className="pgn__prev" href="#0">
                        <svg
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M10.25 6.75L4.75 12L10.25 17.25"
                          ></path>
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M19.25 12H5"
                          ></path>
                        </svg>
                      </a>
                    </li>
                    <li>
                      <a className="pgn__num" href="#0">
                        1
                      </a>
                    </li>
                    <li>
                      <span className="pgn__num current">2</span>
                    </li>
                    <li>
                      <a className="pgn__num" href="#0">
                        3
                      </a>
                    </li>
                    <li>
                      <a className="pgn__num" href="#0">
                        4
                      </a>
                    </li>
                    <li>
                      <a className="pgn__num" href="#0">
                        5
                      </a>
                    </li>
                    <li>
                      <span className="pgn__num dots">…</span>
                    </li>
                    <li>
                      <a className="pgn__num" href="#0">
                        8
                      </a>
                    </li>
                    <li>
                      <a className="pgn__next" href="#0">
                        <svg
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M13.75 6.75L19.25 12L13.75 17.25"
                          ></path>
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M19 12H4.75"
                          ></path>
                        </svg>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </section>
        <Footer />
        <MasonryEffect />
        <AnimateBricks />
        <MoveToEffect />
      </div>
    </>
  );
};

export default Category;
