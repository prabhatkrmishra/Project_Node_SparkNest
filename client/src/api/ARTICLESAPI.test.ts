import { describe, expect, it } from "vitest";

import {
  getAllLiked,
  getAllSaved,
  getArticlePreviews,
  getArticlePreviewsCategory,
  getProfileArticlePreviews,
} from "./ARTICLESAPI";

describe("article preview API paths", () => {
  it("returns paths relative to the shared axios baseURL", () => {
    expect(getArticlePreviews()).toBe("/article/previews");
    expect(getArticlePreviewsCategory("design")).toBe("/article/preview/category/design");
    expect(getProfileArticlePreviews("alice")).toBe("/article/profile/preview/alice");
    expect(getAllSaved(7)).toBe("/articles/saved/7");
    expect(getAllLiked(7)).toBe("/articles/liked/7");
  });

  it("does not embed the /api prefix", () => {
    const paths = [
      getArticlePreviews(),
      getArticlePreviewsCategory("design"),
      getProfileArticlePreviews("alice"),
      getAllSaved(7),
      getAllLiked(7),
    ];

    for (const path of paths) {
      expect(path.startsWith("/api/")).toBe(false);
    }
  });
});
