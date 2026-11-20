// @ts-nocheck
import { useEffect } from "react";
import Masonry from "masonry-layout";
import imagesLoaded from "imagesloaded";

/**
 * Lay out the brick grid once its media is ready. Fonts can still change card
 * heights after images resolve (especially on a first visit), so re-run the
 * layout when the document fonts settle. Without this, Masonry keeps the
 * earlier positions and leaves visible holes between rows.
 */
const MasonryEffect = () => {
  useEffect(() => {
    const containerBricks = document.querySelector(".bricks-wrapper");
    if (!containerBricks) return;

    let masonry;
    let cancelled = false;

    const setup = () => {
      if (cancelled) return;
      masonry = new Masonry(containerBricks, {
        itemSelector: ".entry",
        columnWidth: ".grid-sizer",
        percentPosition: true,
        resize: true,
      });

      document.fonts?.ready.then(() => {
        if (!cancelled) masonry?.layout?.();
      });
    };

    imagesLoaded(containerBricks, setup);

    return () => {
      cancelled = true;
      masonry?.destroy?.();
    };
  }, []);

  return null;
};

export default MasonryEffect;
