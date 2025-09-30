import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import axios from "axios";

import MasonryEffect from "./effects/MasonryEffect";
import AnimateBricks from "./effects/AnimateBricks";
import NormalArticle from "./articles/NormalArticle";
import PaginationBlock from "./navigate/PaginationBlock";
import EmptyPreviews from "./profile/EmptyPreviews";
import logout from "../components/tools/auth";

const RenderPreviews = ({ url, type }) => {
  const navigate = useNavigate();
  const login = Cookies.get("isLoggedIn") || null;
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  if (type != 100) {
    if (!login) {
      navigate("/session/new");
    }
    if (!user) {
      logout();
    }
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page")) || 1;
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [hasArticles, setHasArticles] = useState(false);
  const [accessWD, setAccess] = useState(false);
  const bricksRef = useRef(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setShouldAnimate(false);
        const response = await axios.get(
          `${url}?page=${currentPage}&limit=12`,
          { withCredentials: true }
        );
        setArticles(response.data.articles);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        if (error.response.status === 403) {
          logout();
        }
      }
    };

    fetchArticles();

    if (type === 101) {
      setAccess(true);
    }
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

  useEffect(() => {
    if (hasArticles) {
      const checkIfBricksLoaded = () => {
        const bricksContainer = bricksRef.current;
        if (bricksContainer) {
          const brickElements =
            bricksContainer.querySelectorAll(".brick.entry");
          if (brickElements.length === articles.length) {
            setShouldAnimate(true);
          }
        }
      };

      const timer = setTimeout(checkIfBricksLoaded, 50);
      return () => clearTimeout(timer);
    }
  }, [articles, hasArticles]);

  return (
    <>
      <div id="bricks" className="bricks">
        <div
          className={`masonry ${!hasArticles ? "no-articles" : ""}`}
          ref={bricksRef}
        >
          <div className="bricks-wrapper" data-animate-block>
            <div className="grid-sizer"></div>
            {hasArticles ? (
              articles.map((article, index) => (
                <NormalArticle
                  key={index}
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
      {shouldAnimate && <MasonryEffect />}
      {shouldAnimate && <AnimateBricks />}
    </>
  );
};

RenderPreviews.propTypes = {
  url: PropTypes.string.isRequired,
  type: PropTypes.number.isRequired,
};

export default RenderPreviews;
