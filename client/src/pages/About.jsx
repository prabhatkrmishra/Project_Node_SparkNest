import { Helmet } from "react-helmet";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MoveToEffect from "./components/effects/MoveToEffect";

const About = () => {
  return (
    <>
      <Helmet>
        <title>BloggingVerse - About</title>
      </Helmet>
      <PreLoader/>
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content s-content--page">
          <div className="row entry-wrap">
            <div className="column lg-12">
              <article className="entry">
                <header className="entry__header entry__header--narrow">
                  <h1 className="entry__title">Learn More About Us.</h1>
                </header>
                <div className="entry__media">
                  <figure className="featured-image">
                    <img
                      alt=""
                      sizes="(max-width: 2400px) 100vw, 2400px"
                      src="/images/thumbs/about/about-1200.jpg"
                      srcSet="/images/thumbs/about/about-2400.jpg 2400w, /images/thumbs/about/about-1200.jpg 1200w, /images/thumbs/about/about-600.jpg 600w"
                    />
                  </figure>
                </div>
                <div className="content-primary">
                  <div className="entry__content">
                    <p className="lead">
                      Duis ex ad cupidatat tempor Excepteur cillum cupidatat
                      fugiat nostrud cupidatat dolor sunt sint sit nisi est eu
                      exercitation incididunt adipisicing veniam velit id fugiat
                      enim mollit amet anim veniam dolor dolor irure velit
                      commodo cillum sit nulla ullamco magna amet magna
                      cupidatat qui labore cillum cillum cupidatat fugiat
                      nostrud.
                    </p>
                    <div className="row block-lg-one-half block-tab-whole">
                      <div className="column">
                        <p className="drop-cap">
                          Eligendi quam at quis. Sit vel neque quam consequuntur
                          expedita quisquam. Incidunt quae qui error. Rerum non
                          facere mollitia ut magnam laboriosam. Quisquam neque
                          quia ex eligendi repellat illum quibusdam aut.
                          Architecto quam consequuntur totam ratione
                          reprehenderit est praesentium impedit maiores
                          incididunt adipisicing veniam velit. Duis ex ad
                          cupidatat tempor Excepteur cillum cupidatat fugiat
                          nostrud cupidatat dolor sunt sint sit nisi est eu
                          exercitation incididunt.
                        </p>
                      </div>
                      <div className="column">
                        <p>
                          Duis ex ad cupidatat tempor Excepteur cillum cupidatat
                          fugiat nostrud cupidatat dolor sunt sint sit nisi est
                          eu exercitation incididunt adipisicing veniam velit id
                          fugiat enim mollit amet anim veniam dolor dolor irure
                          velit commodo cillum sit nulla ullamco magna amet
                          magna cupidatat qui labore cillum sit in tempor veniam
                          consequat non laborum adipisicing aliqua ea nisi sint
                          ut quis proident ullamco ut dolore culpa occaecat ut
                          laboris in sit minim cupidatat ut dolor voluptate enim
                          veniam consequat occaecat fugiat in adipisicing in
                          amet.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", width: "100%" }}>
                    Design by{" "}
                    <a href="https://www.styleshout.com/">StyleShout</a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
        <Footer />
      </div>
      <MoveToEffect />
    </>
  );
};

export default About;
