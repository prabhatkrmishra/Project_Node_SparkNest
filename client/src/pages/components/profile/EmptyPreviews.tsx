// @ts-nocheck
import { useLocation } from "react-router-dom";

const decodeCategory = (value: string) => {
  try {
    return decodeURIComponent(value.replace(/\+/g, " ")).trim();
  } catch {
    return value.replace(/\+/g, " ").trim();
  }
};

const EmptyPreviews = () => {
  const { pathname } = useLocation();
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  const categoryMatch = cleanPath.match(/^\/category\/(.+)$/);

  let message = "No articles to show";

  if (cleanPath === "/profile/articles") {
    message = "No created articles";
  } else if (cleanPath === "/profile/collections") {
    message = "No saved articles";
  } else if (cleanPath === "/profile/liked") {
    message = "No liked articles";
  } else if (categoryMatch) {
    const category = decodeCategory(categoryMatch[1]);
    message = category
      ? `No articles tagged “${category}” yet.`
      : "No articles in this category yet.";
  }

  return (
    <div className="nothing-menu" role="status">
      <span className="nothing-menu-span">{message}</span>
    </div>
  );
};

export default EmptyPreviews;
