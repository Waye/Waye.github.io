(() => {
  // ns-hugo-imp:/Users/weiyihu/hugo-website/mysite/assets/demos/runtime.ts
  function defineDemo(d) {
    return d;
  }
  var sharedAudio = null;
  function getAudio() {
    if (!sharedAudio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      sharedAudio = new AC();
    }
    if (sharedAudio.state === "suspended") void sharedAudio.resume();
    return sharedAudio;
  }
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function buildControls(panel, demo, ctx) {
    var _a, _b;
    const syncers = [];
    for (const c of (_a = demo.controls) != null ? _a : []) {
      if (c.kind === "button") {
        const b = el("button", "demo-btn", c.label);
        b.type = "button";
        b.addEventListener("click", () => {
          var _a2, _b2;
          return (_b2 = (_a2 = demo.actions) == null ? void 0 : _a2[c.action]) == null ? void 0 : _b2.call(_a2, ctx);
        });
        panel.appendChild(b);
        continue;
      }
      const row = el("div", "demo-row");
      const lab = el("label", "demo-lab", c.label);
      row.appendChild(lab);
      if (c.kind === "range") {
        const wrap = el("div", "demo-ctl");
        const inp = el("input");
        inp.type = "range";
        inp.min = String(c.min);
        inp.max = String(c.max);
        inp.step = String((_b = c.step) != null ? _b : 1);
        const out = el("span", "demo-num");
        const sync = () => {
          const v = Number(ctx.state[c.key]);
          inp.value = String(v);
          out.textContent = c.fmt ? c.fmt(v) : String(Math.round(v * 100) / 100);
        };
        inp.addEventListener(
          "input",
          () => ctx.set({ [c.key]: Number(inp.value) })
        );
        wrap.append(inp, out);
        row.appendChild(wrap);
        syncers.push(sync);
      } else if (c.kind === "toggle") {
        const inp = el("input");
        inp.type = "checkbox";
        inp.className = "demo-chk";
        inp.addEventListener(
          "change",
          () => ctx.set({ [c.key]: inp.checked })
        );
        lab.prepend(inp);
        syncers.push(() => {
          inp.checked = Boolean(ctx.state[c.key]);
        });
      } else {
        const sel = el("select", "demo-sel");
        for (const o of c.options) {
          const opt = el("option", void 0, o.label);
          opt.value = o.value;
          sel.appendChild(opt);
        }
        sel.addEventListener(
          "change",
          () => ctx.set({ [c.key]: sel.value })
        );
        row.appendChild(sel);
        syncers.push(() => {
          sel.value = String(ctx.state[c.key]);
        });
      }
      panel.appendChild(row);
    }
    return () => syncers.forEach((f) => f());
  }
  function mount(name, factory) {
    const boot = () => {
      const nodes = document.querySelectorAll(
        `[data-demo="${name}"]:not([data-demo-ready])`
      );
      nodes.forEach((root) => {
        var _a, _b;
        root.dataset.demoReady = "1";
        const demo = factory();
        const stage = el("div", "demo-stage");
        const panel = el("div", "demo-panel");
        const body = el("div", "demo-body");
        body.append(stage, panel);
        root.prepend(body);
        const ctx = {
          stage,
          state: demo.state,
          set(patch) {
            var _a2;
            Object.assign(demo.state, patch);
            syncControls();
            (_a2 = demo.render) == null ? void 0 : _a2.call(demo, ctx);
          },
          audio: getAudio
        };
        const syncControls = buildControls(panel, demo, ctx);
        (_a = demo.setup) == null ? void 0 : _a.call(demo, ctx);
        syncControls();
        (_b = demo.render) == null ? void 0 : _b.call(demo, ctx);
        if (demo.frame) {
          let raf = 0;
          let last = 0;
          let visible = false;
          const tick = (now) => {
            const dt = last ? Math.min(now - last, 64) : 16;
            last = now;
            demo.frame(dt, ctx);
            raf = requestAnimationFrame(tick);
          };
          const io = new IntersectionObserver((entries) => {
            const on = entries[0].isIntersecting;
            if (on === visible) return;
            visible = on;
            if (on) {
              last = 0;
              raf = requestAnimationFrame(tick);
            } else {
              cancelAnimationFrame(raf);
            }
          });
          io.observe(root);
        }
      });
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }

  // <stdin>
  var RGB_ROWS = [
    { key: "r", label: "R \u7EA2", max: 255, unit: "" },
    { key: "g", label: "G \u7EFF", max: 255, unit: "" },
    { key: "b", label: "B \u84DD", max: 255, unit: "" }
  ];
  var HSL_ROWS = [
    { key: "h", label: "H \u8272\u76F8 \xB7 \u89D2\u5EA6", max: 360, unit: "\xB0" },
    { key: "s", label: "S \u9971\u548C\u5EA6 \xB7 \u534A\u5F84", max: 100, unit: "%" },
    { key: "l", label: "L \u660E\u5EA6 \xB7 \u9AD8\u5EA6", max: 100, unit: "%" }
  ];
  var ACCENT = {
    r: "#d23b30",
    g: "#3d9b46",
    b: "#3566c4"
  };
  var CX = 120;
  var RX = 86;
  var RY = 27;
  var TOP = 46;
  var BOT = 250;
  var WHEEL_STEPS = 48;
  function hslToRgb(h, s, l) {
    const sat = s / 100;
    const lit = l / 100;
    const c = (1 - Math.abs(2 * lit - 1)) * sat;
    const x = c * (1 - Math.abs(h / 60 % 2 - 1));
    const m = lit - c / 2;
    const sextant = [
      [c, x, 0],
      [x, c, 0],
      [0, c, x],
      [0, x, c],
      [x, 0, c],
      [c, 0, x]
    ];
    const p = sextant[Math.floor(h / 60) % 6];
    return [
      Math.round((p[0] + m) * 255),
      Math.round((p[1] + m) * 255),
      Math.round((p[2] + m) * 255)
    ];
  }
  function rgbToHsl(r, g, b, fallbackHue) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;
    const l = (max + min) / 2;
    if (d === 0) return [fallbackHue, 0, Math.round(l * 100)];
    const s = d / (1 - Math.abs(2 * l - 1));
    let h;
    if (max === rn) h = (gn - bn) / d % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  }
  var hx = (n) => ("0" + n.toString(16)).slice(-2).toUpperCase();
  var css = (rgb) => `rgb(${rgb.join(",")})`;
  var NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, String(attrs[k]));
    return n;
  }
  var yForL = (l) => BOT - l / 100 * (BOT - TOP);
  function buildCylinder() {
    const root = svg("svg", {
      viewBox: "0 0 240 300",
      width: "240",
      style: "max-width:100%;height:auto;flex-shrink:0"
    });
    const hair = "var(--hairline,#c9c5bc)";
    const muted = "var(--ink-muted,#8b8880)";
    root.append(
      svg("path", {
        d: `M${CX - RX} ${TOP} V${BOT} A${RX} ${RY} 0 0 0 ${CX + RX} ${BOT} V${TOP}`,
        fill: muted,
        "fill-opacity": "0.08",
        stroke: hair,
        "stroke-width": "1"
      }),
      svg("ellipse", {
        cx: CX,
        cy: BOT,
        rx: RX,
        ry: RY,
        fill: "none",
        stroke: hair,
        "stroke-width": "1"
      }),
      svg("ellipse", {
        cx: CX,
        cy: TOP,
        rx: RX,
        ry: RY,
        fill: muted,
        "fill-opacity": "0.06",
        stroke: hair,
        "stroke-width": "1"
      }),
      // 中轴就是灰轴，S = 0 的地方
      svg("line", {
        x1: CX,
        y1: TOP,
        x2: CX,
        y2: BOT,
        stroke: muted,
        "stroke-width": "1",
        "stroke-dasharray": "3 3"
      }),
      svg("ellipse", {
        "data-slice": "1",
        cx: CX,
        cy: yForL(50),
        rx: RX,
        ry: RY,
        fill: "none",
        stroke: muted,
        "stroke-width": "1",
        "stroke-dasharray": "4 4"
      })
    );
    for (let i = 0; i < WHEEL_STEPS; i++) {
      root.appendChild(
        svg("circle", { "data-wheel": i, r: 3.4, cx: CX, cy: 0, fill: "#000" })
      );
    }
    root.append(
      svg("line", {
        "data-radius": "1",
        x1: CX,
        y1: 0,
        x2: CX,
        y2: 0,
        stroke: muted,
        "stroke-width": "1.5"
      }),
      svg("circle", { "data-hub": "1", cx: CX, cy: 0, r: 3, fill: muted }),
      svg("circle", {
        "data-dot": "1",
        cx: CX,
        cy: 0,
        r: 8,
        fill: "#fff",
        stroke: "var(--ink,#26231e)",
        "stroke-width": "1.5"
      })
    );
    const label = (x, y, text, anchor = "middle") => {
      const t = svg("text", {
        x,
        y,
        "text-anchor": anchor,
        "font-size": "11",
        fill: muted
      });
      t.textContent = text;
      return t;
    };
    root.append(
      label(CX, TOP - 12, "\u767D \xB7 L 100%"),
      label(CX, BOT + 44, "\u9ED1 \xB7 L 0%")
    );
    return root;
  }
  function group(title, rows) {
    var _a;
    const box = document.createElement("div");
    box.style.cssText = "flex:1;min-width:150px";
    const head = document.createElement("span");
    head.style.cssText = "display:block;font-size:.8rem;letter-spacing:.06em;color:var(--ink-muted,#6b6760);padding-bottom:.4rem;margin-bottom:.7rem;border-bottom:1px solid var(--hairline,#e2ded5)";
    head.textContent = title;
    box.appendChild(head);
    for (const row of rows) {
      const wrap = document.createElement("div");
      wrap.style.cssText = "margin-bottom:10px";
      const lab = document.createElement("span");
      lab.style.cssText = "display:block;font-size:.8rem;color:var(--ink-muted,#6b6760);margin-bottom:2px";
      lab.textContent = row.label;
      const ctl = document.createElement("span");
      ctl.style.cssText = "display:flex;align-items:center;gap:9px";
      const inp = document.createElement("input");
      inp.type = "range";
      inp.min = "0";
      inp.max = String(row.max);
      inp.step = "1";
      inp.dataset.key = row.key;
      inp.style.cssText = "flex:1;min-width:0;accent-color:" + ((_a = ACCENT[row.key]) != null ? _a : "var(--bengara,#9d3b2f)");
      const out = document.createElement("span");
      out.dataset.out = row.key;
      out.dataset.unit = row.unit;
      out.style.cssText = "font-size:.78rem;font-variant-numeric:tabular-nums;min-width:36px;text-align:right;color:var(--ink,#26231e)";
      ctl.append(inp, out);
      wrap.append(lab, ctl);
      box.appendChild(wrap);
    }
    return box;
  }
  mount(
    "rgb-hsl",
    () => defineDemo({
      state: { r: 255, g: 149, b: 0, h: 35, s: 100, l: 50 },
      setup(ctx) {
        const grid = ctx.stage.parentElement;
        if (grid) grid.style.gridTemplateColumns = "1fr";
        const swatch = document.createElement("div");
        swatch.dataset.swatch = "1";
        swatch.style.cssText = "height:76px;border:1px solid var(--hairline,#d8d4cb);margin-bottom:.8rem";
        const hex = document.createElement("div");
        hex.dataset.hex = "1";
        hex.style.cssText = "font-size:1.35rem;letter-spacing:.05em;color:var(--ink,#26231e);margin-bottom:1.2rem";
        const cols = document.createElement("div");
        cols.style.cssText = "display:flex;gap:24px;align-items:center;flex-wrap:wrap";
        const sliders = document.createElement("div");
        sliders.style.cssText = "flex:1;min-width:260px;display:flex;gap:22px;flex-wrap:wrap";
        sliders.append(
          group("RGB \xB7 \u76F4\u89D2\u5750\u6807", RGB_ROWS),
          group("HSL \xB7 \u5706\u67F1\u5750\u6807", HSL_ROWS)
        );
        cols.append(buildCylinder(), sliders);
        const note = document.createElement("p");
        note.dataset.note = "1";
        note.style.cssText = "margin:1.1rem 0 0;font-size:.82rem;line-height:1.7;color:var(--ink-muted,#6b6760)";
        ctx.stage.append(swatch, hex, cols, note);
        ctx.stage.addEventListener("input", (ev) => {
          const inp = ev.target;
          const key = inp.dataset.key;
          if (!key) return;
          const v = Number(inp.value);
          if (key === "r" || key === "g" || key === "b") {
            const rgb = [
              ctx.state.r,
              ctx.state.g,
              ctx.state.b
            ];
            rgb[{ r: 0, g: 1, b: 2 }[key]] = v;
            const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2], ctx.state.h);
            ctx.set({ r: rgb[0], g: rgb[1], b: rgb[2], h, s, l });
          } else {
            const hsl = [
              ctx.state.h,
              ctx.state.s,
              ctx.state.l
            ];
            hsl[{ h: 0, s: 1, l: 2 }[key]] = v;
            const [r, g, b] = hslToRgb(hsl[0], hsl[1], hsl[2]);
            ctx.set({ h: hsl[0], s: hsl[1], l: hsl[2], r, g, b });
          }
        });
      },
      render(ctx) {
        var _a, _b;
        const st = ctx.state;
        const rgb = [st.r, st.g, st.b];
        const code = "#" + hx(st.r) + hx(st.g) + hx(st.b);
        const swatch = ctx.stage.querySelector("[data-swatch]");
        if (swatch) swatch.style.background = code;
        const hexEl = ctx.stage.querySelector("[data-hex]");
        if (hexEl) hexEl.textContent = code;
        ctx.stage.querySelectorAll("[data-key]").forEach((inp) => {
          inp.value = String(st[inp.dataset.key]);
        });
        ctx.stage.querySelectorAll("[data-out]").forEach((out) => {
          var _a2;
          const k = out.dataset.out;
          out.textContent = String(st[k]) + ((_a2 = out.dataset.unit) != null ? _a2 : "");
        });
        const yc = yForL(st.l);
        const rad = st.h * Math.PI / 180;
        const frac = st.s / 100;
        const dotX = CX + RX * frac * Math.cos(rad);
        const dotY = yc + RY * frac * Math.sin(rad);
        (_a = ctx.stage.querySelector("[data-slice]")) == null ? void 0 : _a.setAttribute("cy", String(yc));
        for (let i = 0; i < WHEEL_STEPS; i++) {
          const node = ctx.stage.querySelector(`[data-wheel="${i}"]`);
          if (!node) continue;
          const a = i / WHEEL_STEPS * 2 * Math.PI;
          node.setAttribute("cx", String(CX + RX * Math.cos(a)));
          node.setAttribute("cy", String(yc + RY * Math.sin(a)));
          node.setAttribute(
            "fill",
            css(hslToRgb(i / WHEEL_STEPS * 360, 100, st.l))
          );
        }
        (_b = ctx.stage.querySelector("[data-hub]")) == null ? void 0 : _b.setAttribute("cy", String(yc));
        const radius = ctx.stage.querySelector("[data-radius]");
        if (radius) {
          radius.setAttribute("y1", String(yc));
          radius.setAttribute("x2", String(dotX));
          radius.setAttribute("y2", String(dotY));
        }
        const dot = ctx.stage.querySelector("[data-dot]");
        if (dot) {
          dot.setAttribute("cx", String(dotX));
          dot.setAttribute("cy", String(dotY));
          dot.setAttribute("fill", code);
        }
        const note = ctx.stage.querySelector("[data-note]");
        if (note) {
          note.textContent = `rgb(${rgb.join(", ")})\u3000\uFF1D\u3000hsl(${st.h}, ${st.s}%, ${st.l}%)\u3000\u2014\u2014 \u540C\u4E00\u4E2A\u989C\u8272\uFF0C\u4E24\u4E2A\u5730\u5740\u3002`;
        }
      }
    })
  );
})();
