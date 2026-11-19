// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "../ui/Modal";
import { createComment } from "../../../api/COMMENTSAPI";

const CreateComment = (prop) => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!prop.loggedin) {
      setShowLogin(true);
      return;
    }

    if (!prop.newComment.body?.trim()) {
      setError("Write a comment before submitting.");
      return;
    }

    if (!prop.newComment.name || !prop.newComment.email) {
      setShowLogin(true);
      return;
    }

    setBusy(true);
    try {
      const response = await createComment(prop.articleId, prop.newComment);
      prop.handleNewComment(response.data);
      prop.toggleAddComment(false);
      prop.setNewComment({
        ...prop.newComment,
        body: "",
        parent_comment_id: null,
      });
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setShowLogin(true);
      } else {
        setError(err?.response?.data?.message || "Could not post your comment. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="comment-respond">
      <div id="respond">
        <form name="contactForm" id="contactForm" onSubmit={handleSubmit} autoComplete="off">
          <fieldset className="row">
            <div className="column lg-12 message form-field">
              <label className="u-screen-reader-text" htmlFor="cMessage">
                Comment
              </label>
              <textarea
                name="body"
                id="cMessage"
                className="u-fullwidth"
                placeholder="Type your comment..."
                value={prop.newComment.body || ""}
                onChange={(e) => prop.setNewComment({ ...prop.newComment, body: e.target.value })}
                required
              />
            </div>
            {error && (
              <div className="column lg-12">
                <p className="form-status form-status--error" role="alert">
                  {error}
                </p>
              </div>
            )}
            <div className="column lg-12">
              <input
                name="submit"
                id="submit"
                className="btn btn--primary btn-wide btn--large u-fullwidth"
                value={busy ? "Posting…" : "Add Comment"}
                type="submit"
                disabled={busy}
              />
            </div>
          </fieldset>
        </form>
      </div>
      <Modal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        title="Log in to comment"
        footer={
          <>
            <button type="button" className="btn" onClick={() => setShowLogin(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate("/session/new")}
            >
              Log in / Sign up
            </button>
          </>
        }
      >
        <p>For adding a comment you have to log in or sign up.</p>
      </Modal>
    </div>
  );
};

export default CreateComment;
