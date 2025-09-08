import { Helmet } from "react-helmet";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MoveToEffect from "./components/effects/MoveToEffect";

const Contact = () => {
  return (
    <div>
      <Helmet>
        <title>BloggingVerse - Contact</title>
      </Helmet>
      <PreLoader/>
      <div id="page" className="s-pagewrap">
        <Header />
        <div id="content" className="s-content s-content--page">
          <div className="row entry-wrap">
            <div className="column lg-12">
              <article className="entry">
                <header className="entry__header entry__header--narrow">
                  <h1 className="entry__title">Say Hello.</h1>
                </header>
                <div className="entry__media">
                  <figure className="featured-image">
                    <img
                      alt=""
                      sizes="(max-width: 2400px) 100vw, 2400px"
                      src="images/thumbs/contact/contact-1200.jpg"
                      srcSet="images/thumbs/contact/contact-2400.jpg 2400w, images/thumbs/contact/contact-1200.jpg 1200w, images/thumbs/contact/contact-600.jpg 600w"
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
                    <p>
                      Eligendi quam at quis. Sit vel neque quam consequuntur
                      expedita quisquam. Incidunt quae qui error. Rerum non
                      facere mollitia ut magnam laboriosam. Quisquam neque quia
                      ex eligendi repellat illum quibusdam aut. Architecto quam
                      consequuntur totam ratione reprehenderit est praesentium.
                    </p>
                    <div className="row block-large-1-2 block-tab-whole entry__blocks">
                      <div className="column">
                        <h4>Where to Find Us</h4>
                        <p>
                          1600 Amphitheatre Parkway
                          <br />
                          Mountain View, CA
                          <br />
                          94043 US
                        </p>
                      </div>
                      <div className="column">
                        <h4>Contact Info</h4>
                        <p>
                          someone@yourdomain.com
                          <br />
                          info@yourdomain.com
                          <br />
                          Phone: (+63) 555 1212
                        </p>
                      </div>
                    </div>
                    <h4>Feel Free to Say Hi.</h4>
                    <form
                      action=""
                      autoComplete="off"
                      className="entry__form"
                      id="cForm"
                      method="post"
                      name="cForm"
                    >
                      <fieldset className="row">
                        <div className="column lg-6 tab-12 form-field">
                          <input
                            className="u-fullwidth"
                            id="cName"
                            name="cName"
                            placeholder="Your Name"
                            type="text"
                          />
                        </div>
                        <div className="column lg-6 tab-12 form-field">
                          <input
                            className="u-fullwidth"
                            id="cEmail"
                            name="cEmail"
                            placeholder="Your Email"
                            type="email"
                          />
                        </div>
                        <div className="column lg-12 form-field">
                          <input
                            className="u-fullwidth"
                            id="cWebsite"
                            name="cWebsite"
                            placeholder="Website"
                            type="text"
                          />
                        </div>
                        <div className="column lg-12 message form-field">
                          <textarea
                            className="u-fullwidth"
                            id="cMessage"
                            name="cMessage"
                            placeholder="Your Message"
                          />
                        </div>
                        <div className="column lg-12">
                          <input
                            className="u-fullwidth btn btn--large btn--primary btn-wide"
                            id="submit"
                            name="submit"
                            type="submit"
                            value="Add Comment"
                          />
                        </div>
                      </fieldset>
                    </form>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
        <Footer />
        <MoveToEffect />
      </div>
    </div>
  );
};

export default Contact;
