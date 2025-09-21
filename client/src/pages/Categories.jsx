import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RenderPreviews from "./components/RenderPreviews";
import MoveToEffect from "./components/effects/MoveToEffect";

const Blogs = () => {
  const { type } = useParams();

  const blogType = type ? type : "standard-post";

  function convertToTitleCase(str) {
    return str
      .toLowerCase()
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  var blog = "";
  const validBlogTypes = ["standard-post", "video-post", "audio-post"];

  if (validBlogTypes.includes(blogType)) {
    blog = convertToTitleCase(blogType);
  } else {
    return (window.location.href = "/error");
  }

  return (
    <>
      <Helmet>
        <title>Blogs Type - {blog} : SparkNest</title>
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
                    Blog Type:
                  </span>
                  {blog}
                </h1>
              </div>
            </div>
          </div>
          <RenderPreviews />
        </section>
        <Footer />
      </div>
      <MoveToEffect />
    </>
  );
};

export default Blogs;
