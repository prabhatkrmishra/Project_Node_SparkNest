import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RenderBlogs from "./components/RenderBlogs";
import MoveToEffect from "./components/effects/MoveToEffect";

const Category = () => {
  const { type } = useParams();
  const categoryType = type ? type : "design";

  var category = "";
  const validCategoryTypes = [
    "design",
    "lifestyle",
    "inspiration",
    "workplace",
    "health",
    "photography",
  ];

  if (validCategoryTypes.includes(categoryType)) {
    category = categoryType.charAt(0).toUpperCase() + categoryType.slice(1);
  } else {
    return (window.location.href = "/error");
  }

  return (
    <>
      <Helmet>
        <title>Category - {category} : SparkNest</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content">
          <div className="s-pageheader">
            <div className="row">
              <div className="column large-12">
                <h1 className="page-title">
                  <span
                    className="page-title__small-type"
                    style={{ marginBottom: "25px" }}
                  >
                    Category:
                  </span>
                  {category}
                </h1>
              </div>
            </div>
          </div>
          <RenderBlogs />
        </section>
        <Footer />
      </div>
      <MoveToEffect />
    </>
  );
};

export default Category;
