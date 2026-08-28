/**
 * Express app factory — creates and configures the app without starting the server.
 * Exported for use by server.js and by tests (supertest).
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import session from "express-session";
import pgSession from "connect-pg-simple";
import passport from "passport";
import { initializePassport } from "./config/passport.js";
import { env } from "./config/env.js";
import pool from "./db/db.js";
import pinoHttp from "pino-http";
import { logger } from "./config/logger.js";
import { applyRateLimit } from "./middlewares/rateLimiter.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";

import healthRoutes from "./routes/healthRoutes.js";
import docsRoutes from "./routes/docsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import articlesRouter from "./routes/articlesRoutes.js";
import mediaRouter from "./routes/mediaRoutes.js";
import categoriesRouter from "./routes/categoriesRoutes.js";
import articlePreviewRouter from "./routes/articlePreviewRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import savedArticlesRouter from "./routes/savedArticlesRoutes.js";
import likedArticlesRouter from "./routes/likedArticlesRoutes.js";
import featuredArticlesRouter from "./routes/featuredArticlesRoutes.js";
import serviceRouter from "./routes/serviceRoutes.js";

const app = express();
app.set("trust proxy", 1);

if (env.NODE_ENV !== "test") {
  app.use(pinoHttp({ logger }));
}

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);
app.use(hpp());
app.use(compression());

// CORS — strict allowlist
const allowedOrigins = env.FRONTEND_ADDRESS.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Global rate limit
app.use(applyRateLimit);

// Session — pg store (MemoryStore in test to avoid DB dependency)
let sessionStore;
if (env.NODE_ENV !== "test") {
  const PgStore = pgSession(session);
  try {
    sessionStore = new PgStore({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    });
  } catch {
    sessionStore = undefined;
  }
} else {
  sessionStore = undefined;
}

app.use(
  session({
    store: sessionStore,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.SECURE_COOKIE === "true",
      httpOnly: env.HTTP_ONLY === "true",
      sameSite: env.SAME_SITE,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    name: "sparknest.sid",
  })
);

// Passport
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Health + docs (before rate limit bypass if needed, but after logger)
app.use("/", healthRoutes);
app.use("/", docsRoutes);

// Routes
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", subscriptionRoutes);
app.use("/", articlesRouter);
app.use("/", mediaRouter);
app.use("/", categoriesRouter);
app.use("/", articlePreviewRouter);
app.use("/", commentRouter);
app.use("/", savedArticlesRouter);
app.use("/", likedArticlesRouter);
app.use("/", featuredArticlesRouter);
app.use("/", serviceRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Blog Website API" });
});

// 404 + error handler (must be after routes)
app.use(notFound);
app.use(errorHandler);

export default app;
