#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "js", "projects-data.js");
const backupDir = path.join(root, ".context", "project-editor-backups");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || process.argv[2] || 8088);
const maxBodyBytes = 1024 * 1024;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const slugify = value => String(value || "")
  .toLowerCase()
  .replace(/&/g, " and ")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "") || "project";

const projectKeyOrder = [
  "title",
  "slug",
  "period",
  "type",
  "url",
  "summary",
  "details",
  "primaryLabel",
  "relatedLinks",
  "tags",
  "thumbnail",
  "visual"
];

const readProjects = () => parseProjectsSource(fs.readFileSync(dataPath, "utf8"));

function parseProjectsSource(source) {
  const sandbox = {window: {}};
  vm.runInNewContext(source, sandbox, {
    filename: "projects-data.js",
    timeout: 1000
  });

  if (!Array.isArray(sandbox.window.siteProjects)) {
    throw new Error("projects-data.js did not assign window.siteProjects to an array");
  }

  return sandbox.window.siteProjects;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeProjects(projects) {
  if (!Array.isArray(projects)) {
    throw new Error("Expected projects to be an array");
  }

  return projects.map((project, index) => {
    if (!project || typeof project !== "object" || Array.isArray(project)) {
      throw new Error(`Project ${index + 1} is not an object`);
    }

    const cleaned = {};

    [
      "title",
      "period",
      "type",
      "url",
      "summary",
      "details",
      "primaryLabel",
      "thumbnail",
      "visual"
    ].forEach(key => {
      const value = normalizeString(project[key]);

      if (value) {
        cleaned[key] = value;
      }
    });

    if (!cleaned.title) {
      throw new Error(`Project ${index + 1} needs a title`);
    }

    const rawSlug = normalizeString(project.slug);
    const slug = rawSlug ? slugify(rawSlug) : "";
    if (slug && slug !== slugify(cleaned.title)) {
      cleaned.slug = slug;
    }

    if (Array.isArray(project.relatedLinks)) {
      const relatedLinks = project.relatedLinks
        .map(link => ({
          label: normalizeString(link && link.label),
          url: normalizeString(link && link.url)
        }))
        .filter(link => link.label && link.url);

      if (relatedLinks.length) {
        cleaned.relatedLinks = relatedLinks;
      }
    }

    cleaned.tags = Array.isArray(project.tags)
      ? project.tags.map(tag => normalizeString(tag)).filter(Boolean)
      : [];

    return cleaned;
  });
}

const inlineArray = values => `[${values.map(value => JSON.stringify(value)).join(", ")}]`;

const inlineLink = link => `{label: ${JSON.stringify(link.label)}, url: ${JSON.stringify(link.url)}}`;

function serializeProject(project) {
  const entries = projectKeyOrder
    .filter(key => Object.prototype.hasOwnProperty.call(project, key))
    .map(key => {
      if (key === "relatedLinks") {
        return `relatedLinks: [\n      ${project.relatedLinks.map(inlineLink).join(",\n      ")}\n    ]`;
      }

      if (key === "tags") {
        return `tags: ${inlineArray(project.tags)}`;
      }

      return `${key}: ${JSON.stringify(project[key])}`;
    });

  return `  {\n    ${entries.join(",\n    ")}\n  }`;
}

const serializeProjects = projects => {
  const normalizedProjects = normalizeProjects(projects);
  return `window.siteProjects = [\n${normalizedProjects.map(serializeProject).join(",\n")}\n];\n`;
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendText(response, status, message) {
  response.writeHead(status, {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(message);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.setEncoding("utf8");
    request.on("data", chunk => {
      body += chunk;

      if (Buffer.byteLength(body, "utf8") > maxBodyBytes) {
        reject(new Error("Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function handleApi(request, response, pathname) {
  if (pathname === "/api/health") {
    sendJson(response, 200, {ok: true});
    return;
  }

  if (pathname !== "/api/projects") {
    sendJson(response, 404, {ok: false, error: "Unknown API route"});
    return;
  }

  if (request.method === "GET") {
    const projects = readProjects();
    sendJson(response, 200, {
      ok: true,
      path: path.relative(root, dataPath),
      projects
    });
    return;
  }

  if (request.method === "PUT") {
    const body = await readBody(request);
    const payload = JSON.parse(body);
    const source = serializeProjects(payload.projects);

    parseProjectsSource(source);
    fs.mkdirSync(backupDir, {recursive: true});

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `projects-data-${stamp}.js`);
    fs.copyFileSync(dataPath, backupPath);
    fs.writeFileSync(dataPath, source, "utf8");

    sendJson(response, 200, {
      ok: true,
      path: path.relative(root, dataPath),
      backup: path.relative(root, backupPath),
      projectCount: payload.projects.length
    });
    return;
  }

  sendJson(response, 405, {ok: false, error: "Use GET or PUT"});
}

function resolveStaticPath(pathname) {
  const requestedPath = pathname === "/" ? "/projects-editor.html" : pathname;
  const decoded = decodeURIComponent(requestedPath);
  const resolved = path.resolve(root, `.${decoded}`);

  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  return resolved;
}

function serveStatic(request, response, pathname) {
  const resolved = resolveStaticPath(pathname);

  if (!resolved) {
    sendText(response, 403, "Forbidden");
    return;
  }

  fs.stat(resolved, (statError, stats) => {
    if (statError) {
      sendText(response, 404, "Not found");
      return;
    }

    const filePath = stats.isDirectory() ? path.join(resolved, "index.html") : resolved;
    const extension = path.extname(filePath);

    fs.readFile(filePath, (readError, contents) => {
      if (readError) {
        sendText(response, 404, "Not found");
        return;
      }

      response.writeHead(200, {
        "content-type": mimeTypes[extension] || "application/octet-stream",
        "cache-control": "no-store"
      });
      response.end(contents);
    });
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);

  if (url.pathname.startsWith("/api/")) {
    handleApi(request, response, url.pathname).catch(error => {
      sendJson(response, 400, {
        ok: false,
        error: error.message
      });
    });
    return;
  }

  serveStatic(request, response, url.pathname);
});

server.listen(port, host, () => {
  console.log(`Project editor: http://${host}:${port}/projects-editor.html`);
  console.log(`Saving to: ${path.relative(root, dataPath)}`);
});
