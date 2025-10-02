import { Helmet } from "react-helmet";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MoveToEffect from "./components/effects/MoveToEffect";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About : SparkNest</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content s-content--page">
          <div className="row entry-wrap">
            <div className="column lg-12">
              <article className="entry">
                <header className="entry__header entry__header--narrow">
                  <h1 className="entry__title">{`Motivated? We arrived`}</h1>
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
                    <p className="lead" style={{ textAlign: "justify" }}>
                      SparkNest serves as a haven for human narratives and
                      ideas. It empowers anyone to share their insights and
                      knowledge with the world—no need to build a mailing list
                      or cultivate a following beforehand. In a digital
                      landscape filled with noise and confusion, SparkNest
                      offers a serene yet insightful environment. It’s
                      user-friendly, visually appealing, collaborative, and
                      connects you with the right audience for your message.
                    </p>
                    <div className="row block-lg-one-half block-tab-whole">
                      <div className="column">
                        <p
                          className="drop-cap"
                          style={{ textAlign: "justify" }}
                        >
                          Our ultimate aim is to enhance our collective
                          understanding of the world through the art of writing.
                          We hold the belief that the content we read and write
                          holds significance. Words have the power to either
                          alienate or uplift us, to motivate or dishearten. In
                          an age where sensational and shallow narratives often
                          prevail, we are committed to fostering a platform that
                          values depth, complexity, and meaningful engagement.
                          We aim to create a space for thoughtful discussions
                          rather than superficial remarks, prioritizing
                          substance over mere presentation.
                        </p>
                      </div>
                      <div className="column">
                        <p style={{ textAlign: "justify" }}>
                          Every individual engages with their daily life, so why
                          not share their insights on SparkNest? This vibrant
                          platform showcases a multitude of creative topics,
                          including innovative software solutions, compelling
                          narratives from aspiring authors, groundbreaking
                          design concepts, and impactful business strategies.
                          Contributors delve into their current projects,
                          explore the challenges that inspire their work, and
                          reflect on their personal experiences, sharing
                          valuable lessons that resonate with a wide audience.
                        </p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="lg-12 tab-12 mob-12 column">
                        <p style={{ textAlign: "justify" }}>
                          At SparkNest, we prioritize meaningful engagement over
                          advertisements or data exploitation. Our mission is
                          supported by a thriving community of over a million
                          users who share a passion for creativity and
                          exploration. If you’re new to our platform, we invite
                          you to dive into a world of diverse topics. Discover
                          articles that spark new ideas, challenge your
                          perspectives, or encourage you to rethink familiar
                          concepts—and then share your own unique story with us.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div
                      className="lg-12 tab-7 mob-12 column"
                      style={{ width: "100%"}}
                    >
                      <u>Basic Design by:</u>
                      {"  "}
                      <a href="https://www.styleshout.com/">StyleShout</a>
                    </div>
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
