// @ts-nocheck
import { useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { format } from "date-fns";

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
import Main from "./save_and_like/Main";
import Comments from "./comments/Comments";

window.katex = katex;

const StandardPost = () => {
  const { selector } = useParams();
  const [article, setArticle] = useState({});
  const [prevArticle, setPrevArticle] = useState({});
  const [nextArticle, setNextArticle] = useState({});
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchArticle = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const response = await viewArticle(selector);
        if (active && response.status === 200) {
          setArticle(response.data.article ?? {});
          setPrevArticle(response.data.prev ?? {});
          setNextArticle(response.data.next ?? {});
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error?.response?.status === 404
              ? "This article could not be found."
              : "This article could not be loaded. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchArticle();
    return () => {
      active = false;
    };
  }, [selector]);

  useEffect(() => {
    if (article.created_date) {
      const parsed = new Date(article.created_date);
      setDate(Number.isNaN(parsed.getTime()) ? "" : format(parsed, "MMMM d, yyyy"));
    }
  }, [article.created_date]);

  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const categories = Array.isArray(article.article_categories)
    ? article.article_categories.filter(Boolean)
    : [];

  useEffect(() => {
    if (!editorRef.current) return;
    if (!quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        readOnly: true,
        modules: {
          syntax: { hljs },
          toolbar: false,
        },
        theme: "snow",
      });
    }
    quillRef.current.root.innerHTML = article.article_body || "";
  }, [article.article_body]);

  return (
    <>
      <Helmet>
        <title>
          {article.article_title ? `${article.article_title} · SparkNest` : "Article · SparkNest"}
        </title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content s-content--blog">
          <div className="row entry-wrap">
            <div className="column lg-12">
              {loading && (
                <p className="bricks-status" role="status">
                  Loading article…
                </p>
              )}
              {!loading && loadError && (
                <div className="article-error">
                  <h1>Article unavailable</h1>
                  <p>{loadError}</p>
                  <a className="btn btn--primary" href="/">
                    Back to home
                  </a>
                </div>
              )}
              {!loading && !loadError && (
                <>
                  <article className="entry format-standard">
                    <header className="entry__header">
                      <h1 className="entry__title">{article.article_title}</h1>

                      <div className="entry__meta">
                        <div className="entry__meta-author">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
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
                          <a href={`/user/${article.username || article.user_id}`}>
                            {[article.fname, article.lname].filter(Boolean).join(" ")}
                          </a>
                        </div>
                        <div className="entry__meta-date">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <circle
                              cx="12"
                              cy="12"
                              r="7.25"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            ></circle>
                            <path stroke="currentColor" strokeWidth="1.5" d="M12 8V12L14 14"></path>
                          </svg>
                          {date}
                        </div>
                        {categories.length > 0 && (
                          <div className="entry__meta-cat">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
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

                            <span className="cat-links">
                              {categories.map((category, index) => (
                                <a
                                  key={`${category}-${index}`}
                                  href={`/category/${encodeURIComponent(category)}`}
                                >
                                  {category}
                                </a>
                              ))}
                            </span>
                          </div>
                        )}
                      </div>
                    </header>

                    {article.article_images && (
                      <div className="entry__media">
                        <figure className="featured-image">
                          <img
                            src={article.article_images[1] || article.article_images[0]}
                            srcSet={article.article_images
                              .map((src, index) => `${src} ${[600, 1200, 2400][index] || 600}w`)
                              .join(", ")}
                            sizes="(max-width: 2400px) 100vw, 2400px"
                            alt={article.article_title || ""}
                            onError={(event) => {
                              const image = event.currentTarget;
                              image.onerror = null;
                              image.removeAttribute("srcset");
                              image.removeAttribute("sizes");
                              image.src = "/images/sample-image.jpg";
                            }}
                          />
                        </figure>
                      </div>
                    )}

                    <div className="content-primary">
                      <div className="entry__content">
                        <div className="ql-viewer" id="editor" ref={editorRef}></div>

                        <div className="tags-save-like">
                          {categories.length > 0 && (
                            <p className="entry__tags">
                              <strong>Tags:</strong>
                              <span className="entry__tag-list">
                                {categories.map((category, index) => (
                                  <a key={index} href={`/category/${encodeURIComponent(category)}`}>
                                    {category}
                                  </a>
                                ))}
                              </span>
                            </p>
                          )}
                          <Main articleId={selector} />
                        </div>

                        <div className="entry__author-box customize-author-box">
                          <figure className="entry__author-avatar customize-article-avatar">
                            <img
                              alt={
                                article.fname
                                  ? `${article.fname} ${article.lname}'s avatar`
                                  : "Author avatar"
                              }
                              src={article.avatar || "/images/sample-image.jpg"}
                              className="avatar"
                              onError={(event) => {
                                const image = event.currentTarget;
                                image.onerror = null;
                                image.src = "/images/sample-image.jpg";
                              }}
                            />
                          </figure>
                          <div className="entry__author-info customize-author-info">
                            <h5 className="entry__author-name">
                              <a href={`/user/${article.username || article.user_id || ""}`}>
                                {article.fname ? `${article.fname} ${article.lname}` : "No Name"}
                              </a>
                            </h5>
                            <p>{article.bio ? article.bio : "No Bio"}</p>
                          </div>
                        </div>
                      </div>

                      {(prevArticle.id || nextArticle.id) && (
                        <div
                          className={`post-nav${
                            !prevArticle.id || !nextArticle.id ? " post-nav--one-sided" : ""
                          }`}
                        >
                          {prevArticle.id && (
                            <div className="post-nav__prev">
                              <a href={`/article/view/${prevArticle.id}`} rel="prev">
                                <span>Prev</span>
                                {prevArticle.title || "Previous article"}
                              </a>
                            </div>
                          )}
                          {nextArticle.id && (
                            <div className="post-nav__next">
                              <a href={`/article/view/${nextArticle.id}`} rel="next">
                                <span>Next</span>
                                {nextArticle.title || "Next article"}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </article>

                  <Comments articleId={selector} />
                </>
              )}
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
