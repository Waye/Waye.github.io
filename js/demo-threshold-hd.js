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
  var COLS = 26;
  var ROWS = 15;
  var N = COLS * ROWS;
  var DMIN = 0.12;
  var DMAX = 2.9;
  var LO = -3;
  var HI = 3;
  var GX = 20;
  var GY = 44;
  var GW = 286;
  var GH = 214;
  var PX = 372;
  var PY = 44;
  var PW = 288;
  var PH = 214;
  var CW = GW / COLS;
  var CH = GH / ROWS;
  var NS = "http://www.w3.org/2000/svg";
  function el2(t, a = {}) {
    const n = document.createElementNS(NS, t);
    for (const k in a) n.setAttribute(k, String(a[k]));
    return n;
  }
  function txt(s, a) {
    const t = el2("text", a);
    t.textContent = s;
    return t;
  }
  function seeded(seed) {
    let a = seed | 0;
    return () => {
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var Z = (() => {
    const rnd = seeded(20260724);
    const out = [];
    for (let i = 0; i < N; i++) {
      const u = Math.max(1e-9, rnd());
      const v = rnd();
      out.push(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
    }
    return out;
  })();
  var MUT = "var(--ink-muted,#8b8880)";
  var HAIR = "var(--hairline,#d8d4cb)";
  var SILVER = "#2A2724";
  var CURVE = "#4d7fc4";
  var HOT = "var(--bengara,#9d3b2f)";
  function skew(z, dist) {
    if (dist === "right") return (Math.exp(z * 0.6) - 1) / 0.6;
    if (dist === "left") return -(Math.exp(-z * 0.6) - 1) / 0.6;
    return z;
  }
  var sx = (x) => PX + (x - LO) / (HI - LO) * PW;
  var sy = (d) => PY + PH - d / 3 * PH;
  mount(
    "threshold-hd",
    () => defineDemo({
      state: { logE: -3, sigma: 0.55, dist: "sym" },
      controls: [
        {
          kind: "range",
          key: "logE",
          label: "\u66DD\u5149\u91CF log E",
          min: -3,
          max: 3,
          step: 0.02,
          fmt: (v) => v.toFixed(2)
        },
        {
          kind: "range",
          key: "sigma",
          label: "\u9608\u503C\u5206\u6563\u5EA6 \u03C3",
          min: 0.08,
          max: 1.2,
          step: 0.01,
          fmt: (v) => v.toFixed(2)
        },
        {
          kind: "select",
          key: "dist",
          label: "\u9608\u503C\u5206\u5E03\u5F62\u72B6",
          options: [
            { value: "sym", label: "\u5BF9\u79F0 \xB7 S \u5F62" },
            { value: "right", label: "\u53F3\u504F \xB7 \u957F\u80A9\u90E8" },
            { value: "left", label: "\u5DE6\u504F \xB7 \u957F\u8DBE\u90E8" }
          ]
        }
      ],
      setup(ctx) {
        const grid = ctx.stage.parentElement;
        if (grid) grid.style.gridTemplateColumns = "1fr";
        const svg = el2("svg", {
          viewBox: "0 0 680 300",
          style: "width:100%;height:auto;display:block"
        });
        svg.appendChild(txt("\u4E00\u9897\u6676\u4F53 = \u4E00\u4E2A\u4E8C\u503C\u63A2\u6D4B\u5668", {
          x: GX,
          y: 32,
          "font-size": 11.5,
          fill: MUT
        }));
        svg.appendChild(txt(`${N} \u9897`, {
          x: GX + GW,
          y: 32,
          "text-anchor": "end",
          "font-size": 11,
          fill: MUT
        }));
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const i = r * COLS + c;
            svg.appendChild(el2("rect", {
              "data-cell": i,
              x: GX + c * CW + 0.6,
              y: GY + r * CH + 0.6,
              width: CW - 1.2,
              height: CH - 1.2,
              rx: 1.2,
              fill: "none",
              stroke: HAIR,
              "stroke-width": 0.7
            }));
          }
        }
        svg.appendChild(txt("\u5BC6\u5EA6 D\uFF08log E\uFF09", {
          x: PX,
          y: 32,
          "font-size": 11.5,
          fill: MUT
        }));
        svg.appendChild(el2("line", {
          x1: PX,
          y1: PY + PH,
          x2: PX + PW,
          y2: PY + PH,
          stroke: HAIR,
          "stroke-width": 1
        }));
        svg.appendChild(el2("line", {
          x1: PX,
          y1: PY,
          x2: PX,
          y2: PY + PH,
          stroke: HAIR,
          "stroke-width": 1
        }));
        svg.appendChild(txt("log E", {
          x: PX + PW,
          y: PY + PH + 16,
          "text-anchor": "end",
          "font-size": 10,
          fill: MUT
        }));
        svg.appendChild(txt("D", {
          x: PX - 8,
          y: PY + 8,
          "text-anchor": "end",
          "font-size": 10,
          fill: MUT
        }));
        svg.appendChild(el2("path", { "data-curve": "1", fill: "none", stroke: CURVE, "stroke-width": 2.2 }));
        svg.appendChild(el2("path", { "data-grown": "1", fill: "none", stroke: HOT, "stroke-width": 3 }));
        svg.appendChild(el2("line", {
          "data-hline": "1",
          stroke: HOT,
          "stroke-width": 1,
          "stroke-dasharray": "3 3",
          opacity: 0.55
        }));
        svg.appendChild(el2("circle", { "data-dot": "1", r: 5, fill: HOT }));
        svg.appendChild(txt("\u8DBE\u90E8", { "data-toe": "1", x: 0, y: 0, "font-size": 10, fill: MUT, "text-anchor": "middle" }));
        svg.appendChild(txt("\u80A9\u90E8", { "data-sh": "1", x: 0, y: 0, "font-size": 10, fill: MUT, "text-anchor": "middle" }));
        ctx.stage.appendChild(svg);
        const stats = document.createElement("div");
        stats.style.cssText = "display:flex;gap:24px;flex-wrap:wrap;margin:.9rem 0 .7rem;padding-top:.9rem;border-top:1px solid var(--hairline,#e2ded5)";
        [["\u5DF2\u663E\u5F71", "nd"], ["\u5BC6\u5EA6 D", "dv"], ["\u53CD\u5DEE \u03B3", "gm"], ["\u5F53\u524D\u4F4D\u4E8E", "rg"]].forEach(([lab, k]) => {
          const s = document.createElement("span");
          const l = document.createElement("span");
          l.style.cssText = "font-size:.74rem;color:var(--ink-muted,#8b8880);margin-right:.35rem";
          l.textContent = lab;
          const v = document.createElement("span");
          v.dataset.k = k;
          v.style.cssText = "font-size:.95rem;font-variant-numeric:tabular-nums;color:var(--ink,#26231e)";
          s.append(l, v);
          stats.appendChild(s);
        });
        ctx.stage.appendChild(stats);
        const msg = document.createElement("p");
        msg.dataset.k = "msg";
        msg.style.cssText = "margin:0;font-size:.92rem;line-height:1.75;color:var(--ink,#26231e)";
        ctx.stage.appendChild(msg);
      },
      render(ctx) {
        var _a, _b;
        const { logE, sigma, dist } = ctx.state;
        const th = (i) => skew(Z[i], dist) * sigma;
        const fracAt = (x) => {
          let n = 0;
          for (let i = 0; i < N; i++) if (th(i) <= x) n++;
          return n / N;
        };
        const dAt = (x) => DMIN + (DMAX - DMIN) * fracAt(x);
        let developed = 0;
        ctx.stage.querySelectorAll("[data-cell]").forEach((c) => {
          const i = Number(c.dataset.cell);
          const on = th(i) <= logE;
          if (on) developed++;
          c.setAttribute("fill", on ? SILVER : "none");
          c.setAttribute("stroke", on ? SILVER : HAIR);
        });
        let full = "", part = "", gmax = 0;
        let prev = null;
        for (let k = 0; k <= 120; k++) {
          const x = LO + (HI - LO) * k / 120;
          const d = dAt(x);
          const px = sx(x), py = sy(d);
          full += (k ? " L" : "M") + px + " " + py;
          if (x <= logE) part += (part ? " L" : "M") + px + " " + py;
          if (prev) {
            const g = (d - prev[1]) / (x - prev[0]);
            if (g > gmax) gmax = g;
          }
          prev = [x, d];
        }
        const q = (s) => ctx.stage.querySelector(s);
        (_a = q("[data-curve]")) == null ? void 0 : _a.setAttribute("d", full);
        (_b = q("[data-grown]")) == null ? void 0 : _b.setAttribute("d", part || `M${sx(LO)} ${sy(DMIN)}`);
        const dNow = dAt(logE);
        const dot = q("[data-dot]");
        dot == null ? void 0 : dot.setAttribute("cx", String(sx(logE)));
        dot == null ? void 0 : dot.setAttribute("cy", String(sy(dNow)));
        const hl = q("[data-hline]");
        if (hl) {
          hl.setAttribute("x1", String(PX));
          hl.setAttribute("y1", String(sy(dNow)));
          hl.setAttribute("x2", String(sx(logE)));
          hl.setAttribute("y2", String(sy(dNow)));
        }
        const toe = q("[data-toe]");
        toe == null ? void 0 : toe.setAttribute("x", String(sx(-2.1)));
        toe == null ? void 0 : toe.setAttribute("y", String(sy(DMIN) - 6));
        const sh = q("[data-sh]");
        sh == null ? void 0 : sh.setAttribute("x", String(sx(2.1)));
        sh == null ? void 0 : sh.setAttribute("y", String(sy(DMAX) - 8));
        const f = fracAt(logE);
        const region = f < 0.12 ? "\u8DBE\u90E8" : f > 0.88 ? "\u80A9\u90E8" : "\u76F4\u7EBF\u6BB5";
        const put = (k, v) => {
          const n = ctx.stage.querySelector(`[data-k="${k}"]`);
          if (n) n.textContent = v;
        };
        put("nd", `${developed} / ${N}`);
        put("dv", dNow.toFixed(2));
        put("gm", gmax.toFixed(2));
        put("rg", region);
        let m;
        if (sigma < 0.16) {
          m = "\u03C3 \u5DF2\u7ECF\u5F88\u5C0F\u4E86\uFF0C\u66F2\u7EBF\u6B63\u5728\u903C\u8FD1\u4E00\u4E2A\u9636\u8DC3\u3002\u4F46 \u03C3 = 0 \u9700\u8981\u6240\u6709\u6676\u4F53\u7684\u9608\u503C\u5B8C\u5168\u76F8\u540C\uFF0C\u800C\u9608\u503C\u6765\u81EA\u6676\u4F53\u5C3A\u5BF8\u4E0E\u611F\u5149\u4E2D\u5FC3\u6548\u7387\u7684\u968F\u673A\u5206\u5E03\u2014\u2014\u786C\u80A9\u90E8\u4E0D\u662F\u6CA1\u4EBA\u60F3\u505A\uFF0C\u662F\u7269\u7406\u4E0A\u505A\u4E0D\u5230\u3002";
        } else if (f > 0.88) {
          m = "\u80A9\u90E8 = \u9608\u503C\u5206\u5E03\u7684\u53F3\u5C3E\u3002\u6676\u4F53\u5FEB\u7528\u5B8C\u4E86\uFF0C\u518D\u52A0\u5149\u4E5F\u6CA1\u6709\u591A\u5C11\u9897\u53EF\u4EE5\u7FFB\u9ED1\u2014\u2014\u9AD8\u5149\u56E0\u6B64\u88AB\u67D4\u548C\u538B\u7F29\uFF0C\u800C\u4E0D\u662F\u4E00\u5200\u5207\u5E73\u3002";
        } else if (f < 0.12) {
          m = `\u8DBE\u90E8 = \u9608\u503C\u5206\u5E03\u7684\u5DE6\u5C3E\u3002\u6CE8\u610F\u66F2\u7EBF\u4E0D\u662F\u4ECE 0 \u5F00\u59CB\u7684\u2014\u2014\u90A3 ${DMIN.toFixed(2)} \u662F base + fog\uFF0C\u6240\u4EE5\u80F6\u7247\u7684\u6697\u90E8\u4ECE\u6765\u4E0D\u662F\u7EAF\u9ED1\u3002`;
        } else {
          m = "\u76F4\u7EBF\u6BB5\u7684\u659C\u7387 \u03B3 \u5C31\u662F\u9608\u503C\u5206\u5E03\u7684\u96C6\u4E2D\u7A0B\u5EA6\u3002\u03C3 \u8D8A\u5C0F\uFF0C\u6676\u4F53\u4EEC\u8D8A\u6B65\u8C03\u4E00\u81F4\uFF0C\u7FFB\u9ED1\u8D8A\u96C6\u4E2D\uFF0C\u03B3 \u8D8A\u9661\u3002";
        }
        put("msg", m);
      }
    })
  );
})();
