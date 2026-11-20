/**
 * Seed SparkNest with deterministic sample data for local development and testing.
 *
 * Usage (from server/):
 *   npm run db:seed
 *
 * Requires migrations to be applied first (npm run db:migrate).
 * Resets application data but leaves the categories table untouched.
 */

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

import pool from "../db.js";
import { env } from "../../config/env.js";
import { hashPassword } from "../../services/bcryptService.js";
import { resolveDataPath } from "../../services/storageService.js";
import { updateFeaturedArticles } from "../../models/featuredArticlesModel.js";

const PASSWORD = "Password123!";
// Seeded images are rewritten in place on every run. A per-run query keeps
// browsers from serving a year-old immutable copy of the previous image.
const ASSET_VERSION = Date.now().toString(36);
const withAssetVersion = (url) => `${url}?v=${ASSET_VERSION}`;

const USERS = [
  {
    email: "alice@example.com",
    fname: "Alice",
    lname: "Carter",
    username: "alice_carter",
    region: "Berlin",
    bio: "Product designer writing about calm software and slow mornings.",
    avatar: "avatar-1.jpg",
  },
  {
    email: "bob@example.com",
    fname: "Bob",
    lname: "Nguyen",
    username: "bob_writes",
    region: "Toronto",
    bio: "Engineer, weekend hiker and occasional home cook.",
    avatar: "avatar-2.jpg",
  },
  {
    email: "carol@example.com",
    fname: "Carol",
    lname: "Diaz",
    username: "carol_reads",
    region: "Lisbon",
    bio: "Slow food enthusiast and lifelong learner.",
    avatar: "avatar-3.jpg",
  },
];

