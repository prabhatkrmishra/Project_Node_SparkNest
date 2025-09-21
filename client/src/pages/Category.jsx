import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

import { getArticlePreviewsCategory } from "../api/ARTICLESAPI";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RenderPreviews from "./components/RenderPreviews";
import MoveToEffect from "./components/effects/MoveToEffect";

const Category = () => {
  const { type } = useParams();
  const categoryType = type ? type : "design";
  const category = categoryType.charAt(0).toUpperCase() + categoryType.slice(1);

  const url = getArticlePreviewsCategory(categoryType);
  const ctype = 104;

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
          <RenderPreviews url={url} type={ctype}/>
        </section>
        <Footer />
      </div>
      <MoveToEffect />
    </>
  );
};

export default Category;
