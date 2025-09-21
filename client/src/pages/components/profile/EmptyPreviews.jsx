import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

const EmptyPreviews = () => {
  const location = useLocation();
  let message = useRef("");
  const categoryMatch = location.pathname.match(/\/category\/(.+)/);
  const category = categoryMatch ? categoryMatch[1] : null;

  useEffect(() => {
    switch (location.pathname) {
      case "/profile/articles":
        message.current = "No created articles";
        break;
      case "/profile/collections":
        message.current = "No saved articles";
        break;
      case "/profile/liked":
        message.current = "No liked articles";
        break;
      case category ? `/category/${category}` : null:
        message.current = `No articles having tags ${category}`;
        break;
      default:
        message.current = "No articles to show";
    }
  }, [category, location.pathname]);

  return (
    <div className="nothing-menu">
      {message.current && (
        <span className="nothing-menu-span">{message.current}</span>
      )}
    </div>
  );
};

export default EmptyPreviews;