const ARTICLES = [
  {
    author: "alice@example.com",
    title: "Designing Calm Interfaces",
    createdAt: "2026-01-05T09:00:00Z",
    categoryIds: [1, 25],
    previewTitle: "Designing Calm Interfaces",
    previewSubtitle: "Fewer decisions, better defaults, quieter screens.",
    bodyImage: true,
    body: `<p>Calm interfaces do not shout. They make the next action obvious and then get out of the way.</p>
<p>Three habits help: reduce the number of decisions per screen, choose sensible defaults, and let whitespace do the grouping.</p>
<img src="{{BODY_IMAGE}}" alt="A calm workspace" />
<p>None of this is new. The hard part is defending it when a stakeholder asks for one more banner.</p>`,
  },
  {
    author: "bob@example.com",
    title: "A Weekend in the Alps",
    createdAt: "2026-01-12T10:30:00Z",
    categoryIds: [10, 17],
    previewTitle: "A Weekend in the Alps",
    previewSubtitle: "Two days, one ridge line, and far too much cheese.",
    body: `<p>We took the first train out of Munich on Saturday and were above the tree line before lunch.</p>
<p>The forecast promised rain. Instead we got clouds below us and a ridge line that went on for hours.</p>
<p>Packing light mattered more than packing perfectly. Next time: one fewer layer, one more snack.</p>`,
  },
  {
    author: "carol@example.com",
    title: "Slow Cooking for Busy Weeks",
    createdAt: "2026-01-19T08:15:00Z",
    categoryIds: [8, 13],
    previewTitle: "Slow Cooking for Busy Weeks",
    previewSubtitle: "Sunday effort, weekday rewards.",
    body: `<p>A pot of beans on Sunday can carry three weeknight dinners. The trick is to under-season at the start and finish each meal separately.</p>
<p>On Monday it becomes soup, Tuesday a grain bowl, Wednesday a toast topping. None of it takes more than fifteen minutes.</p>`,
  },
  {
    author: "alice@example.com",
    title: "The Case for Boring Infrastructure",
    createdAt: "2026-01-26T12:00:00Z",
    categoryIds: [1, 24],
    previewTitle: "The Case for Boring Infrastructure",
    previewSubtitle: "Novelty is a cost you pay every on-call rotation.",
    body: `<p>The best infrastructure decision is usually the one your team already understands.</p>
<p>Boring systems are documented, monitored and replaceable. Excitement belongs in the product, not in the deploy pipeline.</p>`,
  },
  {
    author: "bob@example.com",
    title: "Notes on Learning in Public",
    createdAt: "2026-02-02T17:45:00Z",
    categoryIds: [6, 56],
    previewTitle: "Notes on Learning in Public",
    previewSubtitle: "Publish the rough draft; refine it in the open.",
    body: `<p>Learning in public is less about performance and more about leaving a trail for the next person.</p>
<p>Short notes beat polished essays. A sentence about what surprised you is enough to start.</p>`,
  },
  {
    author: "carol@example.com",
    title: "The Art of Noticing",
    createdAt: "2026-02-09T09:20:00Z",
    categoryIds: [17, 62],
    previewTitle: "The Art of Noticing",
    previewSubtitle: "A camera is optional; attention is not.",
    body: `<p>The best photographs I have made started as ordinary walks with no camera at all.</p>
<p>Noticing is a practice: the angle of light, a repeated color, the pause before someone laughs. The frame is just where the noticing lands.</p>`,
  },
  {
    author: "alice@example.com",
    title: "A Small Guide to Better Defaults",
    createdAt: "2026-02-16T14:10:00Z",
    categoryIds: [25, 57],
    previewTitle: "A Small Guide to Better Defaults",
    previewSubtitle: "Most people never open the settings screen.",
    body: `<p>Defaults are the interface for everyone who never opens settings. Treat them as product decisions, not implementation details.</p>
<p>Choose the safest useful option, explain what changes, and make the choice reversible.</p>`,
  },
  {
    author: "bob@example.com",
    title: "What the Trail Taught Me About Scope",
    createdAt: "2026-02-23T11:05:00Z",
    categoryIds: [45, 10],
    previewTitle: "What the Trail Taught Me About Scope",
    previewSubtitle: "The summit is optional. Getting back before dark is not.",
    body: `<p>Every long hike includes a moment when the plan stops matching the terrain. The useful skill is not grit; it is re-planning without drama.</p>
<p>We turned around an hour before the summit. The walk back was the best part of the day.</p>`,
  },
  {
    author: "carol@example.com",
    title: "Weeknight Baking, Without the Project",
    createdAt: "2026-03-02T18:30:00Z",
    categoryIds: [8, 66],
    previewTitle: "Weeknight Baking, Without the Project",
    previewSubtitle: "One bowl, one pan, and a reason to stop working.",
    body: `<p>Weeknight baking does not need a stand mixer or a weekend. A simple olive-oil cake and a tray of biscuits cover most occasions.</p>
<p>The point is not the output. It is the twenty quiet minutes in the middle of the week.</p>`,
  },
  {
    author: "alice@example.com",
    title: "Why I Keep a Paper Notebook",
    createdAt: "2026-03-09T08:00:00Z",
    categoryIds: [56, 26],
    previewTitle: "Why I Keep a Paper Notebook",
    previewSubtitle: "The slowest tool is sometimes the one that sticks.",
    body: `<p>A notebook has no notifications, no search, and no way to sync. That is the feature.</p>
<p>I use it for the messy middle of thinking: questions, half-lists, and the one sentence that survives the week.</p>`,
  },
  {
    author: "bob@example.com",
    title: "Reading Slowly on Purpose",
    createdAt: "2026-03-16T20:15:00Z",
    categoryIds: [18, 20],
    previewTitle: "Reading Slowly on Purpose",
    previewSubtitle: "A book is not a feed to clear.",
    body: `<p>I used to measure reading by books finished. Now I measure it by passages I can still explain a month later.</p>
<p>Slowing down feels inefficient until you notice how much you were skimming.</p>`,
  },
  {
    author: "carol@example.com",
    title: "The Quiet Joy of a Tidy Shelf",
    createdAt: "2026-03-23T10:40:00Z",
    categoryIds: [25, 13],
    previewTitle: "The Quiet Joy of a Tidy Shelf",
    previewSubtitle: "A place for the things you actually reach for.",
    body: `<p>A tidy shelf is not about matching baskets. It is about knowing where the tape measure lives when you need it.</p>
<p>Start with one shelf, remove what does not belong, and let the empty space stay empty for a week.</p>`,
  },
];

