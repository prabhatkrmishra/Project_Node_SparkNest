import { useState } from "react";
import { Subscription } from "../../api/API";

import ScrollUp from "./navigate/ScrollUp";

const Footer = () => {
  const [email, setEmail] = useState("");
  const subscribeNewsletter = {};

  const handleEmail = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    subscribeNewsletter.email = email;
    subscribeNewsletter.type = "newsletter";
    const response = await Subscription(subscribeNewsletter);
    if (response.status === 200) {
      setEmail("");
      alert("Subscribed newsletter !");
    }
  };

  return (
    <footer id="colophon" className="s-footer">
      <div className="row s-footer__subscribe">
        <div className="column lg-12">
          <h2>Subscribe to Our Newsletter.</h2>
          <p>Subscribe now to get all latest updates</p>

          <form id="mc-form" className="mc-form">
            <input
              type="email"
              name="EMAIL"
              id="mce-EMAIL"
              value={email}
              className="u-fullwidth text-center"
              placeholder="Your Email Address"
              title="The domain portion of the email address is invalid (the portion after the @)."
              pattern="^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*(\.\w{2,})+$"
              required
              onChange={handleEmail}
            />
            <input
              type="submit"
              value="Subscribe"
              className="btn--small btn--primary u-fullwidth"
              onClick={handleSubmit}
            />
            <div className="mc-status"></div>
          </form>
        </div>
      </div>

      <div className="row s-footer__main">
        <div className="column lg-5 md-6 tab-12 s-footer__about">
          <h4>SparkNest</h4>
          <p>
            SparkNest serves as a haven for human narratives and ideas. It
            empowers anyone to share their insights and knowledge with the
            world—no need to build a mailing list or cultivate a following
            beforehand.
          </p>
        </div>

        <div className="column lg-5 md-6 tab-12">
          <div className="row">
            <div className="column lg-6">
              <h4>Categories</h4>
              <ul className="link-list">
                <li>
                  <a href="/category/lifestyle">Lifestyle</a>
                </li>
                <li>
                  <a href="/category/workplace">Workplace</a>
                </li>
                <li>
                  <a href="/category/inspiration">Inspiration</a>
                </li>
                <li>
                  <a href="/category/design">Design</a>
                </li>
                <li>
                  <a href="/category/health">Health</a>
                </li>
                <li>
                  <a href="/category/photography">Photography</a>
                </li>
              </ul>
            </div>
            <div className="column lg-6">
              <h4>Site Links</h4>
              <ul className="link-list">
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/category/health">Categories</a>
                </li>
                <li>
                  <a href="/about">About</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
                <li>
                  <a href="/styles">Terms & Policy</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row s-footer__bottom">
        <div className="column lg-7 md-6 tab-12">
          <ul className="s-footer__social">
            <li>
              <a href="https://www.facebook.com/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                >
                  <path d="M15,3C8.373,3,3,8.373,3,15c0,6.016,4.432,10.984,10.206,11.852V18.18h-2.969v-3.154h2.969v-2.099c0-3.475,1.693-5,4.581-5 c1.383,0,2.115,0.103,2.461,0.149v2.753h-1.97c-1.226,0-1.654,1.163-1.654,2.473v1.724h3.593L19.73,18.18h-3.106v8.697 C22.481,26.083,27,21.075,27,15C27,8.373,21.627,3,15,3z"></path>
                </svg>
                <span className="u-screen-reader-text">Facebook</span>
              </a>
            </li>
            <li>
              <a href="https://www.x.com/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                >
                  <path d="M10.053,7.988l5.631,8.024h-1.497L8.566,7.988H10.053z M21,7v10	c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V7c0-2.209,1.791-4,4-4h10C19.209,3,21,4.791,21,7z M17.538,17l-4.186-5.99L16.774,7	h-1.311l-2.704,3.16L10.552,7H6.702l3.941,5.633L6.906,17h1.333l3.001-3.516L13.698,17H17.538z"></path>
                </svg>
                <span className="u-screen-reader-text">X</span>
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                >
                  <path d="M 8 3 C 5.239 3 3 5.239 3 8 L 3 16 C 3 18.761 5.239 21 8 21 L 16 21 C 18.761 21 21 18.761 21 16 L 21 8 C 21 5.239 18.761 3 16 3 L 8 3 z M 18 5 C 18.552 5 19 5.448 19 6 C 19 6.552 18.552 7 18 7 C 17.448 7 17 6.552 17 6 C 17 5.448 17.448 5 18 5 z M 12 7 C 14.761 7 17 9.239 17 12 C 17 14.761 14.761 17 12 17 C 9.239 17 7 14.761 7 12 C 7 9.239 9.239 7 12 7 z M 12 9 A 3 3 0 0 0 9 12 A 3 3 0 0 0 12 15 A 3 3 0 0 0 15 12 A 3 3 0 0 0 12 9 z"></path>
                </svg>
                <span className="u-screen-reader-text">Instagram</span>
              </a>
            </li>
            <li>
              <a href="https://www.pinterest.com/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                >
                  <path d="M12,2C6.477,2,2,6.477,2,12c0,4.237,2.636,7.855,6.356,9.312c-0.087-0.791-0.167-2.005,0.035-2.868 c0.182-0.78,1.172-4.971,1.172-4.971s-0.299-0.599-0.299-1.484c0-1.391,0.806-2.428,1.809-2.428c0.853,0,1.265,0.641,1.265,1.408 c0,0.858-0.546,2.141-0.828,3.329c-0.236,0.996,0.499,1.807,1.481,1.807c1.777,0,3.143-1.874,3.143-4.579 c0-2.394-1.72-4.068-4.177-4.068c-2.845,0-4.515,2.134-4.515,4.34c0,0.859,0.331,1.781,0.744,2.282 c0.082,0.099,0.093,0.186,0.069,0.287c-0.076,0.316-0.244,0.995-0.277,1.134c-0.043,0.183-0.145,0.222-0.334,0.133 c-1.249-0.582-2.03-2.408-2.03-3.874c0-3.154,2.292-6.052,6.608-6.052c3.469,0,6.165,2.472,6.165,5.776 c0,3.447-2.173,6.22-5.189,6.22c-1.013,0-1.966-0.527-2.292-1.148c0,0-0.502,1.909-0.623,2.378 c-0.226,0.868-0.835,1.958-1.243,2.622C9.975,21.843,10.969,22,12,22c5.522,0,10-4.478,10-10S17.523,2,12,2z"></path>
                </svg>
                <span className="u-screen-reader-text">Pinterest</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="column lg-5 md-6 tab-12">
          <div className="s-footer__copyright">
            <span>&copy; {new Date().getFullYear()} SparkNest</span>
          </div>
        </div>
      </div>

      <ScrollUp />
    </footer>
  );
};

export default Footer;
