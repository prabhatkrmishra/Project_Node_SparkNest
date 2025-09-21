import { Helmet } from "react-helmet";

import { getArticlePreviews } from "../api/ARTICLESAPI";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeBanner from "./components/banner/HomeBanner";
import RenderPreviews from "./components/RenderPreviews";
import MoveToEffect from "./components/effects/MoveToEffect";

const Index = () => {
  const url = getArticlePreviews();
  const type = 100;
  return (
    <>
      <Helmet>
        <title>SparkNest</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap ss-home">
        <Header />
        <section id="content" className="s-content">
          <HomeBanner />
          <RenderPreviews url={url} type={type}/>
        </section>
        <Footer />
      </div>
      <MoveToEffect />
    </>
  );
};

export default Index;
