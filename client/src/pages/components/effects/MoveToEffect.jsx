import { useEffect } from "react";
import MoveTo from "moveto";

const MoveToEffect = () => {
  useEffect(() => {
    const easeFunctions = {
      easeInQuad: (t, b, c, d) => {
        t /= d;
        return c * t * t + b;
      },
      easeOutQuad: (t, b, c, d) => {
        t /= d;
        return -c * t * (t - 2) + b;
      },
      easeInOutQuad: (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      },
      easeInOutCubic: (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t * t + b;
        t -= 2;
        return (c / 2) * (t * t * t + 2) + b;
      },
    };

    const triggers = document.querySelectorAll(".smoothscroll");

    const moveTo = new MoveTo(
      {
        tolerance: 0,
        duration: 1200,
        easing: "easeInOutCubic",
        container: window,
      },
      easeFunctions
    );

    triggers.forEach((trigger) => {
      moveTo.registerTrigger(trigger);
    });
  }, []);

  return null;
};

export default MoveToEffect;
