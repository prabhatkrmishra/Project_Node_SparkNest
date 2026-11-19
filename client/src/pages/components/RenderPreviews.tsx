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
  const pageParam = parseInt(searchParams.get("page")) || 1;
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);
  const [hasArticles, setHasArticles] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessWD, setAccess] = useState(false);
  const bricksRef = useRef(null);

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

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
    setCurrentPage(newPage);
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
        {articles && articles.length > 0 && (
          <PaginationBlock
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      {hasArticles && <MasonryEffect />}
      {hasArticles && <AnimateBricks />}
    </>
  );
};

RenderPreviews.propTypes = {
  url: PropTypes.string.isRequired,
  type: PropTypes.number.isRequired,
};

export default RenderPreviews;
