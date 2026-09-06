#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, ".context", "onetab-extracted-urls.md");
const templatePath = path.join(__dirname, "index.template.html");
const outputPath = path.join(__dirname, "index.html");

const source = fs.readFileSync(sourcePath, "utf8");
const pages = [];
const links = [];
let currentPage = null;
let currentHost = null;
const namedEntities = {
  amp: "&",
  apos: "'",
  bull: "•",
  hellip: "…",
  ldquo: "“",
  lsquo: "‘",
  mdash: "—",
  ndash: "–",
  nbsp: " ",
  quot: '"',
  rdquo: "”",
  rsquo: "’",
};

function cleanTitle(value) {
  return value
    .replace(/\\([_*\[\]<>])/g, "$1")
    .replace(/&([a-z]+);/gi, (entity, name) => namedEntities[name.toLowerCase()] || entity);
}

for (const line of source.split(/\r?\n/)) {
  const pageMatch = line.match(/^## Page (\d+) — \[(.*?)\]\(<(https?:\/\/[^>]+)>\)/);
  if (pageMatch) {
    currentPage = {
      number: Number(pageMatch[1]),
      title: pageMatch[2],
      sourceUrl: pageMatch[3],
    };
    pages.push(currentPage);
    currentHost = null;
    continue;
  }

  const hostMatch = line.match(/^### (.+?) \(\d+\)$/);
  if (hostMatch) {
    currentHost = hostMatch[1];
    continue;
  }

  const itemMatch = line.match(/^(\d+)\.\s+(.*?)\s+—\s+<(https?:\/\/[^>]+)>$/);
  if (itemMatch && currentPage && currentHost) {
    links.push({
      page: currentPage.number,
      position: Number(itemMatch[1]),
      host: currentHost,
      title: cleanTitle(itemMatch[2]),
      url: itemMatch[3],
    });
  }
}

if (!links.length) {
  throw new Error("No saved links could be read from .context/onetab-extracted-urls.md.");
}

const uniqueUrls = new Set(links.map((link) => link.url)).size;
const hosts = [...new Set(links.map((link) => link.host))];
const data = {
  pages,
  links,
  summary: {
    savedLinks: links.length,
    uniqueUrls,
    hosts: hosts.length,
  },
};

const serializedData = JSON.stringify(data)
  .replace(/</g, "\\u003c")
  .replace(/>/g, "\\u003e")
  .replace(/&/g, "\\u0026");
const template = fs.readFileSync(templatePath, "utf8");
const output = template.replace("/*__READING_LIBRARY_DATA__*/", `window.READING_LIBRARY = ${serializedData};`);

fs.writeFileSync(outputPath, output);
console.log(`Built ${outputPath} with ${links.length} saved links from ${pages.length} source pages.`);
