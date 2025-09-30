import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";
import Fade from "react-bootstrap/Fade";
import Modal from "react-bootstrap/Modal";

import Comment from "./Comment";
import CreateComment from "./CreateComment";

import { fetchComments, dropComment } from "../../../api/COMMENTSAPI";

// eslint-disable-next-line react/prop-types
function DeleteModel(prop) {
  return (
    <Modal
      {...prop}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body className="delete-modal-body">
        <p className="delete-modal-p">Comment deleted from comment section.</p>
      </Modal.Body>
      <Modal.Footer className="delete-modal-footer">
        <Button onClick={prop.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

// eslint-disable-next-line react/prop-types
const Comments = ({ articleId }) => {
  const loggedin = useRef(false);
  const login = Cookies.get("isLoggedIn") || null;
  if (login) {
    loggedin.current = true;
  }
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

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
        if (parent) {
          parent.children.push(comment);
        }
      } else {
        nested.push(comment);
      }
    });

    return nested;
  };

  const handleNewComment = (newComment) => {
    const updatedComments = [...comments];
    if (newComment.parent_comment_id) {
      const addCommentToParent = (commentList) => {
        for (let comment of commentList) {
          if (comment.id === newComment.parent_comment_id) {
            comment.children = [...(comment.children || []), newComment];
            return;
          }
          if (comment.children && comment.children.length > 0) {
            addCommentToParent(comment.children);
          }
        }
      };

      addCommentToParent(updatedComments);
    } else {
      updatedComments.push(newComment);
    }

    setComments(updatedComments);
  };

  const handleDeleteComment = (id) => {
    const updatedComments = [...comments];

    const removeComment = (commentList) => {
      return commentList.filter((comment) => {
        if (comment.id === id) {
          return false;
        }

        if (comment.children && comment.children.length > 0) {
          comment.children = removeComment(comment.children);
        }

        return true;
      });
    };

    const newComments = removeComment(updatedComments);
    setComments(newComments);
  };

  const getTotalCommentCount = (comments) => {
    let count = comments.length;
    comments.forEach((comment) => {
      if (comment.children && comment.children.length > 0) {
        count += getTotalCommentCount(comment.children);
      }
    });
    return count;
  };

  const [addComment, setAddComment] = useState(false);
  const toggleAddComment = () => setAddComment(!addComment);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    user_id: user ? user.id : "",
    parent_comment_id: null,
    name: user ? user.fname + " " + user.lname : "",
    email: user ? user.email : "",
    body: "",
  });

  useEffect(() => {
    const getComments = async () => {
      try {
        const response = await fetchComments(articleId);
        if (response.status == 200) {
          const fetchedComments = Array.isArray(response.data)
            ? response.data
            : [];
          const nested = nestComments(fetchedComments);
          setComments(nested);
        }
      } catch (error) {
        console.log(error);
        setComments([]);
      }
    };
    getComments();
  }, [articleId]);

  const handleReply = (parentId) => {
    setNewComment({ ...newComment, parent_comment_id: parentId });
    setAddComment(true);
  };

  const [deleted, setDeleted] = useState(false);
  const handleDelete = (commentId) => {
    const deleteComment = async (commentId) => {
      try {
        const response = await dropComment(commentId);
        if (response.status == 200) {
          setDeleted(true);
          handleDeleteComment(commentId);
        }
      } catch (error) {
        console.log(error.response);
      }
    };
    deleteComment(commentId);
  };

  return (
    <div className="comments-wrap">
      <div id="comments">
        <div className="large-12">
          <h3>{comments && getTotalCommentCount(comments)} Comments</h3>
          <ol className="commentlist">
            {comments.length > 0 &&
              comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  handleDelete={handleDelete}
                  currentUser={user ? user.id : null}
                />
              ))}
          </ol>
        </div>
      </div>
      <div className="add-comment-div">
        <Button onClick={toggleAddComment} className="mb-2">
          Create <strong>comment</strong>
        </Button>
        <Toast
          animation={true}
          transition={Fade}
          show={addComment}
          onClose={toggleAddComment}
        >
          <Toast.Header>
            <div>
              <h3>Add Comment</h3>
            </div>
          </Toast.Header>
          <Toast.Body>
            <CreateComment
              handleNewComment={handleNewComment}
              newComment={newComment}
              setNewComment={setNewComment}
              articleId={articleId}
              loggedin={loggedin.current}
              toggleAddComment={toggleAddComment}
            />
          </Toast.Body>
        </Toast>
        <DeleteModel show={deleted} onHide={() => setDeleted(false)} />
      </div>
    </div>
  );
};

export default Comments;
