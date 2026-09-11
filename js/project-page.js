(function () {
  const esc = value => String(value || "").replace(/[&<>"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  }[character]));

  const splitList = value => String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

  const slugify = value => String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project";

  const projectSlug = project => project.slug || slugify(project.title);

  const projectPageUrl = project => `project.html?project=${encodeURIComponent(projectSlug(project))}`;

  const projectRelatedLinks = project => Array.isArray(project.relatedLinks)
    ? project.relatedLinks.filter(link => link && link.url && link.label)
    : [];

  const setMetaDescription = description => {
    let meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", description);
  };

  class ProjectPage extends HTMLElement {
    connectedCallback() {
      if (this.hasAttribute("data-rendered")) {
        return;
      }

      const content = this.innerHTML.trim();
      const title = this.getAttribute("project-title") || "Untitled project";
      const summary = this.getAttribute("summary") || "";
      const period = this.getAttribute("period") || "";
      const type = this.getAttribute("type") || "";
      const status = this.getAttribute("status") || "";
      const tags = splitList(this.getAttribute("tags"));
      const primaryUrl = this.getAttribute("primary-url") || "";
      const primaryLabel = this.getAttribute("primary-label") || "Open project";
      const repoUrl = this.getAttribute("repo-url") || "";
      const repoLabel = this.getAttribute("repo-label") || "Source";
      const facts = [
        ["Period", period],
        ["Type", type],
        ["Status", status]
      ].filter(([, value]) => value);

      document.title = `${title} - Anish Thite`;
      this.setAttribute("data-rendered", "true");
      this.innerHTML = `
        <article class="project-detail">
          <header class="project-detail-hero">
            <p class="project-detail-kicker">${esc(type || "Project")}</p>
            <h1>${esc(title)}</h1>
            ${summary ? `<p class="project-detail-summary">${esc(summary)}</p>` : ""}
            <nav class="project-detail-links" aria-label="Project links">
              ${primaryUrl ? `<a href="${esc(primaryUrl)}">${esc(primaryLabel)}</a>` : ""}
              ${repoUrl ? `<a href="${esc(repoUrl)}">${esc(repoLabel)}</a>` : ""}
              <a href="projects.html">All projects</a>
            </nav>
            ${tags.length ? `<div class="project-detail-tags">${tags.map(tag => `<span>${esc(tag)}</span>`).join("")}</div>` : ""}
          </header>

          <div class="project-detail-body">
            <div class="project-detail-content">
              ${content}
            </div>
            <aside class="project-detail-sidebar" aria-label="Project facts">
              <dl>
                ${facts.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}
              </dl>
            </aside>
          </div>
        </article>
      `;
    }
  }

  class ProjectDetailView extends HTMLElement {
    connectedCallback() {
      const projects = window.siteProjects || [];
      const params = new URLSearchParams(window.location.search);
      const requestedSlug = params.get("project") || params.get("slug") || window.location.hash.slice(1);
      const project = projects.find(item => projectSlug(item) === requestedSlug);

      if (!requestedSlug || !project) {
        this.renderIndex(projects, requestedSlug);
        return;
      }

      this.renderProject(project);
    }

    renderIndex(projects, requestedSlug) {
      document.title = "Project pages - Anish Thite";
      setMetaDescription("Rendered project detail pages for Anish Thite's project catalog.");

      this.innerHTML = `
        <article class="project-detail">
          <header class="project-detail-hero">
            <p class="project-detail-kicker">Project pages</p>
            <h1>${requestedSlug ? "Project not found" : "Project pages"}</h1>
            <p class="project-detail-summary">${requestedSlug ? `No project matched ${esc(requestedSlug)}.` : "Choose a project to open its rendered detail page."}</p>
            <nav class="project-detail-links" aria-label="Project links">
              <a href="projects.html">All projects</a>
            </nav>
          </header>

          <div class="project-list-rendered">
            ${projects.map(project => `
              <article>
                <a href="${esc(projectPageUrl(project))}">${esc(project.title)}</a>
                <span>${esc(project.period)} - ${esc(project.type)}</span>
              </article>
            `).join("")}
          </div>
        </article>
      `;
    }

    renderProject(project) {
      const tags = Array.isArray(project.tags) ? project.tags : [];
      const relatedLinks = projectRelatedLinks(project);
      const primaryLabel = project.primaryLabel || "Open project";

      document.title = `${project.title} - Anish Thite`;
      setMetaDescription(project.summary || `Project page for ${project.title}.`);

      this.innerHTML = `
        <article class="project-detail">
          <header class="project-detail-hero">
            <p class="project-detail-kicker">${esc(project.type || "Project")}</p>
            <h1>${esc(project.title)}</h1>
            ${project.summary ? `<p class="project-detail-summary">${esc(project.summary)}</p>` : ""}
            <nav class="project-detail-links" aria-label="Project links">
              ${project.url ? `<a href="${esc(project.url)}">${esc(primaryLabel)}</a>` : ""}
              <a href="projects.html">All projects</a>
            </nav>
            ${tags.length ? `<div class="project-detail-tags">${tags.map(tag => `<span>${esc(tag)}</span>`).join("")}</div>` : ""}
          </header>

          <div class="project-detail-body">
            <div class="project-detail-content">
              <section>
                <h2>What it is</h2>
                ${project.summary ? `<p>${esc(project.summary)}</p>` : ""}
                ${project.details ? `<p>${esc(project.details)}</p>` : ""}
              </section>

              ${relatedLinks.length ? `
                <section>
                  <h2>Links</h2>
                  <div class="project-detail-link-list">
                    ${relatedLinks.map(link => `<a href="${esc(link.url)}">${esc(link.label)}</a>`).join("")}
                  </div>
                </section>
              ` : ""}
            </div>

            <aside class="project-detail-sidebar" aria-label="Project facts">
              <dl>
                ${[
                  ["Period", project.period],
                  ["Type", project.type],
                  ["Primary link", project.url]
                ].filter(([, value]) => value).map(([label, value]) => `
                  <div>
                    <dt>${esc(label)}</dt>
                    <dd>${label === "Primary link" ? `<a href="${esc(value)}">${esc(value)}</a>` : esc(value)}</dd>
                  </div>
                `).join("")}
              </dl>
            </aside>
          </div>
        </article>
      `;
    }
  }

  customElements.define("project-page", ProjectPage);
  customElements.define("project-detail-view", ProjectDetailView);
}());
