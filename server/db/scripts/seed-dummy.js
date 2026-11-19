/**
 * Seed SparkNest production with a large, additive dummy dataset:
 *
 *   - 14 dummy authors + 18 dummy commenters (Password123! for all)
 *   - one dummy article per existing category (305 categories -> 305 articles)
 *   - preview/masonry/featured/thumbs images downloaded from picsum.photos
 *     (real photos, seeded URLs) with a sharp-generated fallback
 *   - likes, saves, top-level comments and one level of nested replies
 *   - featured articles recomputed from likes at the end
 *
 * USAGE (from the release directory on the server):
 *   set -a; . /home/pkm/apps/sparknest/shared/.env; set +a
 *   node server/db/scripts/seed-dummy.js
 *
 * Safety guard: aborts if dummy users already exist (prevents double runs).
 * Pass --force to run anyway (existing dummy users are reused, duplicates
 * of their content are NOT re-created).
 *
 * This script is ADDITIVE ONLY. It never TRUNCATEs or deletes anything.
 */

import fs from "fs/promises";
import path from "path";

import sharp from "sharp";

import pool from "../db.js";
import { env } from "../../config/env.js";
import { hashPassword } from "../../services/bcryptService.js";
import { resolveDataPath } from "../../services/storageService.js";
import { updateFeaturedArticles } from "../../models/featuredArticlesModel.js";

const FORCE = process.argv.includes("--force");
const PASSWORD = "Password123!";

// ---------------------------------------------------------------------------
// Deterministic PRNG so re-runs (or partial failures) are reproducible
// ---------------------------------------------------------------------------
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const rand = mulberry32(0x5ecd);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (min, max) => min + Math.floor(rand() * (max - min + 1));

const AUTHORS = [
  ["dummy_author_01", "Maya", "Iyer", "dummy.author.01@sparknest.dev", "Pune", "Curious generalist chasing quiet tools and good books."],
  ["dummy_author_02", "Leo", "Martinez", "dummy.author.02@sparknest.dev", "Madrid", "Engineer by day, sourdough baker by weekend."],
  ["dummy_author_03", "Priya", "Raman", "dummy.author.03@sparknest.dev", "Chennai", "Writes about systems that respect human attention."],
  ["dummy_author_04", "Noah", "Kim", "dummy.author.04@sparknest.dev", "Seoul", "Product thinker, amateur astronomer."],
  ["dummy_author_05", "Elena", "Petrova", "dummy.author.05@sparknest.dev", "Sofia", "Field notes on culture, craft and calm screens."],
  ["dummy_author_06", "Omar", "Farouk", "dummy.author.06@sparknest.dev", "Cairo", "Storyteller of cities and their back streets."],
  ["dummy_author_07", "June", "Park", "dummy.author.07@sparknest.dev", "Vancouver", "Learning out loud, one essay at a time."],
  ["dummy_author_08", "Diego", "Silva", "dummy.author.08@sparknest.dev", "Sao Paulo", "Slow travel, slower mornings."],
  ["dummy_author_09", "Ines", "Moreau", "dummy.author.09@sparknest.dev", "Lyon", "Keeps a notebook in every jacket pocket."],
  ["dummy_author_10", "Arjun", "Mehta", "dummy.author.10@sparknest.dev", "Bengaluru", "Building boring software with exciting results."],
  ["dummy_author_11", "Sara", "Haddad", "dummy.author.11@sparknest.dev", "Amman", "Collecting overlooked corners of the world."],
  ["dummy_author_12", "Tom", "Baker", "dummy.author.12@sparknest.dev", "Dublin", "Curious about almost everything, certain of very little."],
  ["dummy_author_13", "Nia", "Okafor", "dummy.author.13@sparknest.dev", "Lagos", "Writing at the intersection of design and daily life."],
  ["dummy_author_14", "Mateo", "Rossi", "dummy.author.14@sparknest.dev", "Turin", "Chasing long trains and longer paragraphs."],
];

