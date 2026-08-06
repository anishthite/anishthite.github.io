(function () {
  const esc = value => String(value || "").replace(/[&<>"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  }[character]));

  const slugify = value => String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project";

  const clone = value => JSON.parse(JSON.stringify(value));

  const projectSlug = project => project.slug || slugify(project.title);

  const projectPageUrl = project => `project.html?project=${encodeURIComponent(projectSlug(project))}`;

  const tagsToText = tags => Array.isArray(tags) ? tags.join(", ") : "";

  const textToTags = value => String(value || "")
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean);

  const linksToText = links => Array.isArray(links)
    ? links.map(link => `${link.label || ""} | ${link.url || ""}`).join("\n")
    : "";

  const textToLinks = value => String(value || "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [label, ...urlParts] = line.split("|");
      return {
        label: (label || "").trim(),
        url: urlParts.join("|").trim()
      };
    })
    .filter(link => link.label && link.url);

  const cleanProject = project => {
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
      if (project[key]) {
        cleaned[key] = project[key];
      }
    });

    if (project.slug && project.slug !== slugify(project.title)) {
      cleaned.slug = project.slug;
    }

    if (Array.isArray(project.relatedLinks) && project.relatedLinks.length) {
      cleaned.relatedLinks = project.relatedLinks;
    }

    cleaned.tags = Array.isArray(project.tags) ? project.tags : [];

    return cleaned;
  };

  const serialize = projects => `window.siteProjects = ${JSON.stringify(projects.map(cleanProject), null, 2)};\n`;

  class ProjectsEditor extends HTMLElement {
    connectedCallback() {
      this.projects = clone(window.siteProjects || []);
      const requested = new URLSearchParams(window.location.search).get("project");
      this.selectedIndex = Math.max(0, this.projects.findIndex(project => projectSlug(project) === requested));
      this.render();
      this.bind();
      this.select(this.selectedIndex);
    }

    render() {
      this.innerHTML = `
        <section class="projects-editor-shell">
          <header class="projects-editor-hero">
            <div>
              <h1>Project Editor</h1>
              <p>${this.projects.length} entries in <code>js/projects-data.js</code>.</p>
            </div>
            <div class="projects-editor-actions">
              <button type="button" data-action="add">New</button>
              <button type="button" data-action="duplicate">Duplicate</button>
              <button type="button" data-action="remove">Remove</button>
            </div>
          </header>

          <div class="projects-editor-layout">
            <aside class="projects-editor-list" aria-label="Projects">
              <label>
                <span>Search</span>
                <input type="search" data-role="search" autocomplete="off">
              </label>
              <div class="projects-editor-items"></div>
            </aside>

            <form class="projects-editor-form">
              <div class="projects-editor-form-grid">
                <label>
                  <span>Title</span>
                  <input name="title" type="text">
                </label>
                <label>
                  <span>Slug</span>
                  <input name="slug" type="text">
                </label>
                <label>
                  <span>Period</span>
                  <input name="period" type="text">
                </label>
                <label>
                  <span>Type</span>
                  <input name="type" type="text">
                </label>
                <label class="wide">
                  <span>Primary URL</span>
                  <input name="url" type="url">
                </label>
                <label class="wide">
                  <span>Summary</span>
                  <textarea name="summary" rows="3"></textarea>
                </label>
                <label class="wide">
                  <span>Details</span>
                  <textarea name="details" rows="5"></textarea>
                </label>
                <label>
                  <span>Tags</span>
                  <input name="tags" type="text">
                </label>
                <label>
                  <span>Thumbnail</span>
                  <input name="thumbnail" type="text">
                </label>
                <label class="wide">
                  <span>Visual</span>
                  <input name="visual" type="text">
                </label>
                <label class="wide">
                  <span>Related links</span>
                  <textarea name="relatedLinks" rows="5" spellcheck="false"></textarea>
                </label>
              </div>

              <div class="projects-editor-actions">
                <a data-role="render-link" href="project.html">Rendered page</a>
                <a data-role="primary-link" href="projects.html">Primary link</a>
              </div>

              <label class="projects-editor-output">
                <span>Generated file</span>
                <textarea data-role="output" rows="12" readonly spellcheck="false"></textarea>
              </label>

              <div class="projects-editor-actions">
                <button type="button" data-action="copy">Copy JS</button>
                <a data-role="download" download="projects-data.js">Download JS</a>
                <span data-role="status" aria-live="polite"></span>
              </div>
            </form>
          </div>
        </section>
      `;
    }

    bind() {
      this.items = this.querySelector(".projects-editor-items");
      this.form = this.querySelector(".projects-editor-form");
      this.output = this.querySelector('[data-role="output"]');
      this.status = this.querySelector('[data-role="status"]');
      this.search = this.querySelector('[data-role="search"]');
      this.renderLink = this.querySelector('[data-role="render-link"]');
      this.primaryLink = this.querySelector('[data-role="primary-link"]');
      this.download = this.querySelector('[data-role="download"]');

      this.search.addEventListener("input", () => this.renderList());
      this.form.addEventListener("input", () => this.updateCurrent());
      this.querySelectorAll("[data-action]").forEach(element => {
        element.addEventListener("click", () => this.runAction(element.dataset.action));
      });

      this.renderList();
    }

    runAction(action) {
      if (action === "add") {
        this.projects.unshift({
          title: "Untitled project",
          period: "2026",
          type: "Project",
          url: "",
          summary: "",
          details: "",
          tags: [],
          thumbnail: "",
          visual: ""
        });
        this.select(0);
      }

      if (action === "duplicate") {
        const copy = clone(this.currentProject());
        copy.title = `${copy.title || "Project"} copy`;
        copy.slug = slugify(copy.title);
        this.projects.splice(this.selectedIndex + 1, 0, copy);
        this.select(this.selectedIndex + 1);
      }

      if (action === "remove" && this.projects.length > 1) {
        this.projects.splice(this.selectedIndex, 1);
        this.select(Math.min(this.selectedIndex, this.projects.length - 1));
      }

      if (action === "copy") {
        this.copyOutput();
      }

      this.renderList();
      this.updateOutput();
    }

    currentProject() {
      return this.projects[this.selectedIndex] || this.projects[0];
    }

    select(index) {
      this.selectedIndex = index;
      const project = this.currentProject();

      this.form.elements.title.value = project.title || "";
      this.form.elements.slug.value = project.slug || projectSlug(project);
      this.form.elements.period.value = project.period || "";
      this.form.elements.type.value = project.type || "";
      this.form.elements.url.value = project.url || "";
      this.form.elements.summary.value = project.summary || "";
      this.form.elements.details.value = project.details || "";
      this.form.elements.tags.value = tagsToText(project.tags);
      this.form.elements.thumbnail.value = project.thumbnail || "";
      this.form.elements.visual.value = project.visual || "";
      this.form.elements.relatedLinks.value = linksToText(project.relatedLinks);

      this.updateLinks();
      this.renderList();
      this.updateOutput();
    }

    updateCurrent() {
      const project = this.currentProject();
      const slug = this.form.elements.slug.value.trim();

      project.title = this.form.elements.title.value.trim();
      project.slug = slug && slug !== slugify(project.title) ? slugify(slug) : "";
      project.period = this.form.elements.period.value.trim();
      project.type = this.form.elements.type.value.trim();
      project.url = this.form.elements.url.value.trim();
      project.summary = this.form.elements.summary.value.trim();
      project.details = this.form.elements.details.value.trim();
      project.tags = textToTags(this.form.elements.tags.value);
      project.thumbnail = this.form.elements.thumbnail.value.trim();
      project.visual = this.form.elements.visual.value.trim();
      project.relatedLinks = textToLinks(this.form.elements.relatedLinks.value);

      this.updateLinks();
      this.renderList();
      this.updateOutput();
    }

    updateLinks() {
      const project = this.currentProject();
      const pageUrl = projectPageUrl(project);

      this.renderLink.href = pageUrl;
      this.primaryLink.href = project.url || "projects.html";
      this.primaryLink.toggleAttribute("hidden", !project.url);
    }

    renderList() {
      const query = this.search.value.trim().toLowerCase();
      this.items.innerHTML = this.projects.map((project, index) => {
        const text = `${project.title || ""} ${project.type || ""} ${tagsToText(project.tags)}`.toLowerCase();

        if (query && !text.includes(query)) {
          return "";
        }

        return `
          <button type="button" data-index="${index}" aria-pressed="${index === this.selectedIndex}">
            <span>${esc(project.title || "Untitled project")}</span>
            <small>${esc(project.period || "")} ${esc(project.type || "")}</small>
          </button>
        `;
      }).join("");

      this.items.querySelectorAll("[data-index]").forEach(button => {
        button.addEventListener("click", () => this.select(Number(button.dataset.index)));
      });
    }

    updateOutput() {
      const output = serialize(this.projects);
      const blob = new Blob([output], {type: "text/javascript"});

      this.output.value = output;
      if (this.download.href) {
        URL.revokeObjectURL(this.download.href);
      }
      this.download.href = URL.createObjectURL(blob);
    }

    async copyOutput() {
      try {
        await navigator.clipboard.writeText(this.output.value);
        this.status.textContent = "Copied.";
      } catch (error) {
        this.output.select();
        this.status.textContent = "Select and copy from the textarea.";
      }
    }
  }

  customElements.define("projects-editor", ProjectsEditor);
}());
