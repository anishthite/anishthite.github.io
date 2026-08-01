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

  customElements.define("project-page", ProjectPage);
}());
