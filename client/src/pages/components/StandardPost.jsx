import { useRef } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import katex from "katex";
import "katex/dist/katex.min.css";

import { viewArticle } from "../../api/API";

import PreLoader from "./PreLoader";
import Header from "./Header";
import Footer from "./Footer";
import MoveToEffect from "./effects/MoveToEffect";

window.katex = katex;

const StandardPost = () => {
  const { selector } = useParams();
  const [article, setArticle] = useState({});
  const [prevArticle, setPrevArticle] = useState({});
  const [nextArticle, setNextArticle] = useState({});
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      const response = await viewArticle(selector);
      try {
        if (response.status == 200) {
          setArticle(response.data.article);
          setPrevArticle(response.data.prev);
          setNextArticle(response.data.next);
        }
      } catch (error) {
        if (error.response.status) {
          alert("Error: " + error.response.status);
        }
      }
    };

    fetchArticle();
    setDate(article.created_date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector]);

  useEffect(() => {
    if (article.created_date) {
      const modDate = format(new Date(article.created_date), "MMMM dd, yyyy");
      setDate(modDate);
    }
  }, [article.created_date]);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    const quill = new Quill(editorRef.current, {
      readOnly: true,
      modules: {
        syntax: { hljs },
        toolbar: false,
      },
      theme: "snow",
    });

    quillRef.current = quill;
    quillRef.current.root.innerHTML = article.article_body;
  }, [article]);

  return (
    <>
      <Helmet>
        <title>Article : SparkNest</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content s-content--blog">
          <div className="row entry-wrap">
            <div className="column lg-12">
              <article className="entry format-standard">
                <header className="entry__header">
                  <h1 className="entry__title">{article.article_title}</h1>

                  <div className="entry__meta">
                    <div className="entry__meta-author">
                      <svg
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="8"
                          r="3.25"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                        ></circle>
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M6.8475 19.25H17.1525C18.2944 19.25 19.174 18.2681 18.6408 17.2584C17.8563 15.7731 16.068 14 12 14C7.93201 14 6.14367 15.7731 5.35924 17.2584C4.82597 18.2681 5.70558 19.25 6.8475 19.25Z"
                        ></path>
                      </svg>
                      <a href="#">{article.fname + " " + article.lname}</a>
                    </div>
                    <div className="entry__meta-date">
                      <svg
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="7.25"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        ></circle>
                        <path
                          stroke="currentColor"
                          strokeWidth="1.5"
                          d="M12 8V12L14 14"
                        ></path>
                      </svg>
                      {date}
                    </div>
                    <div className="entry__meta-cat">
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
                          d="M19.25 17.25V9.75C19.25 8.64543 18.3546 7.75 17.25 7.75H4.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25Z"
                        ></path>
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M13.5 7.5L12.5685 5.7923C12.2181 5.14977 11.5446 4.75 10.8127 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V11"
                        ></path>
                      </svg>

                      {article.article_categories && (
                        <span className="cat-links">
                          {article.article_categories[0] && (
                            <a
                              href={`/category/${article.article_categories[0]}`}
                            >
                              {article.article_categories[0]}
                            </a>
                          )}
                          {article.article_categories[0] && (
                            <a
                              href={`/category/${article.article_categories[1]}`}
                            >
                              {article.article_categories &&
                                article.article_categories[1]}
                            </a>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </header>

                { article.article_images && <div className="entry__media">
                  <figure className="featured-image">
                    <img
                      src={`${article.article_images[1]}`}
                      srcSet={`${article.article_images[2]} 2400w,
                                              ${article.article_images[1]} 1200w, 
                                              ${article.article_images[0]} 600w`}
                      sizes="(max-width: 2400px) 100vw, 2400px"
                      alt=""
                    />
                  </figure>
                </div> }

                <div className="content-primary">
                  <div className="entry__content">
                    <div className="ql-viewer" id="editor" ref={editorRef}></div>

                    {article.article_categories && (
                      <p className="entry__tags">
                        <strong>Tags:</strong>
                        <span className="entry__tag-list">
                          {article.article_categories.map((category, index) => (
                            <a key={index} href={`/category/${category}`}>
                              {category}
                            </a>
                          ))}
                        </span>
                      </p>
                    )}

                    <div className="entry__author-box">
                      <figure className="entry__author-avatar">
                        <img
                          alt=""
                          src="/images/avatars/user-06.jpg"
                          className="avatar"
                        />
                      </figure>
                      <div className="entry__author-info">
                        <h5 className="entry__author-name">
                          <a href="#">
                            {article.fname
                              ? article.fname + " " + article.lname
                              : "No Name"}
                          </a>
                        </h5>
                        <p>{article.bio ? article.bio : "No Bio"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="post-nav">
                    <div className="post-nav__prev">
                      {prevArticle.id && (
                        <a
                          href={
                            prevArticle.id
                              ? `/article/view/${prevArticle.id}`
                              : "#"
                          }
                          rel="prev"
                        >
                          <span>Prev</span>
                          {prevArticle.title
                            ? prevArticle.title
                            : "No Previous article"}
                        </a>
                      )}
                    </div>
                    <div className="post-nav__next">
                      {nextArticle.id && (
                        <a
                          href={
                            nextArticle.id
                              ? `/article/view/${nextArticle.id}`
                              : "#"
                          }
                          rel="next"
                        >
                          <span>Next</span>
                          {nextArticle.title
                            ? nextArticle.title
                            : "No Next article"}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>

              <div className="comments-wrap">
                <div id="comments">
                  <div className="large-12">
                    <h3>5 Comments</h3>

                    <ol className="commentlist">
                      <li className="depth-1 comment">
                        <div className="comment__avatar">
                          <img
                            className="avatar"
                            src="/images/avatars/user-01.jpg"
                            alt=""
                            width="50"
                            height="50"
                          />
                        </div>

                        <div className="comment__content">
                          <div className="comment__info">
                            <div className="comment__author">Itachi Uchiha</div>

                            <div className="comment__meta">
                              <div className="comment__time">Aug 15, 2021</div>
                              <div className="comment__reply">
                                <a className="comment-reply-link" href="#0">
                                  Reply
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="comment__text">
                            <p>
                              Adhuc quaerendum est ne, vis ut harum tantas
                              noluisse, id suas iisque mei. Nec te inani
                              ponderum vulputate, facilisi expetenda has et.
                              Iudico dictas scriptorem an vim, ei alia mentitum
                              est, ne has voluptua praesent.
                            </p>
                          </div>
                        </div>
                      </li>

                      <li className="thread-alt depth-1 comment">
                        <div className="comment__avatar">
                          <img
                            className="avatar"
                            src="/images/avatars/user-04.jpg"
                            alt=""
                            width="50"
                            height="50"
                          />
                        </div>

                        <div className="comment__content">
                          <div className="comment__info">
                            <div className="comment__author">John Doe</div>

                            <div className="comment__meta">
                              <div className="comment__time">Aug 14, 2021</div>
                              <div className="comment__reply">
                                <a className="comment-reply-link" href="#0">
                                  Reply
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="comment__text">
                            <p>
                              Sumo euismod dissentiunt ne sit, ad eos iudico
                              qualisque adversarium, tota falli et mei. Esse
                              euismod urbanitas ut sed, et duo scaevola pericula
                              splendide. Primis veritus contentiones nec ad, nec
                              et tantas semper delicatissimi.
                            </p>
                          </div>
                        </div>

                        <ul className="children">
                          <li className="depth-2 comment">
                            <div className="comment__avatar">
                              <img
                                className="avatar"
                                src="/images/avatars/user-03.jpg"
                                alt=""
                                width="50"
                                height="50"
                              />
                            </div>

                            <div className="comment__content">
                              <div className="comment__info">
                                <div className="comment__author">
                                  Kakashi Hatake
                                </div>

                                <div className="comment__meta">
                                  <div className="comment__time">
                                    Aug 14, 2021
                                  </div>
                                  <div className="comment__reply">
                                    <a className="comment-reply-link" href="#0">
                                      Reply
                                    </a>
                                  </div>
                                </div>
                              </div>

                              <div className="comment__text">
                                <p>
                                  Duis sed odio sit amet nibh vulputate cursus a
                                  sit amet mauris. Morbi accumsan ipsum velit.
                                  Duis sed odio sit amet nibh vulputate cursus a
                                  sit amet mauris
                                </p>
                              </div>
                            </div>

                            <ul className="children">
                              <li className="depth-3 comment">
                                <div className="comment__avatar">
                                  <img
                                    className="avatar"
                                    src="/images/avatars/user-04.jpg"
                                    alt=""
                                    width="50"
                                    height="50"
                                  />
                                </div>

                                <div className="comment__content">
                                  <div className="comment__info">
                                    <div className="comment__author">
                                      John Doe
                                    </div>

                                    <div className="comment__meta">
                                      <div className="comment__time">
                                        Aug 14, 2021
                                      </div>
                                      <div className="comment__reply">
                                        <a
                                          className="comment-reply-link"
                                          href="#0"
                                        >
                                          Reply
                                        </a>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="comment__text">
                                    <p>
                                      Investigationes demonstraverunt lectores
                                      legere me lius quod ii legunt saepius.
                                      Claritas est etiam processus dynamicus,
                                      qui sequitur mutationem consuetudium
                                      lectorum.
                                    </p>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>

                      <li className="depth-1 comment">
                        <div className="comment__avatar">
                          <img
                            className="avatar"
                            src="/images/avatars/user-02.jpg"
                            alt=""
                            width="50"
                            height="50"
                          />
                        </div>

                        <div className="comment__content">
                          <div className="comment__info">
                            <div className="comment__author">
                              Shikamaru Nara
                            </div>

                            <div className="comment__meta">
                              <div className="comment__time">Aug 13, 2021</div>
                              <div className="comment__reply">
                                <a className="comment-reply-link" href="#0">
                                  Reply
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="comment__text">
                            <p>
                              Typi non habent claritatem insitam; est usus
                              legentis in iis qui facit eorum claritatem.
                            </p>
                          </div>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="comment-respond">
                  <div id="respond">
                    <h3>
                      Add Comment
                      <span>Your email address will not be published.</span>
                    </h3>

                    <form
                      name="contactForm"
                      id="contactForm"
                      method="post"
                      action=""
                      autoComplete="off"
                    >
                      <fieldset className="row">
                        <div className="column lg-6 tab-12 form-field">
                          <input
                            name="cName"
                            id="cName"
                            className="u-fullwidth h-remove-bottom"
                            placeholder="Your Name"
                            defaultValue=""
                            type="text"
                          />
                        </div>

                        <div className="column lg-6 tab-12 form-field">
                          <input
                            name="cEmail"
                            id="cEmail"
                            className="u-fullwidth h-remove-bottom"
                            placeholder="Your Email"
                            defaultValue=""
                            type="text"
                          />
                        </div>

                        <div className="column lg-12 form-field">
                          <input
                            name="cWebsite"
                            id="cWebsite"
                            className="u-fullwidth h-remove-bottom"
                            placeholder="Website"
                            defaultValue=""
                            type="text"
                          />
                        </div>

                        <div className="column lg-12 message form-field">
                          <textarea
                            name="cMessage"
                            id="cMessage"
                            className="u-fullwidth"
                            placeholder="Your Message"
                          ></textarea>
                        </div>

                        <div className="column lg-12">
                          <input
                            name="submit"
                            id="submit"
                            className="btn btn--primary btn-wide btn--large u-fullwidth"
                            value="Add Comment"
                            type="submit"
                          />
                        </div>
                      </fieldset>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
      <MoveToEffect />
    </>
  );
};

export default StandardPost;
