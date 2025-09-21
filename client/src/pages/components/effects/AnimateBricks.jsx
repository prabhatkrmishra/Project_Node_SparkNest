import { useEffect, useRef } from 'react';

const AnimateBricks = () => {
  const animateBlocksRef = useRef(null);
  const pageWrapRef = useRef(null);

  useEffect(() => {
    animateBlocksRef.current = document.querySelectorAll('[data-animate-block]');
    pageWrapRef.current = document.querySelector('.s-pagewrap');

    const animateBlocks = animateBlocksRef.current;
    const pageWrap = pageWrapRef.current;

    if (!(pageWrap && animateBlocks.length > 0)) return;

    const doAnimate = (current) => {
      const els = current.querySelectorAll('[data-animate-el]');

      els.forEach((el, index) => {
        const dly = index * 200;
        el.style.setProperty('--transition-delay', `${dly}ms`);
      });

      current.classList.add('ss-animated');
      current.offsetHeight;
    };

    const animateOnScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      animateBlocks.forEach((current) => {
        const triggerTop = current.offsetTop + viewportHeight * 0.1 - viewportHeight;
        const blockHeight = current.offsetHeight;
        const blockSpace = triggerTop + blockHeight;

        const inView = scrollY > triggerTop && scrollY <= blockSpace;
        const isAnimated = current.classList.contains('ss-animated');

        if (inView && !isAnimated) {
          doAnimate(current);
        }
      });
    };

    const handleLoad = () => {
      animateBlocks.forEach((block) => {
        if (!block.classList.contains('ss-animated')) {
          doAnimate(block);
        }
      });
    };

    if (pageWrap.classList.contains('ss-home')) {
      window.addEventListener('scroll', animateOnScroll);
    } else {
      handleLoad();
    }

    return () => {
      window.removeEventListener('scroll', animateOnScroll);
    };
  },[]);

  return null;
};

export default AnimateBricks;
