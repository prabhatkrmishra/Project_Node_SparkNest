import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

const PaginationBlock = ({ currentPage, totalPages, onPageChange }) => {
  const location = useLocation();

  const handlePageChange = (page) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className="row pagination">
      <div className="column lg-12">
        <nav className="pgn">
          <ul>
            <li>
              <button
                className="pgn__prev"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M10.25 6.75L4.75 12L10.25 17.25"
                  ></path>
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19.25 12H5"
                  ></path>
                </svg>
              </button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li key={index}>
                {currentPage === index + 1 ? (
                  <span className="pgn__num current">{index + 1}</span>
                ) : (
                  <Link
                    to={`${location.pathname}?page=${index + 1}`}
                    className="pgn__num"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <button
                className="pgn__next"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M13.75 6.75L19.25 12L13.75 17.25"
                  ></path>
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19 12H4.75"
                  ></path>
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
