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
  var NAMES = ["C", "C\u266F", "D", "D\u266F", "E", "F", "F\u266F", "G", "G\u266F", "A", "A\u266F", "B"];
  var CHORDS = {
    maj: { label: "\u5927\u4E09\u548C\u5F26", steps: [0, 4, 7] },
    min: { label: "\u5C0F\u4E09\u548C\u5F26", steps: [0, 3, 7] },
    dim: { label: "\u51CF\u4E09\u548C\u5F26", steps: [0, 3, 6] },
    aug: { label: "\u589E\u4E09\u548C\u5F26", steps: [0, 4, 8] },
    maj7: { label: "\u5927\u4E03\u548C\u5F26", steps: [0, 4, 7, 11] },
    min7: { label: "\u5C0F\u4E03\u548C\u5F26", steps: [0, 3, 7, 10] },
    dom7: { label: "\u5C5E\u4E03\u548C\u5F26", steps: [0, 4, 7, 10] },
    sus4: { label: "\u6302\u56DB\u548C\u5F26", steps: [0, 5, 7] }
  };
  var WHITE = [0, 2, 4, 5, 7, 9, 11];
  var BLACK = [1, 3, 6, 8, 10];
  var OCTAVES = 2;
  var freq = (semi) => 261.626 * Math.pow(2, semi / 12);
  var notes = (s) => CHORDS[s.quality].steps.map((n) => s.root + n);
  function keyboard(stage) {
    const kb = document.createElement("div");
    kb.style.cssText = "position:relative;height:150px;display:flex;user-select:none";
    for (let o = 0; o < OCTAVES; o++) {
      for (const w of WHITE) {
        const k = document.createElement("div");
        k.dataset.semi = String(o * 12 + w);
        k.style.cssText = "flex:1;border:1px solid var(--hairline,#d8d4cb);border-radius:0 0 3px 3px;background:#fff;transition:background .12s ease";
        kb.appendChild(k);
      }
    }
    const unit = 100 / (OCTAVES * 7);
    for (let o = 0; o < OCTAVES; o++) {
      BLACK.forEach((b) => {
        const before = WHITE.filter((w) => w < b).length;
        const k = document.createElement("div");
        k.dataset.semi = String(o * 12 + b);
        k.style.cssText = "position:absolute;top:0;height:62%;width:" + unit * 0.62 + "%;left:" + ((o * 7 + before) * unit - unit * 0.31) + "%;background:#2a2724;border-radius:0 0 3px 3px;transition:background .12s ease;z-index:2";
        kb.appendChild(k);
      });
    }
    stage.appendChild(kb);
    return kb;
  }
  function play(ctx) {
    const ac = ctx.audio();
    const s = ctx.state;
    const now = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.22;
    master.connect(ac.destination);
    notes(s).forEach((semi, i) => {
      const at = now + (s.arp ? i * 0.13 : 0);
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = s.wave;
      osc.frequency.value = freq(semi);
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(1, at + 0.02);
      g.gain.exponentialRampToValueAtTime(1e-3, at + 1.4);
      osc.connect(g).connect(master);
      osc.start(at);
      osc.stop(at + 1.5);
    });
  }
  mount(
    "chords",
    () => defineDemo({
      state: { root: 0, quality: "maj", wave: "triangle", arp: false },
      controls: [
        {
          kind: "select",
          key: "root",
          label: "\u6839\u97F3",
          options: NAMES.map((n, i) => ({ value: String(i), label: n }))
        },
        {
          kind: "select",
          key: "quality",
          label: "\u548C\u5F26\u6027\u8D28",
          options: Object.entries(CHORDS).map(([v, c]) => ({
            value: v,
            label: c.label
          }))
        },
        {
          kind: "select",
          key: "wave",
          label: "\u97F3\u8272",
          options: [
            { value: "sine", label: "\u6B63\u5F26 \xB7 \u7EAF\u51C0" },
            { value: "triangle", label: "\u4E09\u89D2 \xB7 \u6E29\u548C" },
            { value: "sawtooth", label: "\u952F\u9F7F \xB7 \u660E\u4EAE" },
            { value: "square", label: "\u65B9\u6CE2 \xB7 \u7535\u5B50" }
          ]
        },
        { kind: "toggle", key: "arp", label: "\u7436\u97F3\uFF08\u9010\u4E2A\u594F\u51FA\uFF09" },
        { kind: "button", label: "\u25B6 \u8BD5\u542C", action: "play" }
      ],
      actions: { play },
      setup(ctx) {
        const kb = keyboard(ctx.stage);
        const info = document.createElement("p");
        info.dataset.info = "1";
        info.style.cssText = "margin:.9rem 0 0;font-size:.88rem;color:var(--ink-muted,#6b6760)";
        ctx.stage.append(info);
        kb.addEventListener("click", () => play(ctx));
      },
      render(ctx) {
        const s = ctx.state;
        s.root = Number(s.root);
        const active = new Set(notes(s).map((n) => n % 24));
        ctx.stage.querySelectorAll("[data-semi]").forEach((k) => {
          const semi = Number(k.dataset.semi);
          const on = active.has(semi);
          const black = BLACK.includes(semi % 12);
          k.style.background = on ? "var(--bengara,#9d3b2f)" : black ? "#2a2724" : "#fff";
        });
        const info = ctx.stage.querySelector("[data-info]");
        if (info) {
          const names = notes(s).map((n) => NAMES[n % 12]);
          info.textContent = NAMES[s.root] + " " + CHORDS[s.quality].label + " \xB7 " + names.join(" \u2013 ") + " \xB7 \u97F3\u7A0B " + CHORDS[s.quality].steps.join("-") + " \u534A\u97F3";
        }
      }
    })
  );
})();
