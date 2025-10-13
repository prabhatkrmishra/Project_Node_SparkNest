import { Helmet } from "react-helmet";
import { useState } from "react";
import Cookies from "js-cookie";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MoveToEffect from "./components/effects/MoveToEffect";

import { sendMessage } from "../api/SERVICESAPI";

const Contact = () => {
  const user = Cookies.get("sessionUser") ? JSON.parse(Cookies.get("sessionUser")) : null;

  const [message, setMessage] = useState({
    name: user ? user.fname + " " + user.lname : "",
    email: user ? user.email : "",
    message: "",
  });
  const [show, setShow] = useState(false);
  const [mssg, setMssg] = useState("");
  const handleModal = () => setShow(!show);

  const handleChange = (e) => {
    setMessage((preVal) => {
      return {
        ...preVal,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await sendMessage(message);
      if (response.status == 200) {
        setMssg(response.data.message);
        setShow(true);
        setMessage(() => {
          return {
            name: "",
            email: "",
            message: "",
          };
        });
      }
    } catch (error) {
      setMssg(error.response.data.message);
      setShow(true);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact : SparkNest</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content s-content--page">
          <div className="row entry-wrap">
            <div className="column lg-12">
              <article className="entry">
                <header className="entry__header entry__header--narrow">
                  <h1 className="entry__title">{`Say What's up`}</h1>
                </header>
                <div className="entry__media">
                  <figure className="featured-image">
                    <img
                      alt=""
                      sizes="(max-width: 2400px) 100vw, 2400px"
                      src="/images/thumbs/contact/contact-1200.jpg"
                      srcSet="/images/thumbs/contact/contact-2400.jpg 2400w, /images/thumbs/contact/contact-1200.jpg 1200w, /images/thumbs/contact/contact-600.jpg 600w"
                    />
                  </figure>
                </div>
                <div className="content-primary">
                  <div className="entry__content">
                    <p className="lead" style={{ textAlign: "justify" }}>
                      At SparkNest, we are committed to fostering meaningful
                      connections with our community. Whether you have feedback,
                      suggestions, or just want to say hello, we’re here to
                      listen. Your input helps us grow and create better
                      experiences for everyone.
                    </p>
                    <p style={{ textAlign: "justify" }}>
                      We believe in open communication and value your thoughts.
                      Feel free to reach out for any inquiries, suggestions or
                      collaborations. Our team is always ready to assist and
                      ensure your voice is heard. Simply fill out the form
                      below, and we’ll get back to you as soon as possible.
                      Thank you for being a part of SparkNest! We look forward
                      to hearing from you.
                    </p>
                    <div className="row block-large-1-2 block-tab-whole entry__blocks">
                      <div className="column">
                        <h4>Contact Info</h4>
                        <p style={{marginBottom: "8px"}}>
                          <b>Mail</b>: <a href="mailto:mprabhat774@gmail.com">mprabhat774@gmail.com</a>
                          <br />
                          <b>Service</b>: <a href="mailto:mprabhat774@gmail.com">spark.nest.service@gmail.com</a>
                        </p>
                      </div>
                    </div>
                    <h4>Feel Free to Say Hello.</h4>
                    <form
                      action=""
                      autoComplete="off"
                      className="entry__form"
                      id="cForm"
                      name="cForm"
                      onSubmit={handleSubmit}
                    >
                      <fieldset className="row">
                        <div className="column lg-6 tab-12 form-field">
                          <input
                            className="u-fullwidth"
                            id="cName"
                            name="name"
                            placeholder="Your Name"
                            type="text"
                            value={message.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="column lg-6 tab-12 form-field">
                          <input
                            className="u-fullwidth"
                            id="cEmail"
                            name="email"
                            placeholder="Your Email"
                            type="email"
                            value={message.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="column lg-12 message form-field">
                          <textarea
                            className="u-fullwidth"
                            id="cMessage"
                            name="message"
                            placeholder="Your Message"
                            value={message.message}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="column lg-12">
                          <input
                            className="u-fullwidth btn btn--large btn--primary btn-wide"
                            id="submit"
                            name="submit"
                            type="submit"
                            value="Send Message"
                          />
                        </div>
                      </fieldset>
                    </form>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <Modal show={show} onHide={handleModal}>
            <Modal.Body>{mssg}</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </section>
        <Footer />
      </div>
      <MoveToEffect />
    </>
  );
};

export default Contact;
