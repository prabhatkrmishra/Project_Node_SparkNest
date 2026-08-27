/**
 * Express app factory — creates and configures the app without starting the server.
 * Exported for use by server.js and by tests (supertest).
 */

import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { initializePassport } from "./config/passport.js";
import config from "./config/config.js";

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

// Middleware setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (config.allowedOrigins) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Session setup
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: config.session.cookie.secure === "true" ? true : false,
      httpOnly: config.session.cookie.httpOnly === "true" ? true : false,
      sameSite: config.session.cookie.sameSite,
    },
  })
);

// Initialize passport
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

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

export default app;
