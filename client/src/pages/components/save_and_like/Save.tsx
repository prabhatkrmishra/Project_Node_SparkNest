// @ts-nocheck
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { checkSavedArticle, saveArticleUser, unsaveArticleUser } from "../../../api/ARTICLESAPI";
import { useAuth } from "../../../components/auth/AuthProvider";

const Save = ({ articleId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const user_id = user?.id ?? "";
  const article_id = articleId ?? "";

  useEffect(() => {
    let active = true;
    const checkSaved = async () => {
      if (!user_id || !article_id) return;
      try {
        const response = await checkSavedArticle(user_id, article_id);
        if (active && response.status === 200) setSaved(Boolean(response.data.saved));
      } catch {
        // A failed state check should not block reading the article.
      }
    };
    void checkSaved();
    return () => {
      active = false;
    };
  }, [article_id, user_id]);

  const toggleSaved = async () => {
    if (!user_id) {
      navigate("/session/new", { state: { from: location.pathname } });
      return;
    }
    if (!article_id || busy) return;

    setBusy(true);
    setError("");
    const data = { user_id, article_id };
    try {
      const response = saved ? await unsaveArticleUser(data) : await saveArticleUser(data);
      if (response.status === 200) setSaved((value) => !value);
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/session/new", { state: { from: location.pathname } });
      } else {
        setError("Could not update saved state.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`save-like__button ${saved ? "is-active" : ""}`}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved articles" : "Save article"}
      title={saved ? "Remove from saved articles" : "Save article"}
      onClick={toggleSaved}
      disabled={busy}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6.5 4.75h11a1 1 0 0 1 1 1v14.5l-6.5-4.2-6.5 4.2V5.75a1 1 0 0 1 1-1Z"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <span>{saved ? "Saved" : "Save"}</span>
      {error && <span className="u-screen-reader-text">{error}</span>}
    </button>
  );
};

export default Save;
