import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { env } from "../config/env.js";
import { sanitizeArticleHtml } from "../services/htmlSanitizer.js";

const allowedOrigin = env.FRONTEND_ADDRESS.split(",")[0].trim();

describe("route validation", () => {
  it("rejects non-numeric article ids", async () => {
    const res = await request(app).get("/article/view/not-a-number");
    expect(res.status).toBe(400);
  });

  it("rejects non-numeric comment article ids", async () => {
    const res = await request(app).get("/comment/fetch/not-a-number");
    expect(res.status).toBe(400);
  });
});

describe("authorization", () => {
  it("requires a session to like an article", async () => {
    const res = await request(app).post("/articles/like").send({ article_id: 1 });
    expect(res.status).toBe(401);
  });

  it("requires a session to save an article", async () => {
    const res = await request(app).post("/articles/save").send({ article_id: 1 });
    expect(res.status).toBe(401);
  });

  it("requires a session to feature an article", async () => {
    const res = await request(app).post("/articles/feature").send({ articleId: 1 });
    expect(res.status).toBe(401);
  });

  it("requires a session to clear featured articles", async () => {
    const res = await request(app).delete("/articles/featured");
    expect(res.status).toBe(401);
  });

  it("requires a session to create an article", async () => {
    const res = await request(app).post("/article/create");
    expect(res.status).toBe(401);
  });

  it("requires a session to delete an article", async () => {
    const res = await request(app).delete("/article/delete").send({ id: 1 });
    expect(res.status).toBe(401);
  });

  it("returns 401 for /auth/me without a session", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("public newsletter subscription", () => {
  it("does not require a session (reaches validation)", async () => {
    const res = await request(app).post("/subscribe/newsletter").send({});
    expect(res.status).toBe(400);
  });

  it("rejects malformed emails", async () => {
    const res = await request(app)
      .post("/subscribe/newsletter")
      .send({ email: "not-an-email", type: "newsletter" });
    expect(res.status).toBe(400);
  });
});

describe("public profile selectors", () => {
  it("accepts usernames as profile identifiers", async () => {
    const res = await request(app).get("/public/user/not-a-real-user-name");
    expect([200, 404, 500]).toContain(res.status);
    if (res.status === 404) expect(res.body.message).toBe("User not found");
  });

  it("accepts usernames for profile article previews", async () => {
    const res = await request(app).get("/article/profile/preview/not-a-real-user-name");
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) expect(res.body.message).toMatch(/doesn't exist/i);
  });

  it("rejects overlong profile identifiers", async () => {
    const res = await request(app).get(`/public/user/${"a".repeat(31)}`);
    expect(res.status).toBe(400);
  });
});

describe("CORS", () => {
  it("returns 403 for a disallowed origin", async () => {
    const res = await request(app).get("/").set("Origin", "https://evil.example");
    expect(res.status).toBe(403);
  });

  it("allows the configured origin", async () => {
    const res = await request(app).get("/").set("Origin", allowedOrigin);
    expect(res.status).toBe(200);
  });
});

describe("article HTML sanitizer", () => {
  it("drops scripts and event handlers", () => {
    const clean = sanitizeArticleHtml(
      '<p onclick="steal()">hi</p><script>alert(1)</script><img src="x" onerror="alert(1)">'
    );
    expect(clean).not.toMatch(/<script|onclick|onerror/i);
    expect(clean).toContain("<p>hi</p>");
    expect(clean).toContain('src="x"');
  });

  it("drops javascript: links", () => {
    const clean = sanitizeArticleHtml('<a href="javascript:alert(1)">click</a>');
    expect(clean).not.toMatch(/javascript:/i);
  });

  it("keeps Quill formatting", () => {
    const clean = sanitizeArticleHtml('<p class="ql-align-center"><strong>bold</strong></p>');
    expect(clean).toBe('<p class="ql-align-center"><strong>bold</strong></p>');
  });
});
