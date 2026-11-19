// @ts-nocheck
import { useState, useEffect } from "react";

import Comment from "./Comment";
import CreateComment from "./CreateComment";
import Modal from "../ui/Modal";

import { fetchComments, dropComment } from "../../../api/COMMENTSAPI";
import { useAuth } from "../../../components/auth/AuthProvider";

const nestComments = (comments) => {
  const commentMap = {};
  const nested = [];

  comments.forEach((comment) => {
    comment.children = [];
    commentMap[comment.id] = comment;
  });

  comments.forEach((comment) => {
    if (comment.parent_comment_id) {
      const parent = commentMap[comment.parent_comment_id];
      if (parent) parent.children.push(comment);
    } else {
      nested.push(comment);
    }
  });

  return nested;
};

const countComments = (comments) => {
  let count = comments.length;
  comments.forEach((comment) => {
    if (comment.children?.length) count += countComments(comment.children);
  });
  return count;
};

const Comments = ({ articleId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [addComment, setAddComment] = useState(false);
  const [replyComment, setReplyComment] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [newComment, setNewComment] = useState({
    user_id: user?.id ?? "",
    parent_comment_id: null,
    name: user ? `${user.fname} ${user.lname}` : "",
    email: user?.email ?? "",
    body: "",
  });

  useEffect(() => {
    let active = true;
    const getComments = async () => {
      try {
        const response = await fetchComments(articleId);
        if (active && response.status === 200) {
          setComments(nestComments(Array.isArray(response.data) ? response.data : []));
        }
      } catch {
        if (active) setComments([]);
      }
    };
    void getComments();
    return () => {
      active = false;
    };
  }, [articleId]);

  const handleNewComment = (createdComment) => {
    setComments((current) => {
      if (!createdComment.parent_comment_id) return [...current, createdComment];

      const addToParent = (list) =>
        list.map((comment) => {
          if (comment.id === createdComment.parent_comment_id) {
            return { ...comment, children: [...(comment.children || []), createdComment] };
          }
          if (comment.children?.length) {
            return { ...comment, children: addToParent(comment.children) };
          }
          return comment;
        });

      return addToParent(current);
    });
  };

  const handleDeleteComment = (id) => {
    const removeComment = (list) =>
      list
        .filter((comment) => comment.id !== id)
        .map((comment) => ({
          ...comment,
          children: comment.children?.length ? removeComment(comment.children) : [],
        }));
    setComments((current) => removeComment(current));
  };

  const toggleAddComment = () => {
    setAddComment((value) => !value);
    setReplyComment(false);
    setNewComment((current) => ({ ...current, body: "", parent_comment_id: null }));
  };

  const handleReply = (parentId) => {
    setNewComment((current) => ({ ...current, parent_comment_id: parentId }));
    setAddComment(true);
    setReplyComment(true);
  };

  useEffect(() => {
    if (!replyComment) return;
    const timer = setTimeout(() => {
      document.getElementById("comment-box")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, [replyComment, addComment]);

  const handleDelete = async (commentId) => {
    setDeleteError("");
    try {
      const response = await dropComment(commentId);
      if (response.status === 200) {
        setDeleted(true);
        handleDeleteComment(commentId);
      }
    } catch (error) {
      setDeleteError(error?.response?.data?.message || "Could not delete this comment.");
    }
  };

  return (
    <div className="comments-wrap">
      <div id="comments">
        <div className="large-12">
          <h3>{countComments(comments)} Comments</h3>
          {deleteError && (
            <p className="form-status form-status--error" role="alert">
              {deleteError}
            </p>
          )}
          <ol className="commentlist">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                handleDelete={handleDelete}
                currentUser={user?.id ?? null}
              />
            ))}
          </ol>
        </div>
      </div>
      <div className="add-comment-div">
        <button
          type="button"
          className="btn btn--primary mb-2"
          onClick={toggleAddComment}
          aria-expanded={addComment}
          aria-controls="comment-box"
        >
          Create comment
        </button>
        {addComment && (
          <div id="comment-box" className="comment-form-panel">
            <div className="comment-form-panel__header">
              <h3>{replyComment ? "Reply to comment" : "Add Comment"}</h3>
              <button
                type="button"
                className="comment-form-panel__close"
                onClick={toggleAddComment}
                aria-label="Close comment form"
              >
                ×
              </button>
            </div>
            <CreateComment
              handleNewComment={handleNewComment}
              newComment={newComment}
              setNewComment={setNewComment}
              articleId={articleId}
              loggedin={Boolean(user)}
              toggleAddComment={toggleAddComment}
            />
          </div>
        )}
      </div>
      <Modal
        open={deleted}
        onClose={() => setDeleted(false)}
        title="Comment deleted"
        footer={
          <button type="button" className="btn btn--primary" onClick={() => setDeleted(false)}>
            Close
          </button>
        }
      >
        <p>Comment deleted from the comment section.</p>
      </Modal>
    </div>
  );
};

export default Comments;
