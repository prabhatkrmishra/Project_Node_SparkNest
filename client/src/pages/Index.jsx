import { Helmet } from "react-helmet";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeBanner from "./components/banner/HomeBanner";
import RenderBlogs from "./components/RenderBlogs";
import MoveToEffect from "./components/effects/MoveToEffect";

const Index = () => {
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
          <RenderBlogs />
        </section>
        <Footer />
      </div>
      <MoveToEffect />
    </>
  );
};

export default Index;
