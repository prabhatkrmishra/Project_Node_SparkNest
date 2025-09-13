import MasonryEffect from "./effects/MasonryEffect";
import AnimateBricks from "./effects/AnimateBricks";
import NormalArticle from "./articles/NormalArticle";
import Pagination from "./navigate/Pagination";

const RenderBlogs = () => {
  return (
    <>
      <div id="bricks" className="bricks">
        <div className="masonry">
          <div className="bricks-wrapper" data-animate-block>
            <div className="grid-sizer"></div>
            <NormalArticle />
          </div>
        </div>
        <Pagination />
      </div>
      <MasonryEffect />
      <AnimateBricks />
    </>
  );
};

export default RenderBlogs;
