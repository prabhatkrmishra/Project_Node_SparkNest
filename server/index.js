import express from "express";
import cors from "cors";
import env from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import pg from "pg";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";

const hostname = "localhost";
const port = 8080;
const saltRounds = 15;

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
env.config();

const randomPass = process.env.RANDOM_PASS;
const frontendAddress = process.env.FRONTEND_ADRESS;

const allowedOrigins = [frontendAddress, "https://bunny-absolute-anemone.ngrok-free.app"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,PATCH,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

const CheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many requests, please try again later",
});

// Define Routes
app.get("/", (req, res) => {
  res.json({ message: "List of blogs" });
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.log("Server: authenticate error: " + err);
      return res.status(500).json({ error: "Authentication error" });
    }
    if (user) {
      req.logIn(user, (err) => {
        if (err) {
          console.log("Server: logIn error: " + err);
          return res.status(500).json({ error: "Login error" });
        }
        if (req.body.savesession) {
          // Only 30 day
          req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
          req.session.maxAge = req.session.cookie.maxAge;
          //console.log("Session will be saved for 30 days");
        } else {
          req.session.cookie.expires = false;
          req.session.maxAge = null;
          //console.log("Session will expire when the browser is closed");
        }
        res.json({
          message: "",
          sessionId: req.sessionID,
          cookieAge: req.session.cookie.maxAge,
          id: user.id,
          email: user.email,
          fname: user.fname,
          lname: user.lname,
          username: user.username,
        });
      });
    } else {
      return res.json({ message: info.message });
    }
  })(req, res, next);
});

// Get google profile
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Handle the callback after Google authentication
app.get("/auth/google/home", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication failed" });
    }
    if (user) {
      // Log the user in manually
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res
            .status(500)
            .json({ success: false, message: "Login failed" });
        }

        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
        req.session.maxAge = req.session.cookie.maxAge;

        const userData = {
          sessionId: req.sessionID,
          cookieAge: req.session.cookie.maxAge,
          id: user.id,
          email: user.email,
          fname: user.fname,
          lname: user.lname,
          username: user.username,
        };

        return res.redirect(
          `${frontendAddress}/google/login?login='success'&saveData='true'&user=${encodeURIComponent(
            JSON.stringify(userData)
          )}`
        );
      });
    } else {
      return res.json({ success: false, message: info.message });
    }
  })(req, res, next);
});

app.post("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.json({ message: "Logged out successfully" });
  });
});

app.get("/checkemail/:email", CheckLimiter, async (req, res) => {
  const email = req.params.email;
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.json({
        message: "User already exist !\nTry logging in",
      });
    } else {
      res.json({
        message: "",
      });
    }
  } catch (err) {
    console.error("Error displaying password reset form:", err);
    res.status(500).send("Internal Server Error");
  }
});

async function newsLetterSubs(email, permission) {
  const result = await db.query("SELECT * FROM subscription WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    await db.query(
      "INSERT INTO subscription (email, newsletter) VALUES ($1, $2)",
      [email, permission]
    );
  }
}

function getUserName(email) {
  const atIndex = email.indexOf('@');
  let localPart = email.slice(0, atIndex);
  if (localPart.length > 49) {
    localPart = localPart.slice(0, 49);
  }
  return localPart;
}

app.post("/signup", async (req, res) => {
  const { fname: firstname, lname: lastname, email, password } = req.body;
  const username = getUserName(email);

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    await db.query(
      "INSERT INTO users (email, password, fname, lname, username) VALUES ($1, $2, $3, $4, $5)",
      [email, hash, firstname, lastname, username]
    );
    newsLetterSubs(email, req.body.newsletter);

    // Respond with success
    res.status(200).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/subscribe/newsletter", CheckLimiter, async (req, res) => {
  const email = req.query.email;

  try {
    newsLetterSubs(email, true);
    return res.status(200).json({ message: "Subscription successful" });
  } catch (err) {
    console.error("Error during signup:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

passport.use(
  "local",
  new Strategy(
    { usernameField: "useremail", passwordField: "password" },
    async (useremail, password, cb) => {
      //console.log("Attempting to authenticate user:", useremail);
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          useremail,
        ]);

        if (result.rows.length === 0) {
          //console.log("User not found:", useremail);
          return cb(null, false, {
            message: "You have entered incorrect email or password",
          });
        }

        const user = result.rows[0];
        const storedHashedPassword = user.password;

        const matched = bcrypt.compareSync(password, storedHashedPassword);

        if (matched) {
          //console.log("Password matched for user:", user.email);
          return cb(null, user);
        } else {
          //console.log("Password didn't match for user:", user.email);
          return cb(null, false, {
            message: "You have entered incorrect email or password",
          });
        }
      } catch (err) {
        console.error("Authentication error:", err);
        return cb(err);
      }
    }
  )
);

// Google auth
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      const username = getUserName(profile.email);

      try {
        //console.log('Google profile:', profile);

        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.email,
        ]);

        if (result.rows.length === 0) {
          //console.log('User not found, creating a new user.');
          const newUser = await db.query(
            "INSERT INTO users (email, password, fname, lname, username) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [profile.email, randomPass, profile.given_name, profile.family_name, username]
          );
          newsLetterSubs(profile.email, 'true');

          return cb(null, newUser.rows[0]);
        } else {
          //console.log('User found, returning existing user.');
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        console.error("Error during Google authentication:", err);
        return cb(err);
      }
    }
  )
);

// storing the user's data
passport.serializeUser((user, cb) => {
  cb(null, user);
});

// Get the user data
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
