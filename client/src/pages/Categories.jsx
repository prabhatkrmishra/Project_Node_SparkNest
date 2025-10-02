/* eslint-disable react-hooks/exhaustive-deps */
import { Helmet } from "react-helmet";
import { useState, useEffect, useRef } from "react";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MasonryEffect from "./components/effects/MasonryEffect";
import AnimateBricks from "./components/effects/AnimateBricks";
import MoveToEffect from "./components/effects/MoveToEffect";

import { fetchAllCategories } from "../api/API";

const Categories = () => {
  const groupCategories = (categories) => {
    const groups = {};

    categories.forEach((category) => {
      const words = category.name.split(" ");

      words.forEach((word) => {
        if (!groups[word]) {
          groups[word] = [];
        }
        groups[word].push(category);
      });
    });

    return groups;
  };

  const [groupedCategories, setGroupedCategories] = useState({});
  const [hasCategories, setHasCategories] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const bricksRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchAllCategories();
        const categories = response.data;
        const groups = groupCategories(categories);
        setGroupedCategories(groups);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setHasCategories(
      groupedCategories && Object.keys(groupedCategories).length > 0
    );
  }, [groupedCategories]);

  useEffect(() => {
    if (hasCategories) {
      console.log(hasCategories);
      const checkIfBricksLoaded = () => {
        const bricksContainer = bricksRef.current;
        if (bricksContainer) {
          const brickElements =
            bricksContainer.querySelectorAll(".brick.entry");
          if (brickElements.length === Object.keys(groupedCategories).length) {
            setShouldAnimate(!shouldAnimate);
          }
        }
      };

      const timer = setTimeout(checkIfBricksLoaded, 50);
      return () => clearTimeout(timer);
    }
  }, [hasCategories]);

  return (
    <>
      <Helmet>
        <title>All Categories</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content">
          <div className="s-pageheader">
            <div id="bricks" className="bricks" style={{ paddingTop: "0px" }}>
              <div
                className={`masonry ${!hasCategories ? "no-articles" : ""}`}
                ref={bricksRef}
              >
                <div className="bricks-wrapper" data-animate-block>
                  <div className="grid-sizer"></div>
                  {hasCategories &&
                    Object.keys(groupedCategories).map((word) => (
                      <article className="brick entry" key={word}>
                        <h3>
                          <u>{word}</u>
                        </h3>
                        <ul className="categories-ul">
                          {groupedCategories[word].map((category) => (
                            <li className="categories-li" key={category.id}>
                              <a href={`/category/${category.name}`}>
                                {category.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
      {shouldAnimate && <MasonryEffect />}
      {shouldAnimate && <AnimateBricks />}
      {shouldAnimate && <MoveToEffect />}
    </>
  );
};

export default Categories;
