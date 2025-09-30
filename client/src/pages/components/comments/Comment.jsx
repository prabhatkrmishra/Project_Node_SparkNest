import { useEffect, useState } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

// eslint-disable-next-line react/prop-types
const Comment = ({ comment, depth = 0, onReply, handleDelete, currentUser }) => {
  // eslint-disable-next-line react/prop-types
  const { id, name, body, avatar, updated_at } = comment;

  const [enableDelete, setEnableDelete] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react/prop-types
    if (comment.user_id == currentUser) setEnableDelete(true);
    // eslint-disable-next-line react/prop-types
  }, [comment.user_id, currentUser]);

  // eslint-disable-next-line react/prop-types
  const children = comment.children || [];

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Reply to comment</Popover.Header>
      <Popover.Body>
        Add comment below comment section 
        and click on ADD COMMENT to reply
      </Popover.Body>
    </Popover>
  );

  return (
    <li className={`depth-${depth} comment`}>
      <div className="comment__avatar custom-avatar">
        <img
          className="avatar avatar-comment-custom"
          src={avatar ? `${avatar}` : ""}
          alt=""
          width="50"
          height="50"
        />
      </div>
      <div className="comment__content">
        <div className="comment__info">
          <div className="comment__author">{name}</div>
          <div className="comment__meta">
            <div className="comment__time">
              <span>{new Date(updated_at).toLocaleDateString()}</span>
            </div>
            {!enableDelete && (
              <OverlayTrigger
                trigger="click"
                placement="right"
                overlay={popover}
              >
                <div className="comment__reply">
                  <span
                    className="comment-reply-link"
                    onClick={() => onReply(id)}
                  >
                    Reply
                  </span>
                </div>
              </OverlayTrigger>
            )}
            {enableDelete && (
              <div className="comment__reply">
                <span
                  className="comment-reply-link"
                  onClick={() => handleDelete(id)}
                >
                  Delete
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="comment__text">
          <p>{body}</p>
        </div>
        {children && children.length > 0 && (
          <ul className="children">
            {children.map((child) => (
              <Comment
                key={child.id}
                comment={child}
                depth={depth + 1}
                onReply={onReply}
                handleDelete={handleDelete}
                currentUser={currentUser}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
};

export default Comment;
