/*import { useEffect, useState } from "react";
import Header from "./components/Header"
import Body from "./components/Body"
import Footer from "./components/Footer"
import { getHome, getMessage, sendMessage } from "./api";

function App() {
  const [blogs, setBlogs] = useState([]);
  const [message, setMessage] = useState("");
  const [data, setData] = useState({ name: "", email: "" });
  const [responseMessage, setResponseMessage] = useState("");

  useEffect(() => {
    getHome()
      .then((response) => setBlogs(response.data))
      .catch((error) => console.error("Error fetching blogs:", error));
  }, []);

  function fetch() {
    getMessage()
      .then((response) => setMessage(response.data))
      .catch((error) => console.error("Error fetching blogs:", error));
  }

  const handleChange = (event) => {
    setData({ ...data, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      console.log("Response from server:", (await sendMessage(data)).data.receivedData);
    } catch (error) {
      console.error("There was an error!", error);
    }
  };

  return (
    <div>
      <h1>Blog</h1>
      <ul>
        <h1>{blogs.message}</h1>
      </ul>
      <button onClick={fetch}>Click me</button>
      {message ? <p>{message.message}</p> : <p>No message</p>}

      <h1>Submit Form Data</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={data.name}
          placeholder="Name"
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          value={data.email}
          placeholder="Email"
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}*/

