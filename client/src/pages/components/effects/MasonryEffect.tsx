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
    let frame;

    // Images below the fold load lazily, so their height can change long after
    // the first layout. Reposition the grid as each one settles.
    const scheduleRelayout = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!cancelled) masonry?.layout?.();
      });
    };

    const imageNodes = Array.from(containerBricks.querySelectorAll("img"));
    imageNodes.forEach((image) => {
      image.addEventListener("load", scheduleRelayout);
      image.addEventListener("error", scheduleRelayout);
    });

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
      cancelAnimationFrame(frame);
      imageNodes.forEach((image) => {
        image.removeEventListener("load", scheduleRelayout);
        image.removeEventListener("error", scheduleRelayout);
      });
      masonry?.destroy?.();
    };
  }, []);

  return null;
};

export default MasonryEffect;
