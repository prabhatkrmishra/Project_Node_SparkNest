import { Helmet } from "react-helmet-async";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";

const Error = () => {
  return (
    <>
      <Helmet>
        <title>Page not found · SparkNest</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content error-page">
          <div className="row">
            <div className="column lg-12 error-page__inner">
              <p className="error-page__code">404</p>
              <h1>Page not found</h1>
              <p className="error-page__text">
                The page you are looking for doesn’t exist, or it may have moved.
              </p>
              <div className="error-page__actions">
                <a className="btn btn--primary" href="/">
                  Back to home
                </a>
                <a className="btn btn--pill-small" href="/categories">
                  Browse categories
                </a>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default Error;