/*const functionPreloader = () => {
    const preloader = document.querySelector("#preloader");
    if (!preloader) return;

    document.documentElement.classList.add("ss-preload");

    const handleLoad = () => {
      document.documentElement.classList.remove("ss-preload");
      document.documentElement.classList.add("ss-loaded");

      preloader.addEventListener("transitionend", function afterTransition(e) {
        if (e.target.matches("#preloader")) {
          e.target.style.display = "none";
          preloader.removeEventListener(e.type, afterTransition);
        }
      });
    };

    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  };

  const functionMobileMenu = () => {
    const toggleButton = document.querySelector(".s-header__menu-toggle");
    const mainNavWrap = document.querySelector(".s-header__nav-wrap");
    const mainNav = document.querySelector(".s-header__nav");
    const parentMenus = mainNav.querySelectorAll(".has-children");
    const siteBody = document.querySelector("body");

    if (!(toggleButton && mainNavWrap)) return;

    const handleResize = () => {
      if (window.matchMedia("(min-width: 1201px)").matches) {
        if (siteBody.classList.contains("menu-is-open"))
          siteBody.classList.remove("menu-is-open");
        if (toggleButton.classList.contains("is-clicked"))
          toggleButton.classList.remove("is-clicked");
        if (!scrollLock.getScrollState()) scrollLock.enablePageScroll();
        parentMenus.forEach((current) =>
          current.classList.remove("sub-menu-is-open")
        );
      }
    };

    const handleToggleButtonClick = (e) => {
      e.preventDefault();
      toggleButton.classList.toggle("is-clicked");
      siteBody.classList.toggle("menu-is-open");

      if (scrollLock.getScrollState()) {
        scrollLock.disablePageScroll(mainNavWrap);
      } else {
        scrollLock.enablePageScroll(mainNavWrap);
      }
    };

    const handleMainNavClick = (e) => {
      const target = e.target.closest(".has-children");
      if (!target) return;

      if (!target.classList.contains("sub-menu-is-open")) {
        parentMenus.forEach((current) =>
          current.classList.remove("sub-menu-is-open")
        );
        target.classList.add("sub-menu-is-open");
      } else {
        target.classList.remove("sub-menu-is-open");
      }
    };

    toggleButton.addEventListener("click", handleToggleButtonClick);
    mainNav.addEventListener("click", handleMainNavClick);
    window.addEventListener("resize", handleResize);

    return () => {
      toggleButton.removeEventListener("click", handleToggleButtonClick);
      mainNav.removeEventListener("click", handleMainNavClick);
      window.removeEventListener("resize", handleResize);
    };
  };

  const functionSearch = () => {
    const searchWrap = document.querySelector(".s-header__search");
    const searchTrigger = document.querySelector(".s-header__search-trigger");

    if (!(searchWrap && searchTrigger)) return;

    const searchField = searchWrap.querySelector(".s-header__search-field");
    const closeSearch = searchWrap.querySelector(".s-header__search-close");
    const siteBody = document.querySelector("body");

    const handleSearchTriggerClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      siteBody.classList.add("search-is-visible");

      if (scrollLock.getScrollState()) {
        scrollLock.disablePageScroll(searchWrap);
      } else {
        scrollLock.enablePageScroll(searchWrap);
      }

      setTimeout(() => {
        searchField.focus();
      }, 100);
    };

    const handleCloseSearchClick = (e) => {
      e.stopPropagation();
      if (siteBody.classList.contains("search-is-visible")) {
        siteBody.classList.remove("search-is-visible");
        setTimeout(() => {
          searchField.blur();
        }, 100);

        if (scrollLock.getScrollState()) {
          scrollLock.disablePageScroll(searchWrap);
        } else {
          scrollLock.enablePageScroll(searchWrap);
        }
      }
    };

    const handleSearchWrapClick = (e) => {
      if (!e.target.matches(".s-header__search-inner")) {
        handleCloseSearchClick(e);
      }
    };

    searchTrigger.addEventListener("click", handleSearchTriggerClick);
    closeSearch.addEventListener("click", handleCloseSearchClick);
    searchWrap.addEventListener("click", handleSearchWrapClick);
    searchField.addEventListener("click", (e) => e.stopPropagation());

    searchField.setAttribute("placeholder", "Search for...");
    searchField.setAttribute("autocomplete", "off");

    return () => {
      searchTrigger.removeEventListener("click", handleSearchTriggerClick);
      closeSearch.removeEventListener("click", handleCloseSearchClick);
      searchWrap.removeEventListener("click", handleSearchWrapClick);
      searchField.removeEventListener("click", (e) => e.stopPropagation());
    };
  };

  const functionMasonry = () => {
    const containerBricks = document.querySelector(".bricks-wrapper");
    if (!containerBricks) return;

    const masonry = new Masonry(containerBricks, {
      itemSelector: ".entry",
      columnWidth: ".grid-sizer",
      percentPosition: true,
      resize: true,
    });

    const handleImagesLoaded = () => masonry.layout();
    imagesLoaded(containerBricks, handleImagesLoaded);

    return () => {
      imagesLoaded(containerBricks, () => {});
    };
  };

  const funcAnimateBricks = () => {
    const animateBlocks = document.querySelectorAll("[data-animate-block]");
    const pageWrap = document.querySelector(".s-pagewrap");

    if (!(pageWrap && animateBlocks)) return;

    const doAnimate = (current) => {
      const els = current.querySelectorAll("[data-animate-el]");
      const p = new Promise((resolve) => {
        els.forEach((el, index, array) => {
          const dly = index * 200;
          el.style.setProperty("--transition-delay", `${dly}ms`);
          if (index === array.length - 1) resolve();
        });
      });

      p.then(() => {
        current.classList.add("ss-animated");
      });
    };

    const animateOnScroll = () => {
      const scrollY = window.scrollY;

      animateBlocks.forEach((current) => {
        const viewportHeight = window.innerHeight;
        const triggerTop =
          current.offsetTop + viewportHeight * 0.1 - viewportHeight;
        const blockHeight = current.offsetHeight;
        const blockSpace = triggerTop + blockHeight;
        const inView = scrollY > triggerTop && scrollY <= blockSpace;
        const isAnimated = current.classList.contains("ss-animated");

        if (inView && !isAnimated) {
          doAnimate(current);
        }
      });
    };

    if (pageWrap.classList.contains("ss-home")) {
      window.addEventListener("scroll", animateOnScroll);
    } else {
      window.addEventListener("load", () => {
        doAnimate(animateBlocks[0]);
      });
    }

    return () => {
      window.removeEventListener("scroll", animateOnScroll);
      window.removeEventListener("load", () => {
        doAnimate(animateBlocks[0]);
      });
    };
  };

  const functionSwiper = () => {
    const swiper = new Swiper(".swiper-container", {
      direction: "vertical",
      slidesPerView: 1,
      effect: "fade",
      speed: 1000,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        renderBullet: (index, className) => {
          return '<span class="' + className + '">' + (index + 1) + "</span>";
        },
      },
      on: {
        init: () => {
          document.querySelector(".swiper-pagination").classList.remove("swiper-pagination-bullets");
        },
      },
    });

    return () => {
      swiper.destroy();
    };
  };

  const functionAlertBoxes = () => {
    const boxes = document.querySelectorAll(".alert-box");

    const handleBoxClick = (event) => {
      if (event.target.matches(".alert-box__close")) {
        event.stopPropagation();
        event.target.parentElement.classList.add("hideit");

        setTimeout(() => {
          event.target.parentElement.style.display = "none";
        }, 500);
      }
    };

    boxes.forEach((box) => {
      box.addEventListener("click", handleBoxClick);
    });

    return () => {
      boxes.forEach((box) => {
        box.removeEventListener("click", handleBoxClick);
      });
    };
  };

  const functionBackToTop = () => {
    const pxShow = 900;
    const goTopButton = document.querySelector(".ss-go-top");

    if (!goTopButton) return;

    const handleScroll = () => {
      if (window.scrollY >= pxShow) {
        if (!goTopButton.classList.contains("link-is-visible"))
          goTopButton.classList.add("link-is-visible");
      } else {
        goTopButton.classList.remove("link-is-visible");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  };

  const functionMoveTo = () => {
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
  };

  useEffect(() => {
    const cleanupFunctions = [
      functionPreloader(),
      functionMobileMenu(),
      functionSearch(),
      functionMasonry(),
      funcAnimateBricks(),
      functionSwiper(),
      functionAlertBoxes(),
      functionBackToTop(),
      functionMoveTo(),
    ];

    return () => cleanupFunctions.forEach((fn) => fn && fn());
  }, []);
*/
