// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import { api } from "../../api/API";
import { useAuth } from "../../components/auth/AuthProvider";

import MasonryEffect from "./effects/MasonryEffect";
import AnimateBricks from "./effects/AnimateBricks";
import NormalArticle from "./articles/NormalArticle";
import PaginationBlock from "./navigate/PaginationBlock";
import EmptyPreviews from "./profile/EmptyPreviews";
import logout from "../components/tools/auth";

const RenderPreviews = ({ url, type }) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const pageParam = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);
  const [hasArticles, setHasArticles] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessWD, setAccess] = useState(false);
  const bricksRef = useRef(null);
  const lastScrolledPage = useRef(pageParam);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await api.get(`${url}?page=${currentPage}&limit=12`, {
          signal: controller.signal,
        });
        if (!active) return;
        // Support both legacy {articles, totalPages} and new {success, data, meta}
        const articlesData = response.data.articles ?? response.data.data ?? [];
        const pages = response.data.totalPages ?? response.data.meta?.totalPages ?? 1;
        setArticles(articlesData);
        setTotalPages(pages);
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        if (error.response?.status === 403 || error.response?.status === 401) {
          logout();
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchArticles();

    if (type === 101) {
      setAccess(true);
    }

    return () => {
      active = false;
      controller.abort();
    };
  }, [currentPage, type, url]);

  useEffect(() => {
    setHasArticles(articles && articles.length > 0);
  }, [articles]);

  useEffect(() => {
    setCurrentPage(pageParam);
  }, [pageParam]);

  // If a stale URL points past the last available page, move to the last page.
  useEffect(() => {
    if (loading || totalPages < 1 || currentPage <= totalPages) return;

    const next = new URLSearchParams(searchParams);
    next.set("page", String(totalPages));
    setSearchParams(next);
    setCurrentPage(totalPages);
  }, [currentPage, loading, searchParams, setSearchParams, totalPages]);

  // Scroll to the start of the article grid once the requested page has loaded.
  useEffect(() => {
    if (loading || lastScrolledPage.current === currentPage) return;
    lastScrolledPage.current = currentPage;

    const frame = requestAnimationFrame(() => {
      document.getElementById("bricks")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [currentPage, loading]);

  const handlePageChange = (newPage) => {
    const safePage = Math.min(Math.max(1, Number(newPage) || 1), Math.max(1, totalPages));
    if (safePage === currentPage) return;

    setSearchParams((previousParams) => {
      const next = new URLSearchParams(previousParams);
      next.set("page", String(safePage));
      return next;
    });
    setCurrentPage(safePage);
  };

  return (
    <>
      <div id="bricks" className="bricks">
        <div className={`masonry ${!hasArticles ? "no-articles" : ""}`} ref={bricksRef}>
          <div className="bricks-wrapper" data-animate-block>
            <div className="grid-sizer"></div>
            {hasArticles ? (
              articles.map((article) => (
                <NormalArticle
                  key={article.preview_id}
                  articleId={article.article_id}
                  articlePreviewId={article.preview_id}
                  previewBy={article.preview_by}
                  previewImage={article.preview_images}
                  previewTitle={article.preview_title}
                  previewSubtitle={article.preview_subtitle}
                  categories={article.categories}
                  viewedBy={user ? user.id : null}
                  createdBy={article.creator_uid}
                  hasAccess={accessWD}
                  articles={articles}
                  setArticles={setArticles}
                />
              ))
            ) : loading ? (
              <p className="bricks-status" role="status">
                Loading articles…
              </p>
            ) : (
              <EmptyPreviews />
            )}
          </div>
        </div>
        {hasArticles && totalPages > 1 && (
          <PaginationBlock
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      {hasArticles && (
        <MasonryEffect
          key={`${currentPage}-${articles.length}-${articles[0]?.preview_id ?? "none"}`}
        />
      )}
      {hasArticles && <AnimateBricks />}
    </>
  );
};

RenderPreviews.propTypes = {
  url: PropTypes.string.isRequired,
  type: PropTypes.number.isRequired,
};

export default RenderPreviews;