const COMMENTS = [
  {
    article: 1,
    author: "bob@example.com",
    body: "The defaults point is underrated. Most of our settings page exists because nobody made a decision.",
  },
  {
    article: 1,
    author: "carol@example.com",
    body: "Saving this. The whitespace advice applies to documents too.",
  },
  {
    article: 2,
    author: "alice@example.com",
    body: "Adding the ridge route to my list. Which station did you start from?",
  },
  {
    article: 3,
    author: "bob@example.com",
    body: "The under-season-then-finish approach changed my weeknights.",
  },
  {
    article: 4,
    author: "carol@example.com",
    body: "Boring infrastructure is a feature, not an apology.",
  },
];

const SAVES = [
  ["alice@example.com", 2],
  ["alice@example.com", 3],
  ["alice@example.com", 4],
  ["bob@example.com", 1],
  ["bob@example.com", 4],
  ["carol@example.com", 1],
];

const LIKES = [
  ["alice@example.com", 3],
  ["alice@example.com", 4],
  ["bob@example.com", 1],
  ["bob@example.com", 4],
  ["carol@example.com", 1],
  ["carol@example.com", 4],
];

const PREVIEW_FILES = [
  "m-600.jpg",
  "m-1200.jpg",
  "f-2000.jpg",
  "t-600.jpg",
  "t-1200.jpg",
  "t-2400.jpg",
];

const PREVIEW_SIZES = {
  "m-600.jpg": [600, 450],
  "m-1200.jpg": [1200, 900],
  "f-2000.jpg": [2000, 1125],
  "t-600.jpg": [600, 338],
  "t-1200.jpg": [1200, 675],
  "t-2400.jpg": [2400, 1350],
};

/**
 * Generate a crisp, deterministic landscape preview so seeded cards and hero
 * crops can be evaluated honestly (avatars are square and far too small).
 */
async function createPreviewImage(filePath, width, height, seed) {
  const hue = (seed * 47) % 360;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hue}, 42%, 22%)"/>
          <stop offset="100%" stop-color="hsl(${(hue + 52) % 360}, 48%, 52%)"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <circle cx="${width * 0.78}" cy="${height * 0.22}" r="${height * 0.28}"
        fill="hsl(${(hue + 90) % 360}, 60%, 68%)" opacity="0.35"/>
      <circle cx="${width * 0.2}" cy="${height * 0.82}" r="${height * 0.42}"
        fill="hsl(${(hue + 180) % 360}, 40%, 18%)" opacity="0.45"/>
      <path d="M0 ${height * 0.7} L${width * 0.35} ${height * 0.42} L${width * 0.62} ${height * 0.66}
        L${width} ${height * 0.3} L${width} ${height} L0 ${height} Z"
        fill="hsl(${(hue + 24) % 360}, 36%, 14%)" opacity="0.55"/>
    </svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 84, mozjpeg: true }).toFile(filePath);
}

async function seedImages(userId, articleId, bodyImageName, seed) {
  const articleDir = resolveDataPath("images", String(userId), String(articleId));
  await fs.mkdir(articleDir, { recursive: true });

  await Promise.all(
    PREVIEW_FILES.map((suffix) => {
      const [width, height] = PREVIEW_SIZES[suffix];
      return createPreviewImage(
        path.join(articleDir, `${userId}-${suffix}`),
        width,
        height,
        seed + suffix.length
      );
    })
  );

  if (bodyImageName) {
    const userDir = resolveDataPath("images", String(userId));
    await fs.mkdir(userDir, { recursive: true });
    await createPreviewImage(path.join(userDir, bodyImageName), 1200, 800, seed + 11);
  }
}

