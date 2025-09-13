import { useEffect } from "react";
import Masonry from "masonry-layout";
import imagesLoaded from "imagesloaded";

const MasonryEffect = () => {
  useEffect(() => {
    const containerBricks = document.querySelector(".bricks-wrapper");
    if (!containerBricks) return;
    imagesLoaded(containerBricks, () => {
      new Masonry(containerBricks, {
        itemSelector: ".entry",
        columnWidth: ".grid-sizer",
        percentPosition: true,
        resize: true,
      });
    });
  }, []);

  return null;
};

export default MasonryEffect;