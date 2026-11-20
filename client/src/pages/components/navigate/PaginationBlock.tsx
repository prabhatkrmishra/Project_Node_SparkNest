// @ts-nocheck
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const COMPACT_QUERY = "(max-width: 600px)";

function getPageItems(currentPage, totalPages, compact) {
  const maxNumbers = compact ? 5 : 7;
  const pages = new Set();

  if (totalPages <= maxNumbers) {
    for (let page = 1; page <= totalPages; page += 1) pages.add(page);
  } else if (currentPage <= 3) {
    for (let page = 1; page <= maxNumbers - 1; page += 1) pages.add(page);
    pages.add(totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.add(1);
    for (let page = totalPages - maxNumbers + 2; page <= totalPages; page += 1) {
      pages.add(page);
    }
  } else {
    pages.add(1);
    pages.add(currentPage - 1);
    pages.add(currentPage);
    pages.add(currentPage + 1);
    pages.add(totalPages);

    if (maxNumbers >= 7) {
      pages.add(currentPage - 2);
      pages.add(currentPage + 2);
    }
  }

  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const items = [];
  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && page - previousPage > 1) {
      items.push(`ellipsis-${previousPage}-${page}`);
    }
    items.push(page);
  });

  return items;
}

const PaginationBlock = ({ currentPage, totalPages, onPageChange }) => {
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && window.matchMedia(COMPACT_QUERY).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_QUERY);
    const updateCompact = (event) => setCompact(event.matches);

    setCompact(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateCompact);

    return () => mediaQuery.removeEventListener("change", updateCompact);
  }, []);

  if (totalPages <= 1) return null;

  const pageItems = getPageItems(currentPage, totalPages, compact);

  return (
    <div className="row pagination">
      <div className="column lg-12">
        <nav className="pgn" aria-label="Article pagination">
          <ul>
            <li>
              <button
                type="button"
                className="pgn__prev"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Go to previous page"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M10.25 6.75L4.75 12L10.25 17.25"
                  />
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19.25 12H5"
                  />
                </svg>
              </button>
            </li>

            {pageItems.map((item) =>
              typeof item === "number" ? (
                <li key={item}>
                  {item === currentPage ? (
                    <span className="pgn__num current" aria-current="page">
                      {item}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="pgn__num"
                      onClick={() => onPageChange(item)}
                      aria-label={`Go to page ${item}`}
                    >
                      {item}
                    </button>
                  )}
                </li>
              ) : (
                <li key={item}>
                  <span className="pgn__ellipsis" aria-hidden="true">
                    &hellip;
                  </span>
                </li>
              )
            )}

            <li>
              <button
                type="button"
                className="pgn__next"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Go to next page"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M13.75 6.75L19.25 12L13.75 17.25"
                  />
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19 12H4.75"
                  />
                </svg>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

PaginationBlock.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default PaginationBlock;
