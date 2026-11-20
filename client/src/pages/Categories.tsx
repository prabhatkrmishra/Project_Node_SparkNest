import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";

import { fetchAllCategories } from "../api/API";

type Category = { id: number; name: string };

const letterFor = (name: string) => {
  const first = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
};

const Categories = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      try {
        const response = await fetchAllCategories();
        if (active) {
          const data = response.data;
          setCategories(Array.isArray(data) ? data : data?.categories ?? []);
        }
      } catch (err) {
        console.error("Could not load categories:", err);
        if (active) setError("Categories could not be loaded. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchCategories();
    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = categories
      .filter((category) => category.name.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => a.name.localeCompare(b.name));

    return filtered.reduce<Record<string, Category[]>>((groups, category) => {
      const letter = letterFor(category.name);
      groups[letter] = groups[letter] ? [...groups[letter], category] : [category];
      return groups;
    }, {});
  }, [categories, query]);

  const letters = Object.keys(grouped).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  return (
    <>
      <Helmet>
        <title>All Categories · SparkNest</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content categories-page">
          <div className="s-pageheader categories-page__header">
            <div className="row">
              <div className="column lg-8">
                <p className="categories-page__eyebrow">Explore</p>
                <h1 className="categories-page__title">All categories</h1>
                <p className="categories-page__lead">
                  Browse every topic on SparkNest.
                  {!loading &&
                    !error &&
                    ` ${categories.length.toLocaleString()} ${
                      categories.length === 1 ? "category" : "categories"
                    }, grouped A–Z.`}
                </p>
              </div>
              <div className="column lg-4">
                <form className="categories-filter" role="search" onSubmit={(e) => e.preventDefault()}>
                  <label className="categories-filter__label" htmlFor="category-filter">
                    Filter categories
                  </label>
                  <input
                    id="category-filter"
                    className="categories-filter__input"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search topics…"
                    autoComplete="off"
                  />
                </form>
              </div>
            </div>

            {!loading && !error && letters.length > 0 && (
              <nav className="categories-index" aria-label="Category index">
                {letters.map((letter) => (
                  <a key={letter} href={`#letter-${letter === "#" ? "other" : letter}`}>
                    {letter}
                  </a>
                ))}
              </nav>
            )}
          </div>

          <div className="row categories-page__body">
            {loading && (
              <p className="bricks-status" role="status">
                Loading categories…
              </p>
            )}
            {!loading && error && (
              <p className="form-status form-status--error" role="alert">
                {error}
              </p>
            )}
            {!loading && !error && letters.length === 0 && (
              <p className="categories-empty" role="status">
                {query.trim()
                  ? `No categories match “${query.trim()}”.`
                  : "No categories are available yet."}
              </p>
            )}
            {!loading &&
              !error &&
              letters.map((letter) => (
                <section
                  className="categories-group"
                  key={letter}
                  id={`letter-${letter === "#" ? "other" : letter}`}
                  aria-labelledby={`letter-${letter === "#" ? "other" : letter}-heading`}
                >
                  <h2
                    className="categories-group__letter"
                    id={`letter-${letter === "#" ? "other" : letter}-heading`}
                  >
                    {letter}
                  </h2>
                  <ul className="categories-group__list">
                    {grouped[letter].map((category) => (
                      <li key={category.id}>
                        <a href={`/category/${encodeURIComponent(category.name)}`}>
                          {category.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default Categories;
