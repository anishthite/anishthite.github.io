(function () {
  const projects = window.siteProjects || [];

  const filters = [
    {label: "All", value: "all"},
    {label: "Tools", value: "tools"},
    {label: "Research", value: "research"},
    {label: "Experiments", value: "experiments"}
  ];

  const views = [
    {label: "Cards", value: "cards"},
    {label: "Timeline", value: "timeline"}
  ];

  const palettes = [
    ["#fffff8", "#111111", "#8b0000"],
    ["#fffff8", "#111111", "#2a623d"],
    ["#fffff8", "#111111", "#3a5a8c"],
    ["#fffff8", "#111111", "#8b0000"],
    ["#fffff8", "#111111", "#2a623d"],
    ["#fffff8", "#111111", "#3a5a8c"]
  ];

  const esc = value => String(value).replace(/[&<>"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  }[character]));

  const projectKind = project => {
    const text = `${project.type} ${project.tags.join(" ")}`.toLowerCase();

    if (text.includes("research") || text.includes("automl") || text.includes("language models") || text.includes("gtri")) {
      return "research";
    }

    if (text.includes("agent") || text.includes("tool") || text.includes("extension") || text.includes("bot") || text.includes("status") || text.includes("terminal") || text.includes("desktop") || text.includes("shipping")) {
      return "tools";
    }

    return "experiments";
  };

  const timelineYear = project => {
    const years = String(project.period).match(/\d{4}/g) || [];
    return years.length ? Math.max(...years.map(Number)) : 0;
  };

  const wrap = (text, max) => {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";

    words.forEach(word => {
      if ((line + " " + word).trim().length > max && line) {
        lines.push(line);
        line = word;
      } else {
        line = (line + " " + word).trim();
      }
    });

    if (line) {
      lines.push(line);
    }

    return lines.slice(0, 3);
  };

  const preview = (project, index) => {
    const [bg, ink, accent] = palettes[index % palettes.length];
    const visual = wrap(project.visual || project.tags.join(" - "), 32)
      .map((line, lineIndex) => `<text x="38" y="${278 + lineIndex * 27}" font-size="22" fill="${accent}">${esc(line)}</text>`)
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400">
      <rect width="640" height="400" fill="${bg}"/>
      <rect x="38" y="38" width="564" height="324" fill="none" stroke="${ink}" opacity=".22"/>
      <path d="M0 318 C150 250 270 380 420 300 S570 225 640 280" fill="none" stroke="${accent}" stroke-width="3" opacity=".7"/>
      <path d="M70 72 H570 M70 112 H570 M70 340 H570" stroke="${ink}" opacity=".28"/>
      <path d="M92 210 C190 135 260 250 350 175 S480 145 552 214" fill="none" stroke="${ink}" stroke-width="2" opacity=".42"/>
      ${visual}
    </svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  class ProjectCard extends HTMLElement {
    set data(value) {
      this.project = value.project;
      this.index = value.index;
      this.render();
    }

    render() {
      if (!this.project) {
        return;
      }

      const project = this.project;
      const kind = projectKind(project);

      this.innerHTML = `
        <a class="project-card" href="${esc(project.url)}" data-kind="${kind}" aria-label="${esc(project.title)} project">
          <img class="project-image" src="${preview(project, this.index)}" alt="">
          <div class="project-body">
            <div>
              <h2 class="project-title">${esc(project.title)}</h2>
              <p class="project-summary">${esc(project.summary)}</p>
              <p class="project-time">${esc(project.period)} - ${esc(project.type)}</p>
            </div>
            <div class="project-tags">${project.tags.map(tag => `<span>${esc(tag)}</span>`).join("")}</div>
          </div>
        </a>
      `;
    }
  }

  class ProjectsSection extends HTMLElement {
    connectedCallback() {
      this.embedded = this.hasAttribute("embedded");
      this.activeFilter = "all";
      this.activeView = "cards";
      this.classList.toggle("projects-section-embedded", this.embedded);
      this.renderShell();
      this.renderProjects();
    }

    renderShell() {
      const headingTag = this.embedded ? "h2" : "h1";
      const controls = this.embedded ? "" : `
          <div class="projects-controls">
            <div class="project-view-tabs view-tabs" role="group" aria-label="Project view">
              ${views.map(view => `
                <button type="button" data-view="${view.value}" aria-pressed="${view.value === this.activeView}">${view.label}</button>
              `).join("")}
            </div>
            <div class="project-tabs" role="group" aria-label="Project filters">
              ${filters.map(filter => `
                <button type="button" data-filter="${filter.value}" aria-pressed="${filter.value === this.activeFilter}">${filter.label}</button>
              `).join("")}
            </div>
          </div>
      `;

      this.innerHTML = `
        <header class="projects-hero">
          <div>
            <${headingTag}>Projects</${headingTag}>
            <p>Small tools, agent workflows, explainers, research artifacts, and web experiments.</p>
          </div>
          ${controls}
        </header>

        <p class="project-count"${this.embedded ? " hidden" : ""}></p>
        <section class="projects-grid" aria-label="Project cards"></section>
        <section class="projects-timeline" aria-label="Project timeline" hidden></section>
      `;

      this.querySelectorAll("[data-view]").forEach(button => {
        button.addEventListener("click", () => {
          this.activeView = button.dataset.view;
          this.updateViewState();
        });
      });

      this.querySelectorAll("[data-filter]").forEach(button => {
        button.addEventListener("click", () => {
          this.activeFilter = button.dataset.filter;
          this.updateFilterState();
          this.renderProjects();
        });
      });
    }

    updateFilterState() {
      this.querySelectorAll("[data-filter]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.filter === this.activeFilter));
      });
    }

    updateViewState() {
      this.querySelectorAll("[data-view]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.view === this.activeView));
      });

      this.querySelector(".projects-grid").hidden = this.activeView !== "cards";
      this.querySelector(".projects-timeline").hidden = this.activeView !== "timeline";
      this.updateCount(this.currentProjects || []);
    }

    visibleProjects() {
      return this.activeFilter === "all"
        ? projects
        : projects.filter(project => projectKind(project) === this.activeFilter);
    }

    updateCount(visibleProjects) {
      const count = this.querySelector(".project-count");
      const noun = visibleProjects.length === 1 ? "project" : "projects";
      const view = this.activeView === "timeline" ? "timeline" : "cards";

      count.textContent = `${visibleProjects.length} ${noun} shown as ${view}`;
    }

    renderProjects() {
      const visibleProjects = this.visibleProjects();
      const grid = this.querySelector(".projects-grid");
      const timeline = this.querySelector(".projects-timeline");

      this.currentProjects = visibleProjects;
      this.updateCount(visibleProjects);
      grid.replaceChildren(...visibleProjects.map((project, index) => {
        const card = document.createElement("project-card");
        card.data = {project, index};
        return card;
      }));
      timeline.innerHTML = this.renderTimeline(visibleProjects);
      this.updateViewState();
    }

    renderTimeline(visibleProjects) {
      const groupedProjects = visibleProjects
        .map((project, index) => ({project, index, year: timelineYear(project)}))
        .sort((first, second) => second.year - first.year || first.index - second.index)
        .reduce((groups, item) => {
          const lastGroup = groups[groups.length - 1];

          if (lastGroup && lastGroup.year === item.year) {
            lastGroup.items.push(item);
          } else {
            groups.push({year: item.year, items: [item]});
          }

          return groups;
        }, []);

      return groupedProjects.map(group => `
        <section class="timeline-year" aria-label="${esc(group.year)} projects">
          <h2>${esc(group.year)}</h2>
          <div class="timeline-items">
            ${group.items.map(({project}) => `
              <article class="timeline-item">
                <div>
                  <a class="timeline-title" href="${esc(project.url)}">${esc(project.title)}</a>
                  <p class="timeline-summary">${esc(project.summary)}</p>
                </div>
                <p class="timeline-meta">${esc(project.period)} - ${esc(project.type)}</p>
              </article>
            `).join("")}
          </div>
        </section>
      `).join("");
    }
  }

  customElements.define("project-card", ProjectCard);
  customElements.define("projects-section", ProjectsSection);
}());