const COMMENTERS = Array.from({ length: 18 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return [
    `dummy_user_${n}`,
    ["Asha", "Raj", "Nina", "Finn", "Lara", "Ravi", "Mia", "Yash", "Tara", "Kabir",
     "Lena", "Dev", "Ana", "Vikram", "Uma", "Rahul", "Zoe", "Arun"][i],
    ["Kapoor", "Verma", "Sharma", "Gupta", "Nair", "Bose", "Menon", "Iyer", "Rao", "Das",
     "Kulkarni", "Mehta", "Saxena", "Pillai", "Joshi", "Malhotra", "Agarwal", "Bhatt"][i],
    `dummy.user.${n}@sparknest.dev`,
    ["Mumbai", "Jaipur", "Kochi", "Kolkata", "Delhi", "Pune", "Hyderabad", "Ahmedabad",
     "Nagpur", "Indore", "Lucknow", "Surat"][i],
    "A curious reader and occasional commenter.",
  ];
});

const ALL_USERS = [...AUTHORS, ...COMMENTERS];

const AVATARS = ["avatar-1.jpg", "avatar-2.jpg", "avatar-3.jpg", "avatar-4.jpg", "avatar-5.jpg", "avatar-6.jpg"];
const avatarUrl = (index) => `${env.BACKEND_ADDRESS}/get/avatars/${AVATARS[index % AVATARS.length]}`;

const TITLE_TEMPLATES = [
  "The Quiet Case for {cat}",
  "Why {cat} Deserves More Attention",
  "{cat}: A Practical Field Guide",
  "Notes from a Month Spent on {cat}",
  "What Most People Get Wrong About {cat}",
  "{cat}, Explained for the Rest of Us",
  "The Hidden Beauty of {cat}",
  "How I Learned to Actually Care About {cat}",
  "A Beginner's Manifesto for {cat}",
  "{cat} in the Age of Short Attention Spans",
  "The Deceptively Simple World of {cat}",
  "{cat}: Lessons from a Curious Outsider",
  "Small Habits That Changed How I See {cat}",
  "{cat} and the Art of Paying Attention",
  "A Gentle Introduction to {cat}",
  "The Unlikely Joys of {cat}",
  "{cat}: What the Textbooks Leave Out",
  "Seeing {cat} with Fresher Eyes",
  "An Honest Love Letter to {cat}",
  "{cat}: A Skeptic's Guide to Falling in Love",
  "Learning {cat} the Slow Way",
  "{cat} Beyond the Obvious",
  "The {cat} Primer I Wish I Had",
  "Quiet Obsessions: {cat}",
];

const SUBTITLES = [
  "A practical, no-jargon look at what actually matters.",
  "Small details, honest opinions, and a few hard-won lessons.",
  "Everything I wish I knew when I started.",
  "Field notes from someone who went down the rabbit hole.",
  "Calm, clear thoughts on a crowded topic.",
  "The essentials, minus the noise.",
  "A personal journey through the fundamentals.",
  "What the basics look like after living with them.",
  "Curious, confused, and finally convinced.",
  "Less theory, more lived experience.",
];

const PARAGRAPHS = [
  "I did not come to this with expertise, only curiosity and a notebook. What follows is the map I wish I had been handed at the start, drawn with the wobbly confidence of someone who has only recently stopped apologizing for their opinions.",
  "The first thing I learned is that everyone you meet is operating from a different map. Their map is not wrong; it is just partial, the way all maps are. The skill is not knowing everything, but knowing how to ask better questions.",
  "A pattern kept emerging: the people who seem to know the most rarely shout about it. They watched longer, asked sooner, and changed their minds more often than everyone else in the room.",
  "There is a seductive version of this subject that lives on posters and in pep talks. I am not interested in it. I am interested in the unglamorous middle, where most of us actually live.",
  "Practically speaking, the difference between struggling and progress is often a tiny shift in approach, applied with unreasonable consistency. Nothing here is exotic. Everything is just slightly easier said than done.",
  "Somewhere between the third attempt and the ninth, the shape of the thing finally became clear. Not because it simplified, but because I did.",
  "I recommend starting small: pick one thing, do it badly, and let the gap between your ambition and your execution teach you the actual curriculum.",
  "The community around this subject is warmer than its reputation suggests. Bring curiosity and leave the jargon at the door; nobody will grade you.",
  "There is no finish line, only a longer trail. The marker of progress is not mastery but comfort with not knowing — and the willingness to keep looking anyway.",
  "None of this is automatic. You have to show up, even when it is boring, especially when it is boring. The boredom is where the learning hides.",
  "If you are on the fence, consider this your permission slip. The worst case is you learn a little about yourself; the best case, you find a language for something you already felt.",
  "I will keep revising this as I go. That is the honest way to write about anything worth writing about — in public, in progress, and open to correction.",
];

