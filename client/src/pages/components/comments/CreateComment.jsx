import { useState } from "react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { createComment } from "../../../api/COMMENTSAPI";

const CreateComment = (prop) => {
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => {
    return;
  };
  const handleLogin = () => (window.location.href = "/session/new");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prop.loggedin) {
      handleShow();
      return;
    }

    if (!prop.newComment.name || !prop.newComment.email) {
      handleShow();
      return;
    }

    try {
      const response = await createComment(prop.articleId, prop.newComment);
      prop.handleNewComment(response.data);
      prop.toggleAddComment(false);
      prop.setNewComment({
        ...prop.newComment,
        body: "",
        parent_comment_id: null,
      });
    } catch (error) {
      console.log(error);
      if (
        error &&
        (error.response.status == 403 || error.response.status == 400)
      ) {
        window.location.href = "/session/new";
      }
    }
  };

  return (
    <div className="comment-respond">
      <div id="respond">
        <form
          name="contactForm"
          id="contactForm"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <fieldset className="row">
            <div className="column lg-12 message form-field">
              <textarea
                name="body"
                id="cMessage"
                className="u-fullwidth"
                placeholder="Type your comment..."
                value={prop.newComment.body || ""}
                onChange={(e) =>
                  prop.setNewComment({
                    ...prop.newComment,
                    body: e.target.value,
                  })
                }
              />
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
      <div className="comment-login-modal">
        <Modal
          show={show}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Body>For adding comment you have to login/singup.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleLogin}>
              Login
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default CreateComment;
