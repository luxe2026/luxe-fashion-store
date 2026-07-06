// Prerender static HTML for each product page + shop page.
// This solves the GitHub Pages 404-status issue: instead of relying on the
// 404.html SPA fallback (which returns HTTP 404 and blocks Google indexing),
// we generate a real /product/{slug}/index.html for every product so GitHub
// Pages returns 200 with the actual SEO content + structured data.

import fs from "fs";
import path from "path";

const SITE_URL = "https://luxe2026.github.io/luxe-fashion-store";
const root = path.resolve(".");
const distDir = path.join(root, "dist");
const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");

// --- Extract product data from src/data/products.ts via regex ---
const productsSrc = fs.readFileSync(
  path.join(root, "src/data/products.ts"),
  "utf-8",
);

// Regex matches each product object. name/description can use single OR double
// quotes (the source file mixes both), so we use a backreference to pair them.
// Capture groups:
//  1=id 2=slug 3=nameQuote 4=name 5=category 6=price
//  7=descQuote 8=description 9=firstImage 10=rating 11=reviewCount 12=stock
const productRegex =
  /\{\s*id:\s*(\d+),\s*slug:\s*'([^']+)',\s*name:\s*(["'])([\s\S]*?)\3,\s*category:\s*'([^']+)',\s*price:\s*([\d.]+),\s*description:\s*(["'])([\s\S]*?)\7[\s\S]*?images:\s*\['([^']+)'[\s\S]*?rating:\s*([\d.]+),\s*reviewCount:\s*(\d+)[\s\S]*?stock:\s*(\d+)/g;

const products = [];
let m;
while ((m = productRegex.exec(productsSrc)) !== null) {
  products.push({
    slug: m[2],
    name: m[4],
    category: m[5],
    price: parseFloat(m[6]),
    description: m[8],
    image: m[9],
    rating: parseFloat(m[10]),
    reviewCount: parseInt(m[11], 10),
    stock: parseInt(m[12], 10),
  });
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildProductHtml(p) {
  const title = `${p.name} | Aurelia`;
  const desc =
    p.description.length > 160
      ? p.description.slice(0, 157) + "..."
      : p.description;

  let html = template
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${escapeAttr(title)}</title>`,
    )
    .replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${escapeAttr(desc)}"`,
    )
    .replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${escapeAttr(title)}"`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*"/,
      `<meta property="og:description" content="${escapeAttr(desc)}"`,
    )
    .replace(
      /<meta property="og:url" content="[^"]*"/,
      `<meta property="og:url" content="${SITE_URL}/product/${p.slug}/"`,
    )
    .replace(
      /<meta property="og:image" content="[^"]*"/,
      `<meta property="og:image" content="${p.image}"`,
    )
    .replace(
      /<meta property="og:type" content="[^"]*"/,
      `<meta property="og:type" content="product"`,
    )
    .replace(
      /<link rel="canonical" href="[^"]*"/,
      `<link rel="canonical" href="${SITE_URL}/product/${p.slug}/"`,
    );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: [p.image],
    sku: p.slug,
    category: p.category,
    brand: { "@type": "Brand", name: "Aurelia" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: p.reviewCount,
    },
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "USD",
      availability:
        p.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${p.slug}/`,
    },
  };

  // Insert product JSON-LD right before the Organization JSON-LD / </head>
  html = html.replace(
    "</head>",
    `  <script type="application/ld+json">\n    ${JSON.stringify(jsonLd)}\n    </script>\n  </head>`,
  );

  return html;
}

// --- Generate each product page ---
let count = 0;
for (const p of products) {
  const dir = path.join(distDir, "product", p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), buildProductHtml(p));
  count++;
}

// --- Generate /shop page ---
const shopDesc =
  "Browse the full Aurelia collection — dresses, sets, denim, jumpsuits and more. Free worldwide shipping over $150.";
let shopHtml = template
  .replace(
    /<title>[^<]*<\/title>/,
    `<title>Shop All | Aurelia — Curated Fashion</title>`,
  )
  .replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${escapeAttr(shopDesc)}"`,
  )
  .replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="Shop All | Aurelia — Curated Fashion"`,
  )
  .replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${escapeAttr(shopDesc)}"`,
  )
  .replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${SITE_URL}/shop/"`,
  )
  .replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${SITE_URL}/shop/"`,
  );
const shopDir = path.join(distDir, "shop");
fs.mkdirSync(shopDir, { recursive: true });
fs.writeFileSync(path.join(shopDir, "index.html"), shopHtml);

console.log(`✓ Prerendered ${count} product pages + 1 shop page`);
