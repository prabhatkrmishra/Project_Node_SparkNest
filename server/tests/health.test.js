import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("GET /", () => {
  it("returns welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Welcome to the Blog Website API" });
  });
});

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.uptime).toBe("number");
  });
});

describe("GET /ready", () => {
  it("returns ready or not ready (no DB in test)", async () => {
    const res = await request(app).get("/ready");
    expect([200, 503]).toContain(res.status);
    expect(["ready", "not ready"]).toContain(res.body.status);
  });
});
