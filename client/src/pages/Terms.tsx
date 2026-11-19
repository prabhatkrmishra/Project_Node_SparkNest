// @ts-nocheck
import { Helmet } from "react-helmet-async";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MoveToEffect from "./components/effects/MoveToEffect";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms &amp; Policy : SparkNest</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content s-content--page">
          <div className="row entry-wrap">
            <div className="column lg-12">
              <article className="entry">
                <header className="entry__header entry__header--narrow">
                  <h1 className="entry__title">Terms &amp; Policy</h1>
                </header>
                <div className="entry__content">
                  <p className="lead">
                    The short version: SparkNest is a place to publish and read articles. Be kind,
                    publish your own work, and don&apos;t abuse the service. The details are below.
                  </p>

                  <h2>1. Accepting these terms</h2>
                  <p>
                    By creating an account or using SparkNest you agree to these Terms &amp; Policy.
                    If you do not agree, please do not use the service. We may update these terms
                    from time to time; continued use after an update means you accept the revised
                    terms.
                  </p>

                  <h2>2. Your account</h2>
                  <p>
                    You are responsible for keeping your password confidential and for any activity
                    under your account. You must provide accurate signup information and keep it
                    up to date. We may suspend accounts that break these terms or compromise other
                    users.
                  </p>

                  <h2>3. Your content</h2>
                  <p>
                    You keep ownership of the articles you publish. By publishing on SparkNest you
                    grant us a non-exclusive license to host, display and distribute that content
                    on the service. Only publish material you have the right to publish — no
                    plagiarism, no unlawful content, no harassment, no spam.
                  </p>

                  <h2>4. Community standards</h2>
                  <p>
                    Be respectful in comments and in the writing itself. We may remove content or
                    restrict accounts that promote hate, abuse, misinformation presented as fact,
                    or illegal activity.
                  </p>

                  <h2>5. Newsletter &amp; privacy</h2>
                  <p>
                    If you subscribe to the newsletter we store your email address to send you
                    updates about SparkNest. You can unsubscribe at any time. SparkNest uses a
                    strictly necessary session cookie to keep you signed in. We do not sell your
                    personal data. We may collect basic, privacy-respecting usage metrics to
                    understand how the service is used and to keep it reliable.
                  </p>

                  <h2>6. Service &amp; liability</h2>
                  <p>
                    SparkNest is provided &quot;as is&quot; without warranties of any kind, express or
                    implied. We do our best to keep the service available, but we do not guarantee
                    uninterrupted or error-free operation. To the maximum extent permitted by law,
                    SparkNest is not liable for indirect or consequential damages arising from the
                    use of the service, including loss of content you failed to back up.
                  </p>

                  <h2>7. Changes &amp; contact</h2>
                  <p>
                    We may revise these terms when the service changes. The current version lives
                    on this page. Questions about these terms, your data, or content removal can
                    be sent through the <a href="/contact">contact page</a>.
                  </p>
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

export default Terms;
