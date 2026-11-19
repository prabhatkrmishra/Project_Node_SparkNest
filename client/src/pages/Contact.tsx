// @ts-nocheck
import { Helmet } from "react-helmet-async";
import { useState } from "react";

import Modal from "./components/ui/Modal";
import { useAuth } from "../components/auth/AuthProvider";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MoveToEffect from "./components/effects/MoveToEffect";

import { sendMessage } from "../api/SERVICESAPI";

const Contact = () => {
  const { user } = useAuth();

  const [message, setMessage] = useState({
    name: user ? `${user.fname} ${user.lname}` : "",
    email: user?.email ?? "",
    message: "",
  });
  const [show, setShow] = useState(false);
  const [mssg, setMssg] = useState("");
  const [succeeded, setSucceeded] = useState(false);
  const [busy, setBusy] = useState(false);

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
    if (busy) return;

    setBusy(true);
    try {
      const response = await sendMessage(message);
      if (response.status === 200) {
        setSucceeded(true);
        setMssg(response.data.message || "Your message has been sent.");
        setShow(true);
        setMessage({ name: "", email: "", message: "" });
      }
    } catch (error) {
      setSucceeded(false);
      setMssg(
        error?.response?.data?.message ||
          "Your message could not be sent. Please try again or email us directly."
      );
      setShow(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact · SparkNest</title>
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
                      At SparkNest, we are committed to fostering meaningful connections with our
                      community. Whether you have feedback, suggestions, or just want to say hello,
                      we’re here to listen. Your input helps us grow and create better experiences
                      for everyone.
                    </p>
                    <p style={{ textAlign: "justify" }}>
                      We believe in open communication and value your thoughts. Feel free to reach
                      out for any inquiries, suggestions or collaborations. Our team is always ready
                      to assist and ensure your voice is heard. Simply fill out the form below, and
                      we’ll get back to you as soon as possible. Thank you for being a part of
                      SparkNest! We look forward to hearing from you.
                    </p>
                    <div className="row block-lg-one-half block-tab-whole entry__blocks">
                      <div className="column">
                        <h4>Contact Info</h4>
                        <p style={{ marginBottom: "8px" }}>
                          <b>Mail</b>:{" "}
                          <a href="mailto:mprabhat774@gmail.com">mprabhat774@gmail.com</a>
                          <br />
                          <b>Service</b>:{" "}
                          <a href="mailto:spark.nest.service@gmail.com">spark.nest.service@gmail.com</a>
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
                          <label className="u-screen-reader-text" htmlFor="cName">
                            Your name
                          </label>
                          <input
                            className="u-fullwidth"
                            id="cName"
                            name="name"
                            placeholder="Your Name"
                            type="text"
                            autoComplete="name"
                            value={message.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="column lg-6 tab-12 form-field">
                          <label className="u-screen-reader-text" htmlFor="cEmail">
                            Your email
                          </label>
                          <input
                            className="u-fullwidth"
                            id="cEmail"
                            name="email"
                            placeholder="Your Email"
                            type="email"
                            autoComplete="email"
                            value={message.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="column lg-12 message form-field">
                          <label className="u-screen-reader-text" htmlFor="cMessage">
                            Your message
                          </label>
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
                            value={busy ? "Sending…" : "Send Message"}
                            disabled={busy}
                          />
                        </div>
                      </fieldset>
                    </form>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <Modal
            open={show}
            onClose={() => setShow(false)}
            title={succeeded ? "Message sent" : "Message not sent"}
            footer={
              <button type="button" className="btn btn--primary" onClick={() => setShow(false)}>
                Close
              </button>
            }
          >
            <p>{mssg}</p>
          </Modal>
        </section>
        <Footer />
      </div>
      <MoveToEffect />
    </>
  );
};

export default Contact;