async function seed() {
  const passwordHash = await hashPassword(PASSWORD);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`
      TRUNCATE TABLE
        featured_articles,
        liked_articles,
        saved_articles,
        comments,
        article_images,
        articles_preview,
        articles_categories,
        articles,
        subscription,
        password_resets,
        session,
        users
      RESTART IDENTITY CASCADE
    `);

    const userIds = new Map();
    for (const user of USERS) {
      const result = await client.query(
        `INSERT INTO users (email, fname, lname, username, region, bio, avatar, password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          user.email,
          user.fname,
          user.lname,
          user.username,
          user.region,
          user.bio,
          withAssetVersion(`${env.BACKEND_ADDRESS}/get/avatars/${user.avatar}`),
          passwordHash,
        ]
      );
      userIds.set(user.email, result.rows[0].id);
    }

    for (const user of USERS) {
      await client.query("INSERT INTO subscription (email, newsletter) VALUES ($1, $2)", [
        user.email,
        user.email !== "bob@example.com",
      ]);
    }

    for (const article of ARTICLES) {
      const userId = userIds.get(article.author);
      const bodyImageName = article.bodyImage ? `${userId}-seed-illustration.jpg` : null;
      const bodyImageUrl = bodyImageName
        ? withAssetVersion(`${env.BACKEND_ADDRESS}/article/images/${userId}/${bodyImageName}`)
        : "";

      const result = await client.query(
        `INSERT INTO articles (user_id, title, body, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $4) RETURNING id`,
        [
          userId,
          article.title,
          article.body.replace("{{BODY_IMAGE}}", bodyImageUrl),
          article.createdAt,
        ]
      );
      const createdId = result.rows[0].id;

      await client.query(
        `INSERT INTO articles_preview (article_id, preview_by, preview_title, preview_subtitle)
         VALUES ($1, $2, $3, $4)`,
        [
          createdId,
          USERS.find((u) => u.email === article.author).username,
          article.previewTitle,
          article.previewSubtitle,
        ]
      );

      const base = `${env.BACKEND_ADDRESS}/article/images/${userId}/${createdId}`;
      await client.query(
        `INSERT INTO article_images (article_id, masonry, featured, thumbs)
         VALUES ($1, $2, $3, $4)`,
        [
          createdId,
          [`${base}/${userId}-m-600.jpg`, `${base}/${userId}-m-1200.jpg`].map(withAssetVersion),
          [`${base}/${userId}-f-2000.jpg`].map(withAssetVersion),
          [
            `${base}/${userId}-t-600.jpg`,
            `${base}/${userId}-t-1200.jpg`,
            `${base}/${userId}-t-2400.jpg`,
          ].map(withAssetVersion),
        ]
      );

      for (const categoryId of article.categoryIds) {
        await client.query(
          "INSERT INTO articles_categories (article_id, category_id) VALUES ($1, $2)",
          [createdId, categoryId]
        );
      }

      await seedImages(userId, createdId, bodyImageName, createdId);
    }

    for (const comment of COMMENTS) {
      const user = USERS.find((u) => u.email === comment.author);
      await client.query(
        `INSERT INTO comments (article_id, user_id, name, email, body)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          comment.article,
          userIds.get(comment.author),
          `${user.fname} ${user.lname}`,
          comment.author,
          comment.body,
        ]
      );
    }

    // One reply, so nested comment rendering has something to show.
    const parent = await client.query(
      "SELECT id FROM comments WHERE article_id = 1 AND email = 'bob@example.com' LIMIT 1"
    );
    if (parent.rows[0]) {
      const carol = USERS.find((u) => u.email === "carol@example.com");
      await client.query(
        `INSERT INTO comments (article_id, user_id, parent_comment_id, name, email, body)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          1,
          userIds.get(carol.email),
          parent.rows[0].id,
          `${carol.fname} ${carol.lname}`,
          carol.email,
          "Same here. Our settings page is a museum of undecided trade-offs.",
        ]
      );
    }

    for (const [email, articleId] of SAVES) {
      await client.query("INSERT INTO saved_articles (user_id, article_id) VALUES ($1, $2)", [
        userIds.get(email),
        articleId,
      ]);
    }

    for (const [email, articleId] of LIKES) {
      await client.query("INSERT INTO liked_articles (user_id, article_id) VALUES ($1, $2)", [
        userIds.get(email),
        articleId,
      ]);
    }

    await client.query("COMMIT");

    // Featured articles are derived data: top 3 by likes.
    await updateFeaturedArticles();

    const counts = await pool.query(`
      SELECT
        (SELECT count(*) FROM users) AS users,
        (SELECT count(*) FROM articles) AS articles,
        (SELECT count(*) FROM comments) AS comments,
        (SELECT count(*) FROM saved_articles) AS saves,
        (SELECT count(*) FROM liked_articles) AS likes,
        (SELECT count(*) FROM featured_articles) AS featured
    `);
    console.log("Seed complete:", counts.rows[0]);
    console.log(`Login with any seeded user (e.g. alice@example.com) and password: ${PASSWORD}`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

seed()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await pool.end();
    process.exit(1);
  });
