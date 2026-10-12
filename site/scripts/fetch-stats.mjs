// Scrapes the extension's rating and user count from the Chrome Web Store and
// writes them to src/stats.json, which the site imports at build time.
// Never fails the build: on any error the existing stats.json is left as-is.
import { readFile, writeFile } from "node:fs/promises";

const contentPath = new URL("../src/content.ts", import.meta.url);
const statsPath = new URL("../src/stats.json", import.meta.url);

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

function parseUsers(html) {
  const text = stripTags(html);
  const match = text.match(/([\d][\d,.\s]*)\+?\s*users/i);
  if (!match) return null;
  return parseInt(match[1].replace(/[.,\s]/g, ""), 10);
}

function parseRating(html) {
  const jsonLd = html.match(/"ratingValue"\s*:\s*"?([\d.]+)"?/i);
  if (jsonLd) return parseFloat(jsonLd[1]);

  const aria = html.match(/aria-label="([\d.]+)\s+out\s+of\s+5/i);
  if (aria) return parseFloat(aria[1]);

  const match = stripTags(html).match(/([\d.]+)\s+out\s+of\s+5/i);
  return match ? parseFloat(match[1]) : null;
}

async function main() {
  const content = await readFile(contentPath, "utf8");
  const id = content.match(/\bid:\s*["']([a-p]{32})["']/)?.[1];
  if (!id) throw new Error("extension id not found in content.ts");

  const res = await fetch(`https://chromewebstore.google.com/detail/${id}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();
  // The store reports 0 for extensions with no ratings yet; hide it instead.
  const rating = parseRating(html);
  const stats = {
    rating: rating ? rating : null,
    users: parseUsers(html),
    fetchedAt: new Date().toISOString(),
  };
  if (stats.rating === null && stats.users === null) {
    throw new Error("could not parse rating or users");
  }

  await writeFile(statsPath, `${JSON.stringify(stats, null, 2)}\n`);
  console.log("stats:", stats);
}

main().catch((e) => {
  console.warn(`fetch-stats skipped: ${e.message}`);
});
