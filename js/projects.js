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

  const projectRelatedLinks = (project, className) => {
    const links = Array.isArray(project.relatedLinks)
      ? project.relatedLinks.filter(link => link && link.url && link.label)
      : [];

    if (!links.length) {
      return "";
    }

    return `
      <div class="${className}" aria-label="${esc(project.title)} related links">
        ${links.map(link => `<a href="${esc(link.url)}">${esc(link.label)}</a>`).join("")}
      </div>
    `;
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

  const text = (copy, x, y, options = {}) => {
    const {size = 20, fill = "#111111", anchor = "start", weight = 400, opacity = 1, family = "Georgia, serif"} = options;
    return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" opacity="${opacity}">${esc(copy)}</text>`;
  };

  const box = (x, y, width, height, options = {}) => {
    const {fill = "none", stroke = "#111111", strokeWidth = 2, opacity = 1, rx = 0, dash = ""} = options;
    const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"${dashAttr}/>`;
  };

  const circle = (cx, cy, r, options = {}) => {
    const {fill = "#fffff8", stroke = "#111111", strokeWidth = 2, opacity = 1} = options;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
  };

  const path = (d, options = {}) => {
    const {fill = "none", stroke = "#111111", strokeWidth = 2, opacity = 1, dash = "", marker = false} = options;
    const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
    const markerAttr = marker ? ` marker-end="url(#arrow)"` : "";
    return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"${dashAttr}${markerAttr}/>`;
  };

  const line = (x1, y1, x2, y2, options = {}) =>
    path(`M${x1} ${y1} L${x2} ${y2}`, options);

  const ruleLines = (x, y, widths, gap, theme) =>
    widths.map((width, index) => line(x, y + index * gap, x + width, y + index * gap, {stroke: theme.rule, strokeWidth: 3})).join("");

  const thumbnailScenes = {
    "pdf-highlight": theme => `
      ${box(84, 62, 216, 276, {stroke: theme.ink, opacity: .38})}
      ${ruleLines(112, 104, [150, 118, 156, 132, 166, 108, 144], 26, theme)}
      ${box(112, 146, 142, 16, {fill: theme.accent, stroke: "none", opacity: .18})}
      ${box(112, 224, 126, 16, {fill: theme.accent, stroke: "none", opacity: .14})}
      ${box(342, 100, 176, 78, {stroke: theme.accent, opacity: .72})}
      ${text("summary", 364, 130, {size: 22, fill: theme.accent})}
      ${ruleLines(364, 154, [96, 118], 18, theme)}
      ${box(342, 220, 176, 74, {stroke: theme.rule})}
      ${text("context", 364, 250, {size: 20, fill: theme.muted})}
      ${path("M254 154 C304 146 306 124 342 124", {stroke: theme.accent, strokeWidth: 3, marker: true})}
      ${path("M238 232 C300 254 296 258 342 256", {stroke: theme.accent, strokeWidth: 3, marker: true})}
    `,
    "benchmark-matrix": theme => {
      const cells = Array.from({length: 30}, (_, index) => {
        const row = Math.floor(index / 6);
        const col = index % 6;
        const active = [2, 7, 10, 15, 16, 21, 23, 28].includes(index);
        return box(148 + col * 48, 92 + row * 38, 34, 24, {
          fill: active ? theme.accent : theme.soft,
          stroke: active ? theme.accent : theme.rule,
          opacity: active ? .5 : 1
        });
      }).join("");

      return `
        ${text("models", 92, 86, {size: 18, fill: theme.muted})}
        ${text("tasks", 440, 322, {size: 18, fill: theme.muted})}
        ${line(126, 78, 126, 300, {stroke: theme.ink, strokeWidth: 2})}
        ${line(126, 300, 476, 300, {stroke: theme.ink, strokeWidth: 2})}
        ${cells}
        ${path("M154 262 C218 216 274 236 322 176 S410 128 462 102", {stroke: theme.ink, strokeWidth: 3})}
        ${circle(462, 102, 8, {fill: theme.accent, stroke: theme.accent})}
        ${text("eval score", 346, 76, {size: 22, fill: theme.accent})}
      `;
    },
    "evolution-tree": theme => `
      ${line(142, 280, 236, 214, {stroke: theme.rule, strokeWidth: 3})}
      ${line(142, 280, 236, 304, {stroke: theme.rule, strokeWidth: 3})}
      ${line(236, 214, 346, 154, {stroke: theme.rule, strokeWidth: 3})}
      ${line(236, 214, 346, 230, {stroke: theme.rule, strokeWidth: 3})}
      ${line(346, 154, 478, 112, {stroke: theme.accent, strokeWidth: 4})}
      ${line(346, 154, 478, 190, {stroke: theme.rule, strokeWidth: 3})}
      ${line(142, 280, 236, 214, {stroke: theme.accent, strokeWidth: 4})}
      ${line(236, 214, 346, 154, {stroke: theme.accent, strokeWidth: 4})}
      ${[142, 236, 346, 478].map((cx, index) => circle(cx, [280, 214, 154, 112][index], 16, {fill: index === 3 ? theme.accent : theme.bg, stroke: theme.accent, strokeWidth: 3})).join("")}
      ${circle(236, 304, 13, {stroke: theme.rule})}
      ${circle(346, 230, 13, {stroke: theme.rule})}
      ${circle(478, 190, 13, {stroke: theme.rule})}
      ${text("select", 450, 86, {size: 22, fill: theme.accent})}
      ${text("mutate", 108, 316, {size: 18, fill: theme.muted})}
    `,
    "commit-streak": theme => {
      const cells = Array.from({length: 63}, (_, index) => {
        const row = index % 7;
        const col = Math.floor(index / 7);
        const on = (index * 7 + col) % 5 !== 0;
        const strong = [18, 19, 20, 25, 26, 27, 34, 41, 48].includes(index);
        return box(92 + col * 36, 92 + row * 25, 22, 16, {
          fill: on ? (strong ? theme.accent : theme.ink) : theme.soft,
          stroke: on ? "none" : theme.rule,
          opacity: on ? (strong ? .54 : .18) : 1
        });
      }).join("");

      return `
        ${text("ship log", 92, 68, {size: 22, fill: theme.accent})}
        ${cells}
        ${line(82, 296, 552, 296, {stroke: theme.rule, strokeWidth: 2})}
        ${path("M106 278 C174 246 212 270 266 230 S360 206 424 162 S488 150 538 116", {stroke: theme.accent, strokeWidth: 4})}
        ${circle(538, 116, 8, {fill: theme.accent, stroke: theme.accent})}
      `;
    },
    "agent-config": theme => `
      ${box(86, 82, 148, 76, {stroke: theme.rule})}
      ${text(".codex", 112, 116, {size: 22, fill: theme.ink})}
      ${ruleLines(112, 138, [74, 92], 16, theme)}
      ${box(86, 194, 148, 76, {stroke: theme.rule})}
      ${text("skills", 112, 228, {size: 22, fill: theme.ink})}
      ${ruleLines(112, 250, [84, 66], 16, theme)}
      ${box(302, 132, 142, 92, {stroke: theme.accent, strokeWidth: 3})}
      ${text("agent", 373, 184, {size: 28, fill: theme.accent, anchor: "middle"})}
      ${circle(526, 92, 18, {stroke: theme.ink})}
      ${circle(526, 178, 18, {stroke: theme.ink})}
      ${circle(526, 264, 18, {stroke: theme.ink})}
      ${line(234, 120, 302, 160, {stroke: theme.accent, strokeWidth: 3, marker: true})}
      ${line(234, 232, 302, 196, {stroke: theme.accent, strokeWidth: 3, marker: true})}
      ${line(444, 160, 508, 92, {stroke: theme.rule, strokeWidth: 3, marker: true})}
      ${line(444, 178, 508, 178, {stroke: theme.rule, strokeWidth: 3, marker: true})}
      ${line(444, 196, 508, 264, {stroke: theme.rule, strokeWidth: 3, marker: true})}
    `,
    "prompt-package": theme => `
      ${box(96, 72, 214, 236, {stroke: theme.ink, opacity: .38})}
      ${box(122, 100, 214, 236, {stroke: theme.ink, opacity: .3})}
      ${box(148, 128, 214, 236, {stroke: theme.accent, strokeWidth: 3})}
      ${text("prompt.md", 176, 166, {size: 24, fill: theme.accent})}
      ${text("system:", 176, 204, {size: 20, fill: theme.ink, family: "monospace"})}
      ${ruleLines(176, 234, [132, 106, 150, 84], 28, theme)}
      ${box(420, 136, 92, 92, {stroke: theme.rule})}
      ${text("{ }", 466, 190, {size: 36, fill: theme.muted, anchor: "middle", family: "monospace"})}
      ${path("M362 236 C402 226 404 190 420 182", {stroke: theme.accent, strokeWidth: 3, marker: true})}
    `,
    "effort-slider": theme => `
      ${box(82, 88, 476, 222, {stroke: theme.ink, opacity: .38})}
      ${box(82, 88, 476, 44, {fill: theme.soft, stroke: theme.ink, opacity: .75})}
      ${text("/effort high", 118, 118, {size: 24, fill: theme.accent, family: "monospace"})}
      ${line(134, 214, 506, 214, {stroke: theme.rule, strokeWidth: 6})}
      ${[134, 227, 320, 413, 506].map((x, index) => `${line(x, 196, x, 232, {stroke: index === 3 ? theme.accent : theme.ink, strokeWidth: 3, opacity: index === 3 ? 1 : .4})}${text(["low", "med", "high", "xhigh", "max"][index], x, 264, {size: 16, fill: index === 3 ? theme.accent : theme.muted, anchor: "middle"})}`).join("")}
      ${circle(413, 214, 18, {fill: theme.bg, stroke: theme.accent, strokeWidth: 4})}
      ${path("M118 166 H520", {stroke: theme.rule, strokeWidth: 2})}
    `,
    "cafe-map": theme => `
      ${box(76, 68, 488, 260, {stroke: theme.ink, opacity: .34})}
      ${box(100, 92, 136, 80, {stroke: theme.rule})}
      ${box(404, 92, 136, 80, {stroke: theme.rule})}
      ${circle(184, 232, 34, {stroke: theme.accent, strokeWidth: 3})}
      ${circle(336, 202, 34, {stroke: theme.ink})}
      ${circle(472, 252, 34, {stroke: theme.ink})}
      ${[160, 208, 312, 360, 448, 496].map((x, index) => box(x, index < 2 ? 282 : index < 4 ? 152 : 202, 18, 30, {stroke: theme.rule, fill: theme.soft})).join("")}
      ${path("M124 134 C150 110 188 110 214 134", {stroke: theme.accent, strokeWidth: 3})}
      ${path("M426 134 C452 110 490 110 516 134", {stroke: theme.accent, strokeWidth: 3})}
      ${text("focus", 154, 238, {size: 20, fill: theme.accent, anchor: "middle"})}
      ${text("ambient", 464, 300, {size: 18, fill: theme.muted, anchor: "middle"})}
    `,
    "chat-pressure": theme => `
      ${box(90, 78, 210, 78, {stroke: theme.ink, opacity: .34, rx: 10})}
      ${text("claim", 124, 124, {size: 24, fill: theme.ink})}
      ${box(340, 142, 210, 78, {stroke: theme.accent, strokeWidth: 3, rx: 10})}
      ${text("push back", 374, 188, {size: 24, fill: theme.accent})}
      ${box(108, 242, 232, 70, {stroke: theme.rule, rx: 10})}
      ${text("check again", 144, 284, {size: 22, fill: theme.muted})}
      ${path("M296 120 C340 124 340 154 340 172", {stroke: theme.accent, strokeWidth: 3, marker: true})}
      ${path("M344 202 C292 226 238 218 214 242", {stroke: theme.accent, strokeWidth: 3, marker: true})}
      ${path("M462 220 C460 268 404 292 340 282", {stroke: theme.rule, strokeWidth: 3, dash: "8 8"})}
      ${text("contradiction", 388, 268, {size: 18, fill: theme.accent})}
    `,
    "crt-video": theme => `
      ${box(94, 72, 394, 250, {stroke: theme.ink, strokeWidth: 3, rx: 18})}
      ${box(126, 102, 294, 178, {stroke: theme.accent, strokeWidth: 3, fill: theme.soft, rx: 10})}
      ${[126, 150, 174, 198, 222, 246, 270].map(y => line(126, y, 420, y, {stroke: theme.rule, strokeWidth: 2})).join("")}
      ${path("M246 158 L246 226 L306 192 Z", {fill: theme.accent, stroke: theme.accent, opacity: .8})}
      ${circle(456, 138, 16, {stroke: theme.ink})}
      ${circle(456, 198, 16, {stroke: theme.ink})}
      ${line(178, 72, 124, 36, {stroke: theme.ink, strokeWidth: 2})}
      ${line(404, 72, 466, 36, {stroke: theme.ink, strokeWidth: 2})}
      ${text("archive", 238, 306, {size: 20, fill: theme.muted, anchor: "middle"})}
    `,
    "color-lift": theme => `
      ${box(86, 78, 310, 220, {stroke: theme.ink, opacity: .38})}
      ${box(86, 78, 310, 40, {fill: theme.soft, stroke: theme.ink, opacity: .7})}
      ${ruleLines(116, 150, [192, 136, 208, 160], 28, theme)}
      ${path("M336 172 L436 272", {stroke: theme.accent, strokeWidth: 5})}
      ${circle(320, 156, 18, {fill: theme.bg, stroke: theme.accent, strokeWidth: 4})}
      ${box(418, 248, 72, 44, {fill: theme.accent, stroke: theme.accent, opacity: .18})}
      ${[0, 1, 2, 3].map(i => box(416 + i * 34, 116, 24, 92, {fill: [theme.accent, "#2a623d", "#3a5a8c", theme.ink][i], stroke: "none", opacity: i === 3 ? .25 : .7})).join("")}
      ${text("swatches", 410, 226, {size: 18, fill: theme.muted})}
    `,
    "markdown-reader": theme => `
      ${box(78, 82, 218, 230, {stroke: theme.ink, opacity: .34})}
      ${text("# note", 108, 126, {size: 24, fill: theme.accent, family: "monospace"})}
      ${ruleLines(108, 166, [136, 108, 154, 126, 92], 26, theme)}
      ${box(344, 82, 218, 230, {stroke: theme.accent, strokeWidth: 3})}
      ${text("Note", 374, 132, {size: 32, fill: theme.ink})}
      ${ruleLines(374, 172, [132, 102, 150], 28, theme)}
      ${box(374, 250, 88, 34, {fill: theme.accent, stroke: theme.accent, opacity: .12})}
      ${path("M296 196 H344", {stroke: theme.accent, strokeWidth: 3, marker: true})}
    `,
    "worker-flow": theme => `
      ${box(78, 144, 124, 78, {stroke: theme.rule})}
      ${text("trigger", 140, 190, {size: 22, fill: theme.ink, anchor: "middle"})}
      ${box(258, 120, 124, 126, {stroke: theme.accent, strokeWidth: 3})}
      ${text("worker", 320, 172, {size: 24, fill: theme.accent, anchor: "middle"})}
      ${text("logic", 320, 204, {size: 18, fill: theme.muted, anchor: "middle"})}
      ${box(438, 144, 124, 78, {stroke: theme.rule})}
      ${text("reply", 500, 190, {size: 22, fill: theme.ink, anchor: "middle"})}
      ${line(202, 184, 258, 184, {stroke: theme.accent, strokeWidth: 3, marker: true})}
      ${line(382, 184, 438, 184, {stroke: theme.accent, strokeWidth: 3, marker: true})}
      ${path("M278 272 C314 296 364 296 400 272", {stroke: theme.rule, strokeWidth: 3, dash: "8 7"})}
      ${text("small surface", 320, 314, {size: 18, fill: theme.muted, anchor: "middle"})}
    `,
    "uptime-status": theme => `
      ${line(88, 270, 548, 270, {stroke: theme.rule, strokeWidth: 3})}
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const x = 106 + i * 68;
        const good = i !== 4;
        return `${line(x, 250, x, 290, {stroke: theme.rule, strokeWidth: 2})}${circle(x, 210 - (i % 3) * 22, 14, {fill: good ? theme.bg : theme.accent, stroke: good ? theme.accent : theme.accent, strokeWidth: 3})}${text(good ? "ok" : "down", x, 324, {size: 16, fill: good ? theme.muted : theme.accent, anchor: "middle"})}`;
      }).join("")}
      ${path("M106 210 L174 188 L242 166 L310 210 L378 122 L446 188 L514 166", {stroke: theme.accent, strokeWidth: 3})}
      ${box(112, 74, 160, 42, {stroke: theme.accent, fill: theme.accent, opacity: .12})}
      ${text("99.9%", 146, 102, {size: 24, fill: theme.accent})}
    `,
    "leaderboard-bars": theme => `
      ${box(88, 74, 464, 250, {stroke: theme.ink, opacity: .34})}
      ${[0, 1, 2, 3, 4].map((i) => {
        const y = 112 + i * 38;
        const width = [300, 238, 184, 126, 86][i];
        return `${text(`#${i + 1}`, 116, y + 20, {size: 18, fill: theme.muted, family: "monospace"})}${box(164, y, width, 22, {fill: i < 2 ? theme.accent : theme.ink, stroke: "none", opacity: i < 2 ? .42 : .14})}${line(164, y + 32, 512, y + 32, {stroke: theme.rule, strokeWidth: 2})}`;
      }).join("")}
      ${path("M170 294 C238 260 310 282 370 236 S464 196 522 152", {stroke: theme.accent, strokeWidth: 3})}
      ${text("rank trend", 404, 296, {size: 18, fill: theme.muted})}
    `,
    "download-tray": theme => `
      ${path("M320 76 V224", {stroke: theme.accent, strokeWidth: 6, marker: true})}
      ${line(248, 252, 392, 252, {stroke: theme.ink, strokeWidth: 4})}
      ${path("M226 224 L248 252 L392 252 L414 224", {stroke: theme.ink, strokeWidth: 3})}
      ${box(104, 256, 108, 58, {stroke: theme.rule})}
      ${box(266, 256, 108, 58, {stroke: theme.accent, strokeWidth: 3})}
      ${box(428, 256, 108, 58, {stroke: theme.rule})}
      ${text("dmg", 158, 292, {size: 22, fill: theme.muted, anchor: "middle"})}
      ${text("app", 320, 292, {size: 22, fill: theme.accent, anchor: "middle"})}
      ${text("zip", 482, 292, {size: 22, fill: theme.muted, anchor: "middle"})}
      ${box(250, 92, 140, 82, {stroke: theme.rule})}
      ${text("build", 320, 140, {size: 22, fill: theme.ink, anchor: "middle"})}
    `,
    "terminal-swatches": theme => `
      ${box(82, 78, 476, 236, {stroke: theme.ink, opacity: .38})}
      ${box(82, 78, 476, 42, {fill: theme.soft, stroke: theme.ink, opacity: .7})}
      ${text("$ nervos-colors", 112, 158, {size: 22, fill: theme.accent, family: "monospace"})}
      ${ruleLines(112, 194, [190, 146, 216], 28, theme)}
      ${[0, 1, 2, 3, 4, 5].map((i) => box(374 + (i % 3) * 46, 150 + Math.floor(i / 3) * 48, 34, 34, {fill: [theme.accent, "#2a623d", "#3a5a8c", "#d8d3c2", theme.ink, "#6f6a5b"][i], stroke: "none", opacity: i === 4 ? .28 : .76})).join("")}
      ${text("palette", 406, 270, {size: 18, fill: theme.muted})}
    `,
    "tweet-draw": theme => `
      ${box(74, 86, 164, 116, {stroke: theme.rule, rx: 10})}
      ${text("@reply", 104, 124, {size: 20, fill: theme.accent})}
      ${ruleLines(104, 154, [82, 108], 22, theme)}
      ${box(274, 104, 144, 82, {stroke: theme.accent, strokeWidth: 3})}
      ${text("prompt", 346, 153, {size: 22, fill: theme.accent, anchor: "middle"})}
      ${box(462, 78, 116, 142, {stroke: theme.ink, opacity: .38})}
      ${path("M482 180 C506 140 536 150 558 116", {stroke: theme.rule, strokeWidth: 3})}
      ${circle(500, 120, 12, {fill: theme.accent, stroke: theme.accent, opacity: .45})}
      ${line(238, 144, 274, 144, {stroke: theme.accent, strokeWidth: 3, marker: true})}
      ${line(418, 144, 462, 144, {stroke: theme.accent, strokeWidth: 3, marker: true})}
      ${text("image", 520, 252, {size: 18, fill: theme.muted, anchor: "middle"})}
    `,
    "fish-forces": theme => `
      ${path("M128 220 C190 142 300 142 392 214 C436 186 486 174 538 194 C490 218 444 240 392 230 C302 286 190 286 128 220 Z", {fill: "none", stroke: theme.ink, strokeWidth: 3})}
      ${circle(212, 198, 7, {fill: theme.ink, stroke: theme.ink})}
      ${path("M392 214 C430 208 456 214 486 228", {stroke: theme.accent, strokeWidth: 4})}
      ${line(270, 138, 270, 76, {stroke: theme.accent, strokeWidth: 3, marker: true})}
      ${line(332, 252, 332, 318, {stroke: theme.accent, strokeWidth: 3, marker: true})}
      ${line(160, 220, 82, 220, {stroke: theme.accent, strokeWidth: 3, marker: true})}
      ${path("M92 318 C170 282 228 340 304 304 S448 270 548 308", {stroke: theme.rule, strokeWidth: 3})}
      ${text("force", 288, 68, {size: 18, fill: theme.accent, anchor: "middle"})}
      ${text("flow", 528, 300, {size: 18, fill: theme.muted})}
    `,
    "robotics-field": theme => `
      ${box(82, 70, 476, 260, {stroke: theme.ink, opacity: .34})}
      ${[1, 2, 3, 4].map(i => line(82 + i * 95, 70, 82 + i * 95, 330, {stroke: theme.rule, strokeWidth: 2})).join("")}
      ${[1, 2].map(i => line(82, 70 + i * 86, 558, 70 + i * 86, {stroke: theme.rule, strokeWidth: 2})).join("")}
      ${box(132, 246, 56, 38, {fill: theme.accent, stroke: theme.accent, opacity: .18})}
      ${box(406, 112, 56, 38, {fill: theme.accent, stroke: theme.accent, opacity: .18})}
      ${path("M160 264 C220 226 220 166 284 166 S370 222 432 132", {stroke: theme.accent, strokeWidth: 4, marker: true})}
      ${box(250, 142, 66, 48, {stroke: theme.accent, strokeWidth: 3})}
      ${circle(266, 196, 6, {fill: theme.ink, stroke: theme.ink})}
      ${circle(300, 196, 6, {fill: theme.ink, stroke: theme.ink})}
      ${text("auton path", 392, 284, {size: 18, fill: theme.muted})}
    `,
    fallback: (theme, project) => {
      const visual = wrap(project.visual || project.tags.join(" - "), 32)
        .map((lineText, lineIndex) => text(lineText, 76, 250 + lineIndex * 28, {size: 22, fill: theme.accent}))
        .join("");

      return `
        ${path("M0 318 C150 250 270 380 420 300 S570 225 640 280", {stroke: theme.accent, strokeWidth: 3, opacity: .7})}
        ${ruleLines(70, 72, [500, 500, 500], 40, theme)}
        ${path("M92 210 C190 135 260 250 350 175 S480 145 552 214", {stroke: theme.ink, strokeWidth: 2, opacity: .42})}
        ${visual}
      `;
    }
  };

  const preview = (project, index) => {
    const [bg, ink, accent] = palettes[index % palettes.length];
    const theme = {
      bg,
      ink,
      accent,
      muted: "#6f6a5b",
      rule: "#d8d3c2",
      soft: "#fbfbef"
    };
    const scene = thumbnailScenes[project.thumbnail] || thumbnailScenes.fallback;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400">
      <rect width="640" height="400" fill="${bg}"/>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="${accent}" stroke="none"/>
        </marker>
      </defs>
      <rect x="38" y="38" width="564" height="324" fill="none" stroke="${ink}" opacity=".18"/>
      <g stroke-linecap="round" stroke-linejoin="round">
        ${scene(theme, project)}
      </g>
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
        <article class="project-card" data-kind="${kind}">
          <a class="project-card-media" href="${esc(project.url)}" aria-label="${esc(project.title)} project">
            <img class="project-image" src="${preview(project, this.index)}" alt="">
          </a>
          <div class="project-body">
            <div>
              <h2 class="project-title"><a href="${esc(project.url)}">${esc(project.title)}</a></h2>
              <p class="project-summary">${esc(project.summary)}</p>
              ${project.details ? `<p class="project-details">${esc(project.details)}</p>` : ""}
              ${projectRelatedLinks(project, "project-related-links")}
              <p class="project-time">${esc(project.period)} - ${esc(project.type)}</p>
            </div>
            <div class="project-tags">${project.tags.map(tag => `<span>${esc(tag)}</span>`).join("")}</div>
          </div>
        </article>
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
                  ${project.details ? `<p class="timeline-details">${esc(project.details)}</p>` : ""}
                  ${projectRelatedLinks(project, "timeline-related-links")}
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