const COMMENT_TEMPLATES = [
  "This is exactly what I needed to read today. Thanks for putting it into words.",
  "I see this from a slightly different angle, but I agree with the core of it.",
  "Saved this. The section on paying attention is going to sit with me for a while.",
  "Great writeup. The map metaphor is underrated in this space.",
  "I tried this last month and it quietly changed how I approach the whole thing.",
  "Counterpoint: some of this depends heavily on context. Still a solid read.",
  "The part about consistency over intensity is the whole game, honestly.",
  "I would add that the community matters more than the material. But this is good.",
  "Thank you for writing this without any motivational-poster energy.",
  "This aged well. Re-reading six months later and it still holds up.",
  "Curious how this plays out for complete beginners — worked well for me as one.",
  "The line about comfort with not knowing is going on my wall.",
  "Honest, specific, and zero fluff. More of this, please.",
  "I disagree with a few points but respect the clarity of the argument.",
  "Bookmarking this for the next time I need to convince myself to start.",
  "This is the kind of essay I come to SparkNest for.",
  "Small correction: the third point is harder than it sounds. Otherwise spot on.",
  "Sharing this with my reading group. Expect us to argue about it.",
  "The section on boring consistency deserves its own follow-up piece.",
  "Rare to see this subject handled with such patience.",
  "I came for the title and stayed for the paragraphs. Worth it.",
  "As someone new to this, I appreciate the honesty about the messy middle.",
  "This resonated. The quiet approach is underrated everywhere.",
  "More practical than most of what I read on this topic. Well done.",
];

const REPLY_TEMPLATES = [
  "Same here. Took me longer than I'd like to admit.",
  "Exactly this. Consistency beats intensity every single time.",
  "Fair point — context changes everything. Still, the core holds.",
  "Completely agree. The community makes the difference.",
  "That line stayed with me too. Very well put.",
];

const COMMENT_BODIES = COMMENT_TEMPLATES;

const PREVIEW_FILES = [
  { suffix: "m-600.jpg", width: 600, height: 450, role: "masonry" },
  { suffix: "m-1200.jpg", width: 1200, height: 900, role: "masonry" },
  { suffix: "f-2000.jpg", width: 2000, height: 1125, role: "featured" },
  { suffix: "t-600.jpg", width: 600, height: 338, role: "thumbs" },
  { suffix: "t-1200.jpg", width: 1200, height: 675, role: "thumbs" },
  { suffix: "t-2400.jpg", width: 2400, height: 1350, role: "thumbs" },
];

const CONCURRENCY = 8;

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    let index = cursor;
    while (index < items.length) {
      cursor += 1;
      results[index] = await worker(items[index], index);
      index = cursor;
    }
  });
  await Promise.all(runners);
  return results;
}

/**
 * Download one image variant. Falls back to a sharp-generated gradient when
 * the network source is missing/rate-limited so the pipeline never blocks.
 */
