// @ts-nocheck
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { checkLikedArticle, likeArticleUser, unlikeArticleUser } from "../../../api/ARTICLESAPI";
import { useAuth } from "../../../components/auth/AuthProvider";

const Like = ({ articleId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const user_id = user?.id ?? "";
  const article_id = articleId ?? "";

  useEffect(() => {
    let active = true;
    const checkLiked = async () => {
      if (!user_id || !article_id) return;
      try {
        const response = await checkLikedArticle(user_id, article_id);
        if (active && response.status === 200) setLiked(Boolean(response.data.liked));
      } catch {
        // A failed state check should not block reading the article.
      }
    };
    void checkLiked();
    return () => {
      active = false;
    };
  }, [article_id, user_id]);

  const toggleLiked = async () => {
    if (!user_id) {
      navigate("/session/new", { state: { from: location.pathname } });
      return;
    }
    if (!article_id || busy) return;

    setBusy(true);
    setError("");
    const data = { user_id, article_id };
    try {
      const response = liked ? await unlikeArticleUser(data) : await likeArticleUser(data);
      if (response.status === 200) setLiked((value) => !value);
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/session/new", { state: { from: location.pathname } });
      } else {
        setError("Could not update like state.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`save-like__button ${liked ? "is-active" : ""}`}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this article" : "Like this article"}
      title={liked ? "Unlike this article" : "Like this article"}
      onClick={toggleLiked}
      disabled={busy}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 20s-7.25-4.5-7.25-9.5A4.25 4.25 0 0 1 12 7.6a4.25 4.25 0 0 1 7.25 2.9C19.25 15.5 12 20 12 20Z"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <span>{liked ? "Liked" : "Like"}</span>
      {error && <span className="u-screen-reader-text">{error}</span>}
    </button>
  );
};

export default Like;
