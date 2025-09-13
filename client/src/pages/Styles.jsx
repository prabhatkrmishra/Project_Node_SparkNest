import { Helmet } from "react-helmet";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AlertBoxes from "./components/effects/AlertBoxes";
import MoveToEffect from "./components/effects/MoveToEffect";

const Styles = () => {
  const codeString = `
    code {
      font-size: 1.4rem;
      margin: 0 .2rem;
      padding: .2rem .6rem;
      white-space: nowrap;
      background: #F1F1F1;
      border: 1px solid #E1E1E1;
      border-radius: 3px;
    }
  `;
  return (
    <>
      <Helmet>
        <title>Styles : SparkNest</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content s-content--page">
          <div className="row entry-wrap">
            <div className="column lg-12">
              <article className="entry">
                <header className="entry__header entry__header--narrower">
                  <h1 className="entry__title">Style Guide.</h1>
                </header>

                <div className="row">
                  <div className="column lg-12">
                    <p className="lead">
                      Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                      Donec libero. Suspendisse bibendum. Cras id urna. Morbi
                      tincidunt, orci ac convallis aliquam, lectus turpis varius
                      lorem, eu posuere nunc justo tempus leo. Donec mattis,
                      purus nec placerat bibendum. Aut magni nemo rerum iure
                      illo. Odit aperiam doloribus fuga qui architecto
                      consectetur rerum commodi. Quidem nihil molestiae
                      veritatis quis. Inventore non voluptatem ratione magni
                      nemo.
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="column lg-6 tab-12">
                    <h3>Paragraph and Image</h3>

                    <p>
                      <a href="#">
                        <img
                          width="120"
                          height="120"
                          className="u-pull-left"
                          alt="sample-image"
                          src="/images/sample-image.jpg"
                        />
                      </a>
                      Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                      Donec libero. Suspendisse bibendum.Cras id urna. Morbi
                      tincidunt, orci ac convallis aliquam, lectus turpis varius
                      lorem, eu posuere nunc justo tempus leo. Donec mattis,
                      purus nec placerat bibendum, dui pede condimentum odio, ac
                      blandit ante orci ut diam. Cras fringilla magna. Phasellus
                      suscipit, leo a pharetra condimentum, lorem tellus
                      eleifend magna, eget fringilla velit magna id neque
                      posuere nunc justo tempus leo.{" "}
                    </p>

                    <p>
                      Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                      Donec libero. Suspendisse bibendum. Cras id urna. Morbi
                      tincidunt, orci ac convallis aliquam, lectus turpis varius
                      lorem, eu posuere nunc justo tempus leo. Donec mattis,
                      purus nec placerat bibendum, dui pede condimentumodio, ac
                      blandit ante orci ut diam.
                    </p>

                    <p>
                      A <a href="#">link</a>,
                      <abbr title="this really isn't a very good description">
                        abbrebation
                      </abbr>
                      ,<strong>strong text</strong>,<em>em text</em>,
                      <del>deleted text</del>, and
                      <mark>this is a mark text.</mark>
                      <code>.code</code>
                    </p>
                  </div>

                  <div className="column lg-6 tab-12">
                    <h3>Drop Caps</h3>

                    <p className="drop-cap">
                      Far far away, behind the word mountains, far from the
                      countries Vokalia and Consonantia, there live the blind
                      texts. Separated they live in Bookmarksgrove right at the
                      coast of the Semantics, a large language ocean. A small
                      river named Duden flows by their place and supplies it
                      with the necessary regelialia. Morbi tincidunt, orci ac
                      convallis aliquam, lectus turpis varius lorem, euposuere
                      nunc justo tempus leo. Donec mattis, purus nec placerat
                      bibendum, dui pede condimentum odio, ac blandit ante orci
                      ut diam. Cras fringilla magna. Phasellus suscipit, leo a
                      pharetra condimentum, lorem tellus eleifend magna, eget
                      fringilla velit magna id neque.
                    </p>

                    <h3>Small Print</h3>

                    <p>
                      <small>
                        Lorem ipsum dolor sit amet, consectetuer adipiscing
                        elit. Donec libero.
                      </small>
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="column lg-6 tab-12">
                    <h3 className="u-add-bottom">Pull Quotes</h3>

                    <p>
                      Perspiciatis nemo unde et nobis modi consequatur officia
                      amet. Ut enim tenetur provident maiores. Perspiciatis
                      asperiores incidunt sequi quisquam. Enim aut.
                    </p>

                    <figure className="pull-quote">
                      <blockquote>
                        <p>
                          When you look in the eyes of grace, when you meet
                          grace, when you embrace grace, when you see the nail
                          prints in grace’s hands and the fire in his eyes, when
                          you feel his relentless love for you - it will not
                          motivate you to sin. It will motivate you to
                          righteousness.
                        </p>

                        <footer>
                          <cite>Judah Smith</cite>
                        </footer>
                      </blockquote>
                    </figure>
                  </div>

                  <div className="column lg-6 tab-12">
                    <h3 className="u-add-bottom">Block Quotes</h3>

                    <blockquote cite="http://where-i-got-my-info-from.com">
                      <p>
                        For God so loved the world, that he gave his only Son,
                        that whoever believes in him should not perish but have
                        eternal life. For God did not send his Son into the
                        world to condemn the world, but in order that the world
                        might be saved through him.
                      </p>

                      <footer>
                        <cite>
                          <a href="#0">John 3:16-17 ESV</a>
                        </cite>
                      </footer>
                    </blockquote>

                    <blockquote>
                      <p>
                        There is a God-shaped vacuum in the heart of each man
                        which cannot be satisfied by any created thing but only
                        by God the Creator.
                      </p>

                      <footer>
                        <cite>Blaise Pascal</cite>
                      </footer>
                    </blockquote>
                  </div>
                </div>

                <div className="row u-add-half-bottom">
                  <div className="column lg-6 tab-12">
                    <h3>Example Lists</h3>

                    <ol>
                      <li>Here is an example</li>
                      <li>of an ordered list.</li>
                      <li>
                        A parent list item.
                        <ul>
                          <li>one</li>
                          <li>two</li>
                          <li>three</li>
                        </ul>
                      </li>
                      <li>A list item.</li>
                    </ol>

                    <ul className="disc">
                      <li>Here is an example</li>
                      <li>of an unordered list.</li>
                    </ul>

                    <h3>Definition Lists</h3>

                    <h5>a) Multi-line Definitions (default) </h5>

                    <dl className="dictionary-style">
                      <dt>
                        <strong>This is a term</strong>
                      </dt>
                      <dd>
                        this is the definition of that term, which both live in
                        a <code>dl</code>.
                      </dd>
                      <dt>
                        <strong>Another Term</strong>
                      </dt>
                      <dd>And it gets a definition too, which is this line</dd>
                      <dd>
                        This is a 2<sup>nd</sup> definition for a single term. A{" "}
                        <code>dt</code> may be followed by multiple{" "}
                        <code>dd</code>s.
                      </dd>
                    </dl>

                    <h3 className="u-add-bottom">Skill Bars</h3>

                    <ul className="skill-bars">
                      <li>
                        <div className="progress percent90">
                          <span>90%</span>
                        </div>
                        <strong>HTML</strong>
                      </li>
                      <li>
                        <div className="progress percent85">
                          <span>85%</span>
                        </div>
                        <strong>CSS</strong>
                      </li>
                      <li>
                        <div className="progress percent70">
                          <span>70%</span>
                        </div>
                        <strong>Javascript</strong>
                      </li>
                      <li>
                        <div className="progress percent95">
                          <span>95%</span>
                        </div>
                        <strong>PHP</strong>
                      </li>
                      <li>
                        <div className="progress percent75">
                          <span>75%</span>
                        </div>
                        <strong>Illustrator</strong>
                      </li>
                      <li>
                        <div className="progress percent90">
                          <span>90%</span>
                        </div>
                        <strong>Figma</strong>
                      </li>
                    </ul>
                  </div>

                  <div className="column lg-6 tab-12">
                    <h3 className="u-add-bottom">Buttons</h3>
                    <p className="d-flex flex-column">
                      <a className="btn btn--primary u-fullwidth" href="#0">
                        Primary Button
                      </a>
                      <a className="btn u-fullwidth" href="#0">
                        Default Button
                      </a>
                      <a className="btn btn--stroke u-fullwidth" href="#0">
                        Stroke Button
                      </a>
                      <a className="btn btn--pill u-fullwidth" href="#0">
                        Pill Button
                      </a>
                      <a className="btn btn--pill-small u-halfwidth" href="#0">
                        Pill Button
                      </a>
                      <a className="btn btn--circle" href="#0">
                        <svg
                          width="16px"
                          height="16px"
                          viewBox="0 0 16 16"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          role="img"
                        >
                          <circle cx="2" cy="11" r="1.5" fill="currentColor"></circle>
                          <circle cx="14" cy="11" r="1.5" fill="currentColor"></circle>
                          <circle cx="8" cy="11" r="1.5" fill="currentColor"></circle>
                        </svg>
                      </a>
                    </p>

                    <h3>Stats Tabs</h3>
                    <ul className="stats-tabs">
                      <li>
                        <a href="#0">
                          1,234 <em>Peter</em>
                        </a>
                      </li>
                      <li>
                        <a href="#0">
                          567 <em>James</em>
                        </a>
                      </li>
                      <li>
                        <a href="#0">
                          23,456 <em>John</em>
                        </a>
                      </li>
                      <li>
                        <a href="#0">
                          3,456 <em>Andrew</em>
                        </a>
                      </li>
                      <li>
                        <a href="#0">
                          456 <em>Philip</em>
                        </a>
                      </li>
                      <li>
                        <a href="#0">
                          26 <em>Matthew</em>
                        </a>
                      </li>
                      <li>
                        <a href="#0">
                          777 <em>Prabhat</em>
                        </a>
                      </li>
                    </ul>

                    <h3 className="u-add-bottom">Code</h3>
                    <SyntaxHighlighter language="css" style={dracula}>
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                </div>

                <div className="row u-add-half-bottom">
                  <div className="column lg-6 tab-12">
                    <h1>
                      H1 Heading Doloremque dolor voluptas est sequi omnis.
                    </h1>
                    <p>
                      Doloremque dolor voluptas est sequi omnis. Pariatur ut
                      aut. Sed enim tempora qui veniam qui cum vel. Voluptas
                      odit at vitae minima. In assumenda ut. Voluptatem totam
                      impedit accusantium reiciendis excepturi aut qui accusamus
                      praesentium.
                    </p>

                    <h2>
                      H2 Heading Doloremque dolor voluptas est sequi omnis.
                    </h2>
                    <p>
                      Doloremque dolor voluptas est sequi omnis. Pariatur ut
                      aut. Sed enim tempora qui veniam qui cum vel. Voluptas
                      odit at vitae minima. In assumenda ut. Voluptatem totam
                      impedit accusantium reiciendis excepturi aut qui accusamus
                      praesentium.
                    </p>

                    <h3>
                      H3 Heading Doloremque dolor voluptas est sequi omnis.
                    </h3>
                    <p>
                      Doloremque dolor voluptas est sequi omnis. Pariatur ut
                      aut. Sed enim tempora qui veniam qui cum vel. Voluptas
                      odit at vitae minima. In assumenda ut. Voluptatem totam
                      impedit accusantium reiciendis excepturi aut qui accusamus
                      praesentium.
                    </p>
                  </div>

                  <div className="column lg-6 tab-12">
                    <h4>
                      H4 Heading Doloremque dolor voluptas est sequi omnis.
                    </h4>
                    <p>
                      Doloremque dolor voluptas est sequi omnis. Pariatur ut
                      aut. Sed enim tempora qui veniam qui cum vel. Voluptas
                      odit at vitae minima. In assumenda ut. Voluptatem totam
                      impedit accusantium reiciendis excepturi aut qui accusamus
                      praesentium.
                    </p>

                    <h5>
                      H5 Heading Doloremque dolor voluptas est sequi omnis.
                    </h5>
                    <p>
                      Doloremque dolor voluptas est sequi omnis. Pariatur ut
                      aut. Sed enim tempora qui veniam qui cum vel. Voluptas
                      odit at vitae minima. In assumenda ut. Voluptatem totam
                      impedit accusantium reiciendis excepturi aut qui accusamus
                      praesentium.
                    </p>

                    <h6>
                      H6 Heading Doloremque dolor voluptas est sequi omnis.
                    </h6>
                    <p>
                      Doloremque dolor voluptas est sequi omnis. Pariatur ut
                      aut. Sed enim tempora qui veniam qui cum vel. Voluptas
                      odit at vitae minima. In assumenda ut. Voluptatem totam
                      impedit accusantium reiciendis excepturi aut qui accusamus
                      praesentium.
                    </p>
                  </div>
                </div>

                <div className="row u-add-half-bottom">
                  <div className="column lg-6 tab-12">
                    <h3 className="u-add-bottom">Responsive Image</h3>

                    <figure>
                      <img
                        src="/images/wheel-500.jpg"
                        srcSet="/images/wheel-1000.jpg 1000w, /images/wheel-500.jpg 500w"
                        sizes="(max-width: 1000px) 100vw, 1000px"
                        alt="A descriptive alt text"
                      />
                      <figcaption>Here is some random picture.</figcaption>
                    </figure>
                  </div>

                  <div className="column lg-6 tab-12">
                    <h3 className="u-add-bottom">Responsive Video</h3>
                    <div className="video-container">
                      <iframe
                        src="https://player.vimeo.com/video/14592941?color=00a650&title=0&byline=0&portrait=0"
                        width="500"
                        height="281"
                        allowFullScreen
                        title="Responsive Video"
                      ></iframe>
                    </div>
                  </div>
                </div>

                <div className="row u-add-bottom">
                  <div className="column lg-12">
                    <h3>Tables</h3>
                    <p>
                      Be sure to use properly formed table markup with{" "}
                      <code>&lt;thead&gt;</code> and <code>&lt;tbody&gt;</code>{" "}
                      when building a <code>table</code>.
                    </p>

                    <div className="table-responsive">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Sex</th>
                            <th>Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>William J. Seymour</td>
                            <td>34</td>
                            <td>Male</td>
                            <td>Azusa Street</td>
                          </tr>
                          <tr>
                            <td>Jennie Evans Moore</td>
                            <td>30</td>
                            <td>Female</td>
                            <td>Azusa Street</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="column lg-12">
                    <h3>Pagination</h3>

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

                <div className="row">
                  <div className="column lg-6 tab-12">
                    <h3 className="u-add-bottom">Form Styles</h3>

                    <form>
                      <div>
                        <label htmlFor="sampleInput">Your email</label>
                        <input
                          className="u-fullwidth"
                          type="email"
                          placeholder="test@mailbox.com"
                          id="sampleInput"
                        />
                      </div>
                      <div>
                        <label htmlFor="sampleRecipientInput">
                          Reason for contacting
                        </label>
                        <div className="ss-custom-select">
                          <select
                            className="u-fullwidth"
                            id="sampleRecipientInput"
                          >
                            <option value="Option 1">Questions</option>
                            <option value="Option 2">Report</option>
                            <option value="Option 3">Others</option>
                          </select>
                        </div>
                      </div>

                      <label htmlFor="exampleMessage">Message</label>
                      <textarea
                        className="u-fullwidth"
                        placeholder="Your message"
                        id="exampleMessage"
                      ></textarea>

                      <label className="u-add-bottom">
                        <input type="checkbox" />
                        <span className="label-text">
                          Send a copy to yourself
                        </span>
                      </label>

                      <input
                        className="btn--primary u-fullwidth"
                        type="submit"
                        value="Submit"
                      />
                    </form>
                  </div>

                  <div className="column lg-6 tab-12">
                    <h3>Alert Boxes</h3>

                    <br />

                    <div className="alert-box alert-box--error">
                      <p>Error Message. Your Message Goes Here.</p>
                      <span className="alert-box__close"></span>
                    </div>

                    <div className="alert-box alert-box--success">
                      <p>Success Message. Your Message Goes Here.</p>
                      <span className="alert-box__close"></span>
                    </div>

                    <div className="alert-box alert-box--info">
                      <p>Info Message. Your Message Goes Here.</p>
                      <span className="alert-box__close"></span>
                    </div>

                    <div className="alert-box alert-box--notice">
                      <p>Notice Message. Your Message Goes Here.</p>
                      <span className="alert-box__close"></span>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="lg-12 column">
                    <h3>Grid Columns</h3>
                  </div>
                </div>

                <div className="row">
                  <div className="lg-4 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non, dolor.
                    </p>
                  </div>

                  <div className="lg-4 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non, dolor.
                    </p>
                  </div>

                  <div className="lg-4 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non, dolor.
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="lg-3 tab-6 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non, dolor.
                    </p>
                  </div>

                  <div className="lg-3 tab-6 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non, dolor.
                    </p>
                  </div>

                  <div className="lg-3 tab-6 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non, dolor.
                    </p>
                  </div>

                  <div className="lg-3 tab-6 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non, dolor.
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="lg-6 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non, dolor.
                    </p>
                  </div>

                  <div className="lg-6 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non, dolor.
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="lg-8 tab-7 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non, dolor.
                      Integer faucibus, eros ac molestie placerat, enim tellus
                      varius lacus, nec dictum nunc tortor id urna. Suspendisse
                      dapibus ullamcorper pede. Vivamus ligula ipsum, faucibus
                      at, tincidunt eget, porttitor non, dolor.
                    </p>
                  </div>

                  <div className="lg-4 tab-5 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non, dolor.
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="lg-3 tab-5 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at.
                    </p>
                  </div>

                  <div className="lg-9 tab-7 mob-12 column">
                    <p>
                      Cras aliquet. Integer faucibus, eros ac molestie placerat,
                      enim tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non,
                      dolor.Integer faucibus, eros ac molestie placerat, enim
                      tellus varius lacus, nec dictum nunc tortor id urna.
                      Suspendisse dapibus ullamcorper pede. Vivamus ligula
                      ipsum, faucibus at, tincidunt eget, porttitor non, dolor.
                      Integer faucibus, eros ac molestie placerat, enim tellus
                      varius lacus, nec dictum nunc tortor id urna. Suspendisse
                      dapibus ullamcorper pede. Vivamus ligula ipsum, faucibus
                      at, tincidunt eget, porttitor non, dolor.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
        <Footer />
      </div>
      <AlertBoxes />
      <MoveToEffect />
    </>
  );
};

export default Styles;
