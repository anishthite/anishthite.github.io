(function () {
  const projects = [
    {"title":"AiLight","period":"2020","type":"NLP app","url":"essays/ailight.html","summary":"Highlights key sentences inside PDFs so summaries stay attached to context.","tags":["NLP","documents","reading"],"visual":"PDF -> highlights -> context"},
    {"title":"Language model evaluation work","period":"2020-2025","type":"Research","url":"https://scholar.google.com/citations?hl=en&user=HYCsOdoAAAAJ","summary":"Public research entries connected to The Pile and EleutherAI's language model evaluation harness.","tags":["language models","evaluation","datasets"],"visual":"benchmarks for language models"},
    {"title":"AutoML / evolutionary search","period":"2019-2022","type":"Research","url":"https://scholar.google.com/citations?hl=en&user=HYCsOdoAAAAJ","summary":"Georgia Tech / GTRI work around genetic programming, neural architecture search, and evolved SimGANs.","tags":["AutoML","genetic programming","GTRI"],"visual":"evolve -> test -> select"},
    {"title":"Commiter","period":"2026","type":"Web app","url":"https://github.com/anishthite/commiter","summary":"A website to track if you are shipping.","tags":["shipping","tools"],"visual":"ship streaks and momentum"},
    {"title":"Agent tools / dotfiles","period":"2026","type":"Developer tooling","url":"https://github.com/anishthite/agent-dotfiles","summary":"Versioned config and skills for coding agents across Claude Code, Codex, pi, Gemini, and related workflows.","tags":["agents","tools","workflow"],"visual":"prompts, skills, configs"},
    {"title":"Pacman Prompts","period":"2024","type":"Agent tooling","url":"https://github.com/anishthite/pacman-prompts","summary":"Prompting as code: a small repo for treating reusable prompts like buildable software.","tags":["prompts","python","agents"],"visual":"prompt files as code"},
    {"title":"Pi Effort","period":"2026","type":"Pi extension","url":"https://github.com/anishthite/pi-effort","summary":"A slash command for quickly setting thinking effort in pi.","tags":["pi","typescript","agent UX"],"visual":"/effort low -> high"},
    {"title":"Work in a Cafe","period":"2026","type":"Web toy","url":"https://github.com/anishthite/workinacafe","summary":"A small ambient place for working in a cafe.","tags":["ambient","web","toy"],"visual":"tables, noise, focus"},
    {"title":"Gaslight","period":"2026","type":"LLM toy","url":"https://github.com/anishthite/gaslight","summary":"A place for you to gaslight an LLM.","tags":["LLM","web toy"],"visual":"conversation pressure test"},
    {"title":"Smash TV","period":"2026","type":"Video site","url":"https://github.com/anishthite/smash-tv","summary":"A retro TV channel that plays videos from an archive.org collection.","tags":["video","archive","retro"],"visual":"channel surfing archive video"},
    {"title":"Color Lift","period":"2026","type":"Chrome extension","url":"https://github.com/anishthite/color-lift","summary":"A browser extension that lifts colors from a page to turn them into a theme.","tags":["extension","color","themes"],"visual":"sample -> palette -> theme"},
    {"title":"Markdowny","period":"2026","type":"Desktop app","url":"https://github.com/anishthite/markdowny","summary":"A tiny desktop markdown reader.","tags":["desktop","markdown","typescript"],"visual":"local notes in a reader"},
    {"title":"Minimal Clawbot","period":"2026","type":"Cloudflare bot","url":"https://github.com/anishthite/minimal-clawbot","summary":"A minimal clawbot that is easy to extend and runs on Cloudflare.","tags":["bot","cloudflare","minimal"],"visual":"small bot, small surface"},
    {"title":"Sitebrew Uptime","period":"2026","type":"Status page","url":"https://github.com/anishthite/sitebrew-uptime","summary":"An uptime monitor and status page for Anish Thite, powered by Upptime.","tags":["uptime","status","ops"],"visual":"green checks over time"},
    {"title":"Smash leaderboard analysis","period":"2026","type":"Data analysis","url":"https://github.com/anishthite/smash-leaderboard-analysis","summary":"Data analysis around Smash leaderboard results.","tags":["analysis","games","data"],"visual":"matches -> ranks -> plots"},
    {"title":"Spanner downloads","period":"2026","type":"Release page","url":"https://github.com/anishthite/spanner-downloads","summary":"Public Makerspace desktop downloads.","tags":["desktop","downloads","makerspace"],"visual":"build artifacts for users"},
    {"title":"Nervos Colors","period":"2026","type":"Terminal theme","url":"https://github.com/anishthite/nervos-colors","summary":"A terminal theme made with Claude.","tags":["terminal","theme","colors"],"visual":"soft terminal palette"},
    {"title":"pls_draw","period":"2022","type":"Twitter bot","url":"https://github.com/anishthite/pls_draw","summary":"A Twitter reply bot that drew tweets using Craiyon.","tags":["bot","images","craiyon"],"visual":"tweet -> prompt -> image"},
    {"title":"Fish biomechanics explainer","period":"2026","type":"Explainer","url":"fish-biomechanics-interactive-textbook-technical.html","summary":"Interactive technical explainer for swimming mechanics.","tags":["explainer","web","diagrams"],"visual":"forces over a moving fish"},
    {"title":"Team 8370A robotics","period":"2019","type":"Robotics","url":"https://github.com/anishthite/team8370A","summary":"VEX Robotics Competition code and files for Team 8370A.","tags":["robotics","VRC","C"],"visual":"motors, sensors, autonomous"}
  ];

  const filters = [
    {label: "All", value: "all"},
    {label: "Tools", value: "tools"},
    {label: "Research", value: "research"},
    {label: "Experiments", value: "experiments"}
  ];

  const palettes = [
    ["#f0dfcf", "#21160d", "#7f3f2d"],
    ["#dde8e2", "#21160d", "#285f61"],
    ["#ece7cf", "#21160d", "#6b6f44"],
    ["#eadde0", "#21160d", "#85465e"],
    ["#dfe4ee", "#21160d", "#4d5d82"],
    ["#efe1d1", "#21160d", "#8a5a24"]
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
      .map((line, lineIndex) => `<text x="38" y="${300 + lineIndex * 27}" font-size="22" fill="${accent}">${esc(line)}</text>`)
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400">
      <rect width="640" height="400" fill="${bg}"/>
      <path d="M0 318 C150 250 270 380 420 300 S570 225 640 280" fill="none" stroke="${accent}" stroke-width="3" opacity=".42"/>
      <path d="M70 60 H570 M70 340 H570" stroke="${ink}" opacity=".25"/>
      <circle cx="510" cy="108" r="56" fill="${accent}" opacity=".14"/>
      <circle cx="560" cy="150" r="20" fill="${accent}" opacity=".24"/>
      <path d="M92 210 C190 135 260 250 350 175 S480 145 552 214" fill="none" stroke="${ink}" stroke-width="2" opacity=".28"/>
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
      this.activeFilter = "all";
      this.renderShell();
      this.renderProjects();
    }

    renderShell() {
      this.innerHTML = `
        <header class="projects-hero">
          <div>
            <h1>Projects</h1>
            <p>Small tools, agent workflows, explainers, research artifacts, and web experiments.</p>
          </div>
          <div class="project-tabs" role="group" aria-label="Project filters">
            ${filters.map(filter => `
              <button type="button" data-filter="${filter.value}" aria-pressed="${filter.value === this.activeFilter}">${filter.label}</button>
            `).join("")}
          </div>
        </header>

        <p class="project-count"></p>
        <section class="projects-grid" aria-label="Projects"></section>
      `;

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

    renderProjects() {
      const visibleProjects = this.activeFilter === "all"
        ? projects
        : projects.filter(project => projectKind(project) === this.activeFilter);
      const count = this.querySelector(".project-count");
      const grid = this.querySelector(".projects-grid");

      count.textContent = `${visibleProjects.length} ${visibleProjects.length === 1 ? "project" : "projects"}`;
      grid.replaceChildren(...visibleProjects.map((project, index) => {
        const card = document.createElement("project-card");
        card.data = {project, index};
        return card;
      }));
    }
  }

  customElements.define("project-card", ProjectCard);
  customElements.define("projects-section", ProjectsSection);
}());
