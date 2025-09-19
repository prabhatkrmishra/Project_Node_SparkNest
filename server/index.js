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

const hostname = "0.0.0.0";
const port = 8080;
const saltRounds = 10;

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
env.config();

const randomPass = process.env.RANDOM_PASS;
const frontendAddress = process.env.FRONTEND_ADRESS;

const allowedOrigins = [frontendAddress];

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
  keyGenerator: (req) => req.ip,
  windowMs: 30 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(CheckLimiter);

async function newsLetterSubs(email, type, permission) {
  const result = await db.query("SELECT * FROM subscription WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    const query = `INSERT INTO subscription (email, ${type}) VALUES ($1, $2)`;
    await db.query(query, [email, permission]);
  }
}

app.get("/", (req, res) => {
  res.json({ message: "SparkNest Backend Server" });
});

app.get("/check/email/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.json({
        message: "Email already exist !",
      });
    } else {
      res.json({
        message: "",
      });
    }
  } catch (err) {
    console.error("Error getting useremail:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/check/username/:uname", async (req, res) => {
  const uname = req.params.uname;
  try {
    const checkResult = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [uname]
    );

    if (checkResult.rows.length > 0) {
      res.json({
        message: "Username already taken !",
      });
    } else {
      res.json({
        message: "",
      });
    }
  } catch (err) {
    console.error("Error getting username:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/subscribe/newsletter", async (req, res) => {
  const email = req.body.email;
  const type = req.body.type;

  try {
    newsLetterSubs(email, type, true);
    return res.status(200).json({ message: "Subscription successful" });
  } catch (err) {
    console.error("Error during signup:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/get/subscription/:email", async (req, res) => {
  if (req.isAuthenticated()) {
    const email = req.params.email;
    if (email) {
      try {
        const result = await db.query(
          `SELECT * FROM subscription WHERE email=$1`,
          [email]
        );

        if (!result.rows.length) {
          return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(result.rows[0]);
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error" });
      }
    } else {
      res.status(400).send("Request error, email is empty");
    }
  } else {
    res.status(403).send("Not authenticated to get subscription details");
  }
});

app.patch("/set/subscription", async (req, res) => {
  if (req.isAuthenticated()) {
    const { email, newsletter } = req.body;

    if (email) {
      try {
        const result = await db.query(
          "SELECT * FROM subscription WHERE email = $1",
          [email]
        );
        if (!result.rows.length) {
          const query = `INSERT INTO subscription (email, newsletter) VALUES ($1, $2)`;
          await db.query(query, [email, newsletter]);
        } else {
          const query = "UPDATE subscription SET newsletter=$1 WHERE email=$2";
          await db.query(query, [newsletter, email]);
        }
        return res
          .status(200)
          .json({ message: "Subscriptions updated successfully" });
      } catch (err) {
        console.error("Error during subscripion update", err);
        return res.status(500).json({ message: "Internal server error" });
      }
    } else {
      res.status(400).send("Request error, email is empty");
    }
  } else {
    res.status(403).send("Not authenticated to update subscription details");
  }
});

app.patch("/user/details", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const id = parseInt(req.body.id, 10);
      // Synced with React comonents
      const { fname, lname, username, region, email, oldpassword, password } =
        req.body;
      const updatedDetails = new Map();

      if (!id) {
        return res
          .status(400)
          .json({ message: "Cannot update details, user ID is empty" });
      }

      if (fname) updatedDetails.set("fname", fname);
      if (lname) updatedDetails.set("lname", lname);
      if (username) updatedDetails.set("username", username);
      if (region) updatedDetails.set("region", region);
      if (email) updatedDetails.set("email", email);

      if (password && oldpassword) {
        const userQuery = await db.query(
          "SELECT password FROM users WHERE id = $1",
          [id]
        );
        if (!userQuery.rows.length) {
          return res.status(404).json({ message: "User not found" });
        }

        const storedPasswordHash = userQuery.rows[0].password;
        const isMatch = await bcrypt.compare(oldpassword, storedPasswordHash);
        if (!isMatch) {
          return res
            .status(400)
            .json({ message: "Old password is incorrect, cannot update" });
        }

        const hashedNewPassword = await bcrypt.hash(password, saltRounds);
        updatedDetails.set("password", hashedNewPassword);
      }

      if (updatedDetails.size === 0) {
        return res
          .status(400)
          .json({ message: "User details are empty, cannot update" });
      }

      if (updatedDetails.has("username")) {
        const checkUsernameExist = await db.query(
          "SELECT * FROM users WHERE username = $1",
          [updatedDetails.get("username")]
        );
        if (checkUsernameExist.rows.length > 0) {
          return res
            .status(400)
            .json({ message: "Username already exists, cannot update" });
        }
      }

      if (updatedDetails.has("email")) {
        const checkEmailExist = await db.query(
          "SELECT * FROM users WHERE email = $1",
          [updatedDetails.get("email")]
        );
        if (checkEmailExist.rows.length > 0) {
          return res
            .status(400)
            .json({ message: "Email already exists, cannot update" });
        }
      }

      const setClauses = [];
      const values = [];
      let index = 1;

      updatedDetails.forEach((value, key) => {
        // 'username' <- [key] = $'1' <- index
        setClauses.push(`${key} = $${index}`);
        values.push(value);
        index++;
      });
      values.push(id);

      try {
        const userQuery = await db.query("SELECT * FROM users WHERE id = $1", [
          id,
        ]);
        if (userQuery.rows.length) {
          const updateQuery = `UPDATE users SET ${setClauses.join(
            ", "
          )} WHERE id = $${index}`;
          await db.query(updateQuery, values);

          res.status(200).json({
            message: "Update successful",
          });
        } else {
          return res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error during updating user details:", error);
        res.status(500).json({ message: "Server error occurred", error });
      }
    } catch (error) {
      console.error("Error during updating user details:", error);
      res.status(500).json({ message: "Server error occurred", error });
    }
  } else {
    res.status(403).send("Not authenticated, cannot update");
  }
});

app.delete("/user/account/delete/yes", async (req, res) => {
  if (req.isAuthenticated()) {
    const { idtodelete, email, allowed } = req.body;

    if (idtodelete && email && allowed) {
      console.log(
        `User with id:${idtodelete} has allowed to delete their account:${allowed}`
      );
      try {
        const userResult = await db.query("SELECT * FROM users WHERE id = $1", [
          idtodelete,
        ]);
        if (!userResult.rows.length) {
          return res.status(200).json({
            message: `User with id:${idtodelete} not present in database`,
          });
        } else {
          const queryUsers = "DELETE FROM users WHERE id=$1";
          await db.query(queryUsers, [idtodelete]);
        }

        const subscriptionResult = await db.query(
          "SELECT * FROM subscription WHERE email = $1",
          [email]
        );
        if (!subscriptionResult.rows.length) {
          return res.status(200).json({
            message: `User with email:${email} has not subscribed anything`,
          });
        } else {
          const querySubscription = "DELETE FROM subscription WHERE email=$1";
          await db.query(querySubscription, [email]);
        }

        return res.status(200).json({
          message: `User with id:${idtodelete} removed from database`,
        });
      } catch (err) {
        console.error("Error during removing error", err);
        return res.status(500).json({ message: "Internal server error" });
      }
    } else {
      res.status(400).send("Request error, not allowed");
    }
  } else {
    res.status(403).send("Not authenticated to delete user");
  }
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
          region: user.region,
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
          region: user.region,
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

app.post("/signup", async (req, res) => {
  const { fname: firstname, lname: lastname, email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Credentials are empty" });
  }

  const checkEmailExist = await db.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (checkEmailExist.rows.length > 0) {
    res.status(400).json({
      message: "User already exist in database",
    });
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    await db.query(
      "INSERT INTO users (email, password, fname, lname) VALUES ($1, $2, $3, $4)",
      [email, hash, firstname, lastname]
    );
    newsLetterSubs(email, "newsletter", req.body.newsletter);

    // Respond with success
    res.status(200).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Internal Server Error" });
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

        const matched = await bcrypt.compare(password, storedHashedPassword);

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
      try {
        //console.log("Google profile:", profile);
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.email,
        ]);

        if (result.rows.length === 0) {
          //console.log("User not found, creating a new user.");
          const hash = await bcrypt.hash(randomPass, saltRounds); //Do not remove await
          const newUser = await db.query(
            "INSERT INTO users (email, password, fname, lname) VALUES ($1, $2, $3, $4) RETURNING *",
            [profile.email, hash, profile.given_name, profile.family_name]
          );
          newsLetterSubs(profile.email, "newsletter", "true");

          return cb(null, newUser.rows[0]);
        } else {
          //console.log("User found, returning existing user.");
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        //console.error("Error during Google authentication:", err);
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
