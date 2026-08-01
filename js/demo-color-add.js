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

  // ns-hugo-imp:/Users/weiyihu/hugo-website/mysite/assets/demos/color-mix.ts
  var CFG = {
    add: {
      bg: "#000",
      blend: "screen",
      labels: ["\u7EA2\u5149 R", "\u7EFF\u5149 G", "\u84DD\u5149 B"],
      note: "\u4E09\u675F\u5149\u53E0\u6EE1 \u2192 \u767D\u5149"
    },
    sub: {
      bg: "#fff",
      blend: "multiply",
      labels: ["\u9752 C", "\u54C1\u7EA2 M", "\u9EC4 Y"],
      note: "\u4E09\u79CD\u989C\u6599\u53E0\u6EE1 \u2192 \u8FD1\u9ED1"
    }
  };
  var POS = [
    ["21%", "5%"],
    ["3%", "37%"],
    ["39%", "37%"]
  ];
  var hx = (n) => ("0" + Math.round(n).toString(16)).slice(-2).toUpperCase();
  function mixer(mode) {
    const cfg = CFG[mode];
    return defineDemo({
      state: { a: 255, b: 255, c: 255 },
      controls: [
        { kind: "range", key: "a", label: cfg.labels[0], min: 0, max: 255 },
        { kind: "range", key: "b", label: cfg.labels[1], min: 0, max: 255 },
        { kind: "range", key: "c", label: cfg.labels[2], min: 0, max: 255 },
        { kind: "button", label: "\u5168\u90E8\u5F52\u96F6", action: "zero" },
        { kind: "button", label: "\u5168\u90E8\u62C9\u6EE1", action: "full" }
      ],
      actions: {
        zero: (ctx) => ctx.set({ a: 0, b: 0, c: 0 }),
        full: (ctx) => ctx.set({ a: 255, b: 255, c: 255 })
      },
      setup(ctx) {
        const stage = document.createElement("div");
        stage.dataset.stage = "1";
        stage.style.cssText = "position:relative;width:100%;max-width:330px;margin:0 auto;aspect-ratio:1/1;isolation:isolate;overflow:hidden;background:" + cfg.bg;
        POS.forEach(([left, top], i) => {
          const circle = document.createElement("span");
          circle.dataset.circle = String(i);
          circle.style.cssText = "position:absolute;width:58%;aspect-ratio:1/1;border-radius:50%;mix-blend-mode:" + cfg.blend + ";left:" + left + ";top:" + top;
          stage.appendChild(circle);
        });
        const foot = document.createElement("div");
        foot.style.cssText = "display:flex;align-items:center;gap:12px;margin-top:1rem";
        const swatch = document.createElement("span");
        swatch.dataset.swatch = "1";
        swatch.style.cssText = "width:42px;height:42px;flex-shrink:0;border:1px solid var(--hairline,#d8d4cb)";
        const text = document.createElement("span");
        const cap = document.createElement("span");
        cap.style.cssText = "display:block;font-size:.78rem;color:var(--ink-muted,#6b6760)";
        cap.textContent = cfg.note;
        const hex = document.createElement("span");
        hex.dataset.hex = "1";
        hex.style.cssText = "font-size:.9rem;letter-spacing:.04em;color:var(--ink,#26231e)";
        text.append(cap, hex);
        foot.append(swatch, text);
        ctx.stage.append(stage, foot);
      },
      render(ctx) {
        const v = [ctx.state.a, ctx.state.b, ctx.state.c];
        const res = [0, 0, 0];
        v.forEach((val, i) => {
          let col;
          if (mode === "add") {
            col = [0, 0, 0];
            col[i] = val;
            res[i] = val;
          } else {
            col = [255, 255, 255];
            col[i] = 255 - val;
            res[i] = 255 - val;
          }
          const circle = ctx.stage.querySelector(
            `[data-circle="${i}"]`
          );
          if (circle) {
            circle.style.background = `rgb(${col[0]},${col[1]},${col[2]})`;
          }
        });
        const code = "#" + hx(res[0]) + hx(res[1]) + hx(res[2]);
        const swatch = ctx.stage.querySelector("[data-swatch]");
        const hex = ctx.stage.querySelector("[data-hex]");
        if (swatch) swatch.style.background = code;
        if (hex) {
          hex.textContent = `${code}\u3000rgb(${res.map(Math.round).join(", ")})`;
        }
      }
    });
  }

  // <stdin>
  mount("color-add", () => mixer("add"));
})();