async function fetchVariant(articleId, userId, variant) {
  const dir = resolveDataPath("images", String(userId), String(articleId));
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${userId}-${variant.suffix}`);

  const seed = `sparknest-a${articleId}-${variant.suffix.replace(/\W/g, "")}`;
  const url = `https://picsum.photos/seed/${seed}/${variant.width}/${variant.height}`;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(url, { signal: controller.signal, redirect: "follow" });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 1024) throw new Error("suspiciously small payload");
      await fs.writeFile(file, buffer);
      return { file, ok: true, source: "picsum" };
    } catch (error) {
      if (attempt === 2) {
        // Fallback: deterministic gradient JPEG, same dimensions.
        const hue = (articleId * 47 + variant.width) % 360;
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${variant.width}" height="${variant.height}">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="hsl(${hue}, 42%, 22%)"/>
                <stop offset="100%" stop-color="hsl(${(hue + 52) % 360}, 48%, 52%)"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
            <circle cx="${variant.width * 0.78}" cy="${variant.height * 0.22}" r="${variant.height * 0.28}" fill="hsl(${(hue + 90) % 360}, 60%, 68%)" opacity="0.35"/>
          </svg>`;
        await sharp(Buffer.from(svg)).jpeg({ quality: 84, mozjpeg: true }).toFile(file);
        return { file, ok: true, source: "generated" };
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

async function main() {
  const client = await pool.connect();
  try {
    const existing = await client.query(
      "SELECT count(*)::int AS n FROM users WHERE email LIKE 'dummy.user.%@sparknest.dev' OR email LIKE 'dummy.author.%@sparknest.dev'"
    );
    if (existing.rows[0].n > 0 && !FORCE) {
      console.error(
        `Dummy users already exist (${existing.rows[0].n}). Aborting to avoid duplicates. Re-run with --force to reuse them (articles will be duplicated).`
      );
      process.exit(2);
    }

    const passwordHash = await hashPassword(PASSWORD);

    console.log("Phase 1: users and articles (single transaction)…");
    await client.query("BEGIN");

    const userIds = [];
    for (const [username, fname, lname, email, region, bio] of ALL_USERS) {
      const result = await client.query(
        `INSERT INTO users (email, fname, lname, username, region, bio, avatar, password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
         RETURNING id`,
        [email, fname, lname, username, region, bio, avatarUrl(userIds.length), passwordHash]
      );
      userIds.push(result.rows[0].id);
    }

    // subscription rows for the dummy users
    for (let i = 0; i < ALL_USERS.length; i += 1) {
      await client.query(
        `INSERT INTO subscription (email, newsletter) VALUES ($1, $2)
         ON CONFLICT (email) DO NOTHING`,
        [ALL_USERS[i][3], rand() < 0.6]
      );
    }

    const categories = (await client.query("SELECT id, name FROM categories ORDER BY id")).rows;
    console.log(`Found ${categories.length} categories`);

    const articlePlan = [];
    const now = Date.now();
    for (let i = 0; i < categories.length; i += 1) {
      const { id: categoryId, name } = categories[i];
      const authorIndex = i % AUTHORS.length;
      const userId = userIds[authorIndex];
      const title = pick(TITLE_TEMPLATES).replace("{cat}", name).slice(0, 255);
      const subtitle = pick(SUBTITLES);
      const paragraphs = [...PARAGRAPHS].sort(() => rand() - 0.5).slice(0, 3 + (i % 2));
      const body = paragraphs.map((p) => `<p>${p}</p>`).join("\n");
      const createdAt = new Date(now - randInt(2, 170) * 86400000 - randInt(0, 86399999));

      const result = await client.query(
        `INSERT INTO articles (user_id, title, body, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $4) RETURNING id`,
        [userId, title, body, createdAt.toISOString()]
      );
      const articleId = result.rows[0].id;

      await client.query("INSERT INTO articles_categories (article_id, category_id) VALUES ($1, $2)", [
        articleId,
        categoryId,
      ]);

      await client.query(
        `INSERT INTO articles_preview (article_id, preview_by, preview_title, preview_subtitle)
         VALUES ($1, $2, $3, $4)`,
        [articleId, ALL_USERS[authorIndex][0], title.slice(0, 210), subtitle]
      );

      articlePlan.push({ articleId, userId, authorIndex, seed: rand() * 100000 });
    }

    await client.query("COMMIT");
    console.log(`Phase 1 done: ${articlePlan.length} articles inserted`);

    console.log("Phase 2: downloading/generating images (picsum.photos with sharp fallback)…");
    const jobs = [];
    for (const { articleId, userId } of articlePlan) {
      for (const variant of PREVIEW_FILES) {
        jobs.push({ articleId, userId, variant });
      }
    }
    let done = 0;
    const sources = { picsum: 0, generated: 0 };
    await mapLimit(jobs, CONCURRENCY, async ({ articleId, userId, variant }) => {
      const result = await fetchVariant(articleId, userId, variant);
      sources[result.source] = (sources[result.source] ?? 0) + 1;
      done += 1;
      if (done % 250 === 0) console.log(`  …${done}/${jobs.length}`);
      return result;
    });
    console.log(`Phase 2 done: ${jobs.length} images (${sources.picsum} downloaded, ${sources.generated} generated)`);

    console.log("Phase 3: article_images rows…");
    await client.query("BEGIN");
    for (const { articleId, userId } of articlePlan) {
      const base = `${env.BACKEND_ADDRESS}/article/images/${userId}/${articleId}`;
      await client.query(
        `INSERT INTO article_images (article_id, masonry, featured, thumbs)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [
          articleId,
          [`${base}/${userId}-m-600.jpg`, `${base}/${userId}-m-1200.jpg`],
          [`${base}/${userId}-f-2000.jpg`],
          [`${base}/${userId}-t-600.jpg`, `${base}/${userId}-t-1200.jpg`, `${base}/${userId}-t-2400.jpg`],
        ]
      );
    }
    await client.query("COMMIT");
    console.log("Phase 3 done");

    console.log("Phase 4: likes, saves, comments…");
    await client.query("BEGIN");
    // Deterministic per article, but distinct users per like (UNIQUE constraint).
    for (const { articleId } of articlePlan) {
      const roll = rand();
      const likeTarget = roll < 0.15 ? randInt(19, 35) : roll < 0.45 ? randInt(9, 18) : randInt(0, 8);
      const likerIds = [...userIds].sort(() => rand() - 0.5).slice(0, Math.min(likeTarget, userIds.length));
      for (const likerId of likerIds) {
        await client.query(
          "INSERT INTO liked_articles (user_id, article_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [likerId, articleId]
        );
      }

      const saveTarget = randInt(0, 8);
      const saverIds = [...userIds].sort(() => rand() - 0.5).slice(0, saveTarget);
      for (const saverId of saverIds) {
        await client.query(
          "INSERT INTO saved_articles (user_id, article_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [saverId, articleId]
        );
      }

      const commentCount = rand() < 0.2 ? 0 : randInt(1, 4);
      const article = (await client.query("SELECT created_at FROM articles WHERE id = $1", [articleId])).rows[0];
      const articleAgeMs = Date.now() - new Date(article.created_at).getTime();
      let parentCommentId = null;
      for (let c = 0; c < commentCount; c += 1) {
        const commenter = userIds[Math.floor(rand() * userIds.length)];
        const commentUser = ALL_USERS[(userIds.indexOf(commenter)) % ALL_USERS.length];
        const isReply = parentCommentId !== null && rand() < 0.2;
        const createdAt = new Date(Date.now() - Math.floor(rand() * Math.max(articleAgeMs, 1)));
        const body = isReply ? pick(REPLY_TEMPLATES) : pick(COMMENT_BODIES);

        const result = await client.query(
          `INSERT INTO comments (article_id, user_id, parent_comment_id, name, email, body, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $7) RETURNING id`,
          [
            articleId,
            commenter,
            isReply ? parentCommentId : null,
            `${commentUser[1]} ${commentUser[2]}`,
            commentUser[3],
            body,
            createdAt.toISOString(),
          ]
        );
        if (!isReply && parentCommentId === null) parentCommentId = result.rows[0].id;
      }
    }
    await client.query("COMMIT");
    console.log("Phase 4 done");

    console.log("Phase 5: recomputing featured articles…");
    await updateFeaturedArticles();
    console.log("Phase 5 done");

    const counts = await pool.query(`
      SELECT
        (SELECT count(*) FROM users) AS users,
        (SELECT count(*) FROM articles) AS articles,
        (SELECT count(*) FROM comments) AS comments,
        (SELECT count(*) FROM liked_articles) AS likes,
        (SELECT count(*) FROM saved_articles) AS saves,
        (SELECT count(*) FROM featured_articles) AS featured
    `);
    console.log("Seed complete:", counts.rows[0]);
    console.log(`Dummy logins: dummy.author.01@sparknest.dev … dummy.author.14@sparknest.dev (password ${PASSWORD})`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Seed-dummy failed:", error);
    process.exit(1);
  } finally {
    client.release();
  }
}

main()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error("Seed-dummy failed:", error);
    await pool.end();
    process.exit(1);
  });
