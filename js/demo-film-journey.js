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
  var NS = "http://www.w3.org/2000/svg";
  function el2(tag, a = {}) {
    const n = document.createElementNS(NS, tag);
    for (const k in a) n.setAttribute(k, String(a[k]));
    return n;
  }
  function txt(s, a) {
    const t = el2("text", a);
    t.textContent = s;
    return t;
  }
  var MUT = "var(--ink-muted,#8b8880)";
  var HAIR = "var(--hairline,#d8d4cb)";
  var GLASS = "#6f9fd0";
  var LIGHT = "#e8b93c";
  var BEATS = [
    // 第一幕 · 相机剖面 ───────────────────────────
    {
      stage: "camera",
      t: 0.02,
      name: "01 \xB7 \u9633\u5149\u5C04\u5165\u955C\u5934",
      say: "\u4E00\u675F\u6765\u81EA\u88AB\u6444\u7269\u7684\u53CD\u5C04\u5149\uFF0C\u4ECE\u5DE6\u4FA7\u5C04\u5165\u955C\u5934\u6700\u524D\u7247\u3002\u6B64\u523B\u5B83\u8FD8\u662F\u5B8C\u6574\u7684\u8FDE\u7EED\u5149\u8C31\uFF0C\u5305\u542B\u6240\u6709\u6CE2\u957F\u3002",
      how: "\u53CD\u5C04\u5149\u8C31\u7531\u7269\u4F53\u8868\u9762\u5206\u5B50\u51B3\u5B9A\u3002\u4FE1\u606F\u6B64\u523B\u662F\u5B8C\u6574\u7684\u3002",
      why: ""
    },
    {
      stage: "camera",
      t: 0.2,
      name: "02 \xB7 \u7A7F\u8FC7\u955C\u7247\u4E0E\u5149\u5708",
      say: "\u5149\u88AB\u4E00\u7EC4\u73BB\u7483\u955C\u7247\u53CD\u590D\u6298\u5C04\u3001\u6536\u675F\uFF0C\u518D\u7A7F\u8FC7\u5149\u5708\u90A3\u5708\u91D1\u5C5E\u53F6\u7247\u3002\u53F6\u7247\u5F00\u591A\u5927\uFF0C\u51B3\u5B9A\u653E\u591A\u5C11\u5149\u8FDB\u6765\u3002",
      how: "\u6298\u5C04\u4E0E\u8272\u6563\u3002\u4E0D\u540C\u6CE2\u957F\u6298\u5C04\u7387\u7565\u6709\u5DEE\u5F02\uFF0C\u8FD9\u5C31\u662F\u8272\u5DEE\u3002",
      why: "\u955C\u5934\u7684\u73BB\u7483\u914D\u65B9\u4E0E\u9540\u819C\u4F1A\u8BA9\u5149\u8C31\u8F7B\u5FAE\u504F\u79FB\u2014\u2014\u6240\u8C13\u300C\u955C\u5934\u5473\u300D\uFF0C\u4E00\u90E8\u5206\u5C31\u5728\u8FD9\u91CC\u3002"
    },
    {
      stage: "camera",
      t: 0.4,
      name: "03 \xB7 \u6253\u5728 45\xB0 \u53CD\u5149\u955C\u4E0A",
      say: "\u5355\u53CD\u7684\u6838\u5FC3\u673A\u5173\uFF1A\u4E00\u9762\u659C\u7F6E\u7684\u53CD\u5149\u955C\uFF0C\u6B64\u523B\u6B63\u628A\u5149\u5411\u4E0A\u6298\u8FDB\u4E94\u68F1\u955C\uFF0C\u8BA9\u4F60\u80FD\u5728\u53D6\u666F\u5668\u91CC\u770B\u89C1\u5373\u5C06\u62CD\u4E0B\u7684\u753B\u9762\u3002",
      how: "\u7EAF\u53CD\u5C04\u3002\u5149\u88AB\u6298\u4E0A\u53BB\uFF0C\u4E00\u70B9\u6CA1\u8FDB\u5230\u80F6\u7247\u3002",
      why: "\u6240\u4EE5\u53D6\u666F\u65F6\u80F6\u7247\u662F\u5168\u9ED1\u7684\u2014\u2014\u5B83\u8FD8\u6CA1\u88AB\u66DD\u5149\u3002"
    },
    {
      stage: "camera",
      t: 0.58,
      name: "04 \xB7 \u53CD\u5149\u955C\u5F39\u8D77",
      say: "\u6309\u4E0B\u5FEB\u95E8\u7684\u4E00\u77AC\uFF0C\u53CD\u5149\u955C\u556A\u5730\u5411\u4E0A\u7FFB\u8D77\u3001\u8D34\u4F4F\u9876\u90E8\u3002\u53D6\u666F\u5668\u77AC\u95F4\u5168\u9ED1\u2014\u2014\u901A\u5F80\u80F6\u7247\u7684\u8DEF\uFF0C\u8BA9\u5F00\u4E86\u3002\u4F60\u542C\u89C1\u7684\u300C\u5494\u300D\uFF0C\u4E00\u534A\u662F\u5B83\u3002",
      how: "\u673A\u68B0\u52A8\u4F5C\u3002\u5149\u8DEF\u88AB\u5207\u6362\u3002",
      why: ""
    },
    {
      stage: "camera",
      t: 0.78,
      name: "05 \xB7 \u5FEB\u95E8\u5E55\u5E18\u62C9\u5F00",
      say: "\u7D27\u8D34\u80F6\u7247\u524D\u65B9\u7684\u4E24\u7247\u5E55\u5E18\u62C9\u5F00\u4E00\u9053\u7F1D\uFF0C\u5149\u7B2C\u4E00\u6B21\u7167\u5230\u80F6\u7247\u30021/125 \u79D2\uFF0C\u516B\u6BEB\u79D2\u3002",
      how: "\u66DD\u5149\u91CF = \u7167\u5EA6 \xD7 \u65F6\u95F4\u3002\u8FD9\u4E2A\u4E58\u79EF\u51B3\u5B9A\u540E\u9762\u4E00\u5207\u3002",
      why: "\u4F46\u8FD9\u4E2A\u4E58\u6CD5\u5728\u5F31\u5149\u4E0B\u4F1A\u5931\u6548\u2014\u2014\u4E0B\u4E00\u5E55\u4F1A\u770B\u5230\u4E3A\u4EC0\u4E48\u3002"
    },
    {
      stage: "camera",
      t: 1,
      name: "06 \xB7 \u5149\u62B5\u8FBE\u80F6\u7247",
      say: "\u5149\u843D\u5728\u7247\u7A97\u91CC\u90A3\u6761 35mm \u80F6\u7247\u4E0A\u3002\u8868\u9762\u5341\u51E0\u5C42\u836F\u819C\uFF0C\u603B\u539A\u4E0D\u5230 0.02 \u6BEB\u7C73\u3002\u771F\u6B63\u7684\u5316\u5B66\u620F\uFF0C\u4ECE\u8FD9\u91CC\u5F00\u59CB\u3002",
      how: "\u955C\u5934\u62C9\u8FD1\u4E00\u4E07\u500D\u2014\u2014\u4E0B\u4E00\u5E55\u6211\u4EEC\u94BB\u8FDB\u8FD9\u5C42\u836F\u819C\u91CC\u3002",
      why: ""
    },
    // 第二幕 · 乳剂内部 ───────────────────────────
    {
      stage: "emulsion",
      t: 0.12,
      name: "07 \xB7 \u7A7F\u8FC7\u4E09\u5C42\u4E73\u5242",
      say: "\u73B0\u5728\u6211\u4EEC\u5728\u836F\u819C\u5185\u90E8\u3002\u5149\u4ECE\u4E0A\u5F80\u4E0B\u7A7F\uFF1A\u5148\u662F\u84DD\u654F\u5C42\uFF0C\u518D\u7A7F\u8FC7\u4E00\u7247\u9EC4\u8272\u6EE4\u955C\uFF0C\u7136\u540E\u7EFF\u654F\u5C42\u3001\u7EA2\u654F\u5C42\u3002",
      how: "\u5364\u5316\u94F6\u5929\u751F\u53EA\u5BF9\u84DD\u5149\u654F\u611F\uFF1B\u7EFF\u654F\u7EA2\u654F\u9760\u589E\u611F\u67D3\u6599\u6269\u5C55\u3002\u90A3\u7247\u9EC4\u6EE4\u5C42\u6321\u4F4F\u6F0F\u4E0B\u7684\u84DD\u5149\uFF0C\u4E0D\u8BA9\u5B83\u6C61\u67D3\u4E0B\u5C42\u3002",
      why: "\u4E09\u5C42\u6DF1\u5EA6\u4E0D\u540C\u3001\u611F\u5149\u5EA6\u4E0D\u540C\u2014\u2014\u8FD9\u662F\u4E09\u6761\u7279\u6027\u66F2\u7EBF\u65E0\u6CD5\u5E73\u884C\u7684\u7269\u7406\u8D77\u70B9\uFF0C\u4E5F\u662F crossover \u7684\u6839\u3002"
    },
    {
      stage: "emulsion",
      t: 0.4,
      name: "08 \xB7 \u6676\u4F53\u5438\u6536\u5149\u5B50",
      say: "\u955C\u5934\u518D\u63A8\u8FD1\u3002\u4E00\u9897\u5364\u5316\u94F6\u6676\u4F53\u63A5\u4F4F\u4E86\u4E00\u4E2A\u5149\u5B50\uFF0C\u5185\u90E8\u6FC0\u53D1\u51FA\u4E00\u4E2A\u81EA\u7531\u7535\u5B50\u3002",
      how: "\u5149\u5B50 \u2192 \u7535\u5B50\u7A7A\u7A74\u5BF9\u3002\u6676\u4F53\u53EA\u77E5\u9053\u300C\u6765\u4E86\u4E2A\u5149\u5B50\u300D\uFF0C\u4E0D\u77E5\u9053\u5B83\u662F\u7EA2\u662F\u84DD\u2014\u2014\u6CE2\u957F\u4FE1\u606F\u5728\u8FD9\u4E00\u6B65\u5C31\u6CA1\u4E86\u3002",
      why: "\u989C\u8272\u9760\u4E09\u5C42\u5404\u81EA\u589E\u611F\u533A\u5206\uFF0C\u4E0D\u9760\u5355\u9897\u6676\u4F53\u3002"
    },
    {
      stage: "emulsion",
      t: 0.68,
      name: "09 \xB7 \u6F5C\u5F71\u5F62\u6210",
      say: "\u7535\u5B50\u88AB\u6676\u4F53\u8868\u9762\u4E00\u4E2A\u611F\u5149\u4E2D\u5FC3\u6349\u4F4F\uFF0C\u5438\u5F15\u94F6\u79BB\u5B50\u8FD8\u539F\u6210\u94F6\u539F\u5B50\u3002\u7136\u540E\u7B2C\u4E8C\u4E2A\u3001\u7B2C\u4E09\u4E2A\uFF0C\u6162\u6162\u7D2F\u79EF\u3002",
      how: "\u94F6\u539F\u5B50\u7C07\u5FC5\u987B\u6512\u5230\u7EA6 3\u20134 \u4E2A\u624D\u7A33\u5B9A\uFF0C\u4E0D\u591F\u5C31\u6563\u56DE\u53BB\u3002\u8FD9\u662F\u4E00\u9053\u9608\u503C\u95E8\u3002",
      why: "\u5F31\u5149\u4E0B\u7535\u5B50\u6765\u5F97\u592A\u6162\uFF0C\u7C07\u5728\u4E0B\u4E00\u4E2A\u7535\u5B50\u5230\u8FBE\u524D\u5C31\u8870\u53D8\u2014\u2014\u8FD9\u5C31\u662F\u5012\u6613\u5F8B\u5931\u6548\uFF0C\u957F\u66DD\u5149\u591C\u666F\u504F\u8272\u7684\u539F\u56E0\u3002"
    },
    {
      stage: "emulsion",
      t: 1,
      name: "10 \xB7 \u5FEB\u95E8\u5173\u95ED\uFF0C\u4EC0\u4E48\u4E5F\u770B\u4E0D\u89C1",
      say: "\u516B\u6BEB\u79D2\u7ED3\u675F\uFF0C\u4F60\u5377\u7247\u3002\u800C\u80F6\u7247\u770B\u4E0A\u53BB\u548C\u521A\u624D\u4E00\u6A21\u4E00\u6837\u2014\u2014\u6CA1\u6709\u989C\u8272\uFF0C\u6CA1\u6709\u56FE\u50CF\uFF0C\u4EC0\u4E48\u90FD\u6CA1\u6709\u3002",
      how: "\u6F5C\u5F71\u53EA\u662F\u6BCF\u9897\u6676\u4F53\u8868\u9762\u51E0\u4E2A\u94F6\u539F\u5B50\uFF0C\u592A\u5C0F\u4E86\uFF0C\u8089\u773C\u548C\u663E\u5FAE\u955C\u90FD\u770B\u4E0D\u89C1\u3002",
      why: "\u6B64\u523B\u6574\u5F20\u7167\u7247\u53EA\u5B58\u5728\u4E8E\u300C\u54EA\u4E9B\u6676\u4F53\u8FC7\u4E86\u9608\u503C\u300D\u8FD9\u4E2A\u9690\u5F62\u7684\u4E8C\u503C\u72B6\u6001\u91CC\u3002"
    },
    // 第三幕 · 暗房工作台 ─────────────────────────
    {
      stage: "darkroom",
      t: 0.1,
      name: "11 \xB7 \u5168\u9ED1\u4E2D\u4E0A\u5377",
      say: "\u6362\u5230\u6697\u623F\u3002\u7EA2\u706F\u4E0B\uFF0C\u4F60\u6478\u9ED1\u628A\u80F6\u7247\u5377\u4E0A\u51B2\u6D17\u76D8\uFF0C\u88C5\u8FDB\u4E0D\u900F\u5149\u7684\u51B2\u6D17\u7F50\u3002",
      how: "\u6F5C\u5F71\u4ECD\u662F\u6F5C\u5F71\uFF0C\u8FD8\u6CA1\u88AB\u653E\u5927\u3002",
      why: ""
    },
    {
      stage: "darkroom",
      t: 0.28,
      name: "12 \xB7 \u663E\u5F71\u6DB2 38\xB0C",
      say: "\u7B2C\u4E00\u7F50\uFF0C\u663E\u5F71\u6DB2\u3002\u6E29\u5EA6\u5FC5\u987B\u5361\u5728 38 \u5EA6\uFF0C\u8BEF\u5DEE\u4E0D\u8D85\u8FC7\u96F6\u70B9\u51E0\u5EA6\uFF0C\u8BA1\u65F6\u5F00\u59CB\u3002",
      how: "\u663E\u5F71\u5242\u5728\u6F5C\u5F71\u5904\u8FD8\u539F\u94F6\u79BB\u5B50\uFF0C\u65B0\u751F\u7684\u94F6\u53C8\u50AC\u5316\u66F4\u591A\u8FD8\u539F\u2014\u2014\u81EA\u50AC\u5316\u30024 \u4E2A\u94F6\u539F\u5B50\u5F15\u53D1\u6574\u9897\u6676\u4F53\u8FD8\u539F\u3002",
      why: "\u589E\u76CA 10\u2078\u201310\u2079 \u500D\u3002\u5355\u9897\u6676\u4F53\u662F\u4E8C\u503C\u7684\uFF1A\u8981\u4E48\u5168\u9ED1\uFF0C\u8981\u4E48\u5B8C\u5168\u4E0D\u663E\u5F71\u3002\u8FDE\u7EED\u5F71\u8C03\u662F\u51E0\u767E\u4E07\u4E2A\u4E8C\u503C\u63A2\u6D4B\u5668\u7684\u7EDF\u8BA1\u5047\u8C61\u3002"
    },
    {
      stage: "darkroom",
      t: 0.44,
      name: "13 \xB7 \u67D3\u6599\u5728\u94F6\u7684\u539F\u5730\u751F\u6210",
      say: "\u540C\u4E00\u7F50\u91CC\uFF0C\u53E6\u4E00\u573A\u53CD\u5E94\u5728\u8FDB\u884C\u3002\u663E\u5F71\u5242\u4EA4\u51FA\u7535\u5B50\u540E\u88AB\u6C27\u5316\uFF0C\u968F\u5373\u4E0E\u836F\u819C\u91CC\u9884\u57CB\u7684\u6210\u8272\u5242\u7ED3\u5408\uFF0C\u957F\u51FA\u4E00\u56E2\u67D3\u6599\u4E91\u3002",
      how: "\u67D3\u6599\u4E91\u5C31\u5728\u94F6\u9897\u7C92\u7684\u4F4D\u7F6E\u751F\u6210\uFF0C\u7EE7\u627F\u5B83\u7684\u7A7A\u95F4\u5206\u5E03\u3002",
      why: "\u8FD9\u662F\u9897\u7C92\u611F\u7684\u771F\u6B63\u6765\u6E90\u2014\u2014\u4F60\u770B\u5230\u7684\u300C\u9897\u7C92\u300D\u4E0D\u662F\u53E0\u52A0\u7684\u566A\u70B9\uFF0C\u662F\u4ECB\u8D28\u672C\u8EAB\u7684\u7EDF\u8BA1\u6DA8\u843D\u3002"
    },
    {
      stage: "darkroom",
      t: 0.58,
      name: "14 \xB7 \u505C\u663E\u3001\u6C34\u6D17",
      say: "\u5012\u6389\u663E\u5F71\u6DB2\uFF0C\u505C\u663E\u6DB2\u6441\u505C\u53CD\u5E94\uFF0C\u51B2\u6C34\u3002\u591A\u663E\u4E00\u79D2\u548C\u5C11\u663E\u4E00\u79D2\uFF0C\u53CD\u5DEE\u90FD\u4E0D\u540C\uFF0C\u800C\u4E14\u56DE\u4E0D\u53BB\u3002",
      how: "pH \u9AA4\u964D\uFF0C\u663E\u5F71\u5242\u5931\u6D3B\u3002",
      why: ""
    },
    {
      stage: "darkroom",
      t: 0.72,
      name: "15 \xB7 \u6F02\u767D\uFF1A\u628A\u94F6\u53D8\u56DE\u53BB",
      say: "\u6700\u53CD\u76F4\u89C9\u7684\u4E00\u6B65\uFF1A\u628A\u521A\u8F9B\u82E6\u751F\u6210\u7684\u91D1\u5C5E\u94F6\uFF0C\u5168\u90E8\u6C27\u5316\u56DE\u5364\u5316\u94F6\u3002",
      how: "\u6F02\u767D\u5242\u628A\u94F6\u6C27\u5316\u6210\u53EF\u6EB6\u94F6\u76D0\u3002",
      why: "\u94F6\u7684\u4EFB\u52A1\u5DF2\u7ECF\u5B8C\u6210\u2014\u2014\u5B83\u53EA\u662F\u628A\u5149\u4FE1\u53F7\u653E\u5927\u3001\u8F6C\u8BD1\u7ED9\u67D3\u6599\u7684\u4E2D\u95F4\u4EBA\u3002"
    },
    {
      stage: "darkroom",
      t: 0.86,
      name: "16 \xB7 \u5B9A\u5F71\uFF1A\u94F6\u5168\u90E8\u79BB\u5F00",
      say: "\u5B9A\u5F71\u6DB2\u6EB6\u6389\u6240\u6709\u5364\u5316\u94F6\uFF0C\u968F\u6C34\u6D41\u8D70\u3002\u5230\u8FD9\u4E00\u523B\uFF0C\u8FD9\u6761\u5E95\u7247\u91CC\u4E00\u4E2A\u94F6\u539F\u5B50\u90FD\u6CA1\u6709\u4E86\u3002",
      how: "\u7559\u4E0B\u7684\u53EA\u6709\u67D3\u6599\u4E91\uFF0C\u548C\u94F6\u9897\u7C92\u5F53\u5E74\u7AD9\u8FC7\u7684\u4F4D\u7F6E\u3002",
      why: "\u6240\u4EE5\u300C\u80F6\u7247\u9897\u7C92\u300D\u4E25\u683C\u8BF4\u4E0D\u662F\u94F6\u7684\u9897\u7C92\uFF0C\u662F\u67D3\u6599\u7EE7\u627F\u7684\u3001\u94F6\u7684\u5F71\u5B50\u3002"
    },
    {
      stage: "darkroom",
      t: 1,
      name: "17 \xB7 \u6A59\u8272\u7684\u5E95\u7247",
      say: "\u667E\u5E72\uFF0C\u5BF9\u7740\u706F\u4E3E\u8D77\u6765\u2014\u2014\u6574\u6761\u7247\u5B50\u662F\u6A59\u8272\u7684\uFF0C\u56FE\u50CF\u662F\u8D1F\u7684\u3002",
      how: "\u6A59\u8272\u6765\u81EA\u6709\u8272\u6210\u8272\u5242\uFF1A\u67D3\u6599\u6709\u4E0D\u826F\u5438\u6536\uFF0C\u7528\u4E00\u5C42\u4E92\u8865\u5E95\u8272\u62B5\u6D88\u5B83\u3002",
      why: "\u6240\u4EE5\u5E95\u7247\u989C\u8272\u672C\u6765\u5C31\u4E0D\u300C\u51C6\u300D\uFF0C\u6A59\u7F69\u662F\u4FEE\u6B63\u624B\u6BB5\uFF0C\u4E0D\u662F\u7F3A\u9677\u3002\u626B\u63CF\u65F6\u4F1A\u628A\u5B83\u53BB\u6389\u3002"
    },
    {
      stage: "darkroom",
      t: 1,
      name: "18 \xB7 \u626B\u63CF\u6210\u4E09\u4E2A\u6570\u5B57",
      say: "\u6700\u540E\u4E00\u6B65\u3002\u626B\u63CF\u4EEA\u7684\u706F\u4ECE\u80CC\u9762\u7A7F\u8FC7\u5E95\u7247\uFF0C\u67D3\u6599\u6309\u6CE2\u957F\u6EE4\u5149\uFF0C\u843D\u5230\u4F20\u611F\u5668\u4E0A\uFF0C\u91CF\u5316\u3002\u4E00\u675F\u5149\u8D70\u4E86\u8FD9\u4E48\u8FDC\uFF0C\u7EC8\u4E8E\u53D8\u6210\u4E09\u4E2A 0\u2013255 \u7684\u6574\u6570\u3002",
      how: "Beer-Lambert\uFF1A\u900F\u8FC7\u7387 T(\u03BB)=10^\u2212D(\u03BB)\u3002\u6B64\u540E\u6240\u6709\u64CD\u4F5C\u90FD\u53EA\u662F\u300C\u6309\u89C4\u5219\u6539\u8FD9\u4E09\u4E2A\u6570\u300D\u3002",
      why: "\u800C\u524D\u9762\u5341\u4E03\u6B65\u91CC\u53D1\u751F\u7684\u4E00\u5207\uFF0C\u6CA1\u6709\u4EFB\u4F55\u4E00\u6B65\u662F\u67E5\u627E\u8868\u80FD\u5012\u63A8\u56DE\u53BB\u7684\u3002\u8FD9\u5C31\u662F\u6570\u7801 LUT \u6C38\u8FDC\u300C\u50CF\u4F46\u4E0D\u662F\u300D\u7684\u539F\u56E0\u3002"
    }
  ];
  var N = BEATS.length;
  function buildCamera() {
    const g = el2("g");
    g.dataset.stage = "camera";
    g.appendChild(el2("path", {
      d: "M250 96 H602 a12 12 0 0 1 12 12 V252 a12 12 0 0 1 -12 12 H250 a10 10 0 0 1 -10 -10 V106 a10 10 0 0 1 10 -10 Z",
      fill: MUT,
      "fill-opacity": 0.06,
      stroke: HAIR,
      "stroke-width": 1.5
    }));
    g.appendChild(el2("path", {
      d: "M332 96 L372 50 L472 50 L512 96 Z",
      fill: MUT,
      "fill-opacity": 0.09,
      stroke: HAIR,
      "stroke-width": 1.3
    }));
    g.appendChild(txt("\u4E94\u68F1\u955C \xB7 \u53D6\u666F\u5668", { x: 422, y: 44, "text-anchor": "middle", "font-size": 10.5, fill: MUT }));
    g.appendChild(el2("rect", { x: 118, y: 156, width: 132, height: 52, rx: 4, fill: MUT, "fill-opacity": 0.07, stroke: HAIR, "stroke-width": 1.3 }));
    [0, 1].forEach(
      (k) => g.appendChild(el2("ellipse", { cx: 150 + k * 48, cy: 182, rx: 9, ry: 24, fill: GLASS, "fill-opacity": 0.35, stroke: GLASS, "stroke-width": 1.2 }))
    );
    g.appendChild(txt("\u955C\u5934", { x: 150, y: 232, "text-anchor": "middle", "font-size": 10.5, fill: MUT }));
    const iris = el2("g");
    iris.dataset.part = "iris";
    iris.appendChild(el2("path", { d: "M236 158 L236 174 L244 178 L244 158 Z", fill: MUT, "fill-opacity": 0.5 }));
    iris.appendChild(el2("path", { d: "M236 206 L236 190 L244 186 L244 206 Z", fill: MUT, "fill-opacity": 0.5 }));
    g.appendChild(iris);
    g.appendChild(txt("\u5149\u5708", { x: 240, y: 240, "text-anchor": "middle", "font-size": 9.5, fill: MUT }));
    g.appendChild(el2("line", { x1: 300, y1: 216, x2: 342, y2: 156, stroke: GLASS, "stroke-width": 3.4, "data-mirror": "down" }));
    g.appendChild(el2("line", { x1: 300, y1: 156, x2: 354, y2: 156, stroke: GLASS, "stroke-width": 3.4, "data-mirror": "up", opacity: 0 }));
    g.appendChild(txt("\u53CD\u5149\u955C", { x: 322, y: 250, "text-anchor": "middle", "font-size": 9.5, fill: MUT }));
    g.appendChild(el2("rect", { x: 542, y: 116, width: 8, height: 130, rx: 2, fill: MUT, "fill-opacity": 0.55, "data-blade": "1" }));
    g.appendChild(txt("\u5FEB\u95E8", { x: 546, y: 260, "text-anchor": "middle", "font-size": 9.5, fill: MUT }));
    g.appendChild(el2("rect", { x: 568, y: 116, width: 10, height: 130, rx: 2, fill: "#8a6b4a", "fill-opacity": 0.5, stroke: HAIR, "stroke-width": 1, "data-part": "film" }));
    g.appendChild(txt("\u80F6\u7247", { x: 573, y: 260, "text-anchor": "middle", "font-size": 9.5, fill: MUT }));
    const ray = el2("g");
    ray.dataset.ray = "1";
    g.appendChild(ray);
    return g;
  }
  function renderCameraRay(g, t) {
    var _a, _b, _c;
    const ray = g.querySelector("[data-ray]");
    if (!ray) return;
    while (ray.firstChild) ray.removeChild(ray.firstChild);
    const seg = (x1, y1, x2, y2, hot = false) => ray.appendChild(el2("line", {
      x1,
      y1,
      x2,
      y2,
      stroke: LIGHT,
      "stroke-width": hot ? 3.4 : 2.4,
      "stroke-linecap": "round",
      opacity: hot ? 1 : 0.85
    }));
    const mirrorUp = t >= 0.55;
    const shutterOpen = t >= 0.72;
    seg(30, 182, 141, 182, t < 0.2);
    if (t >= 0.18) seg(159, 182, 240, 182, t < 0.4);
    if (t >= 0.38 && !mirrorUp) {
      seg(240, 182, 300, 200, false);
      seg(300, 200, 320, 156, true);
      seg(320, 156, 412, 70, true);
    }
    if (mirrorUp) {
      seg(240, 182, 542, 182, t < 0.78);
      if (shutterOpen) seg(550, 182, 568, 182, true);
    }
    (_a = g.querySelector('[data-mirror="down"]')) == null ? void 0 : _a.setAttribute("opacity", mirrorUp ? "0" : "1");
    (_b = g.querySelector('[data-mirror="up"]')) == null ? void 0 : _b.setAttribute("opacity", mirrorUp ? "1" : "0");
    (_c = g.querySelector('[data-blade="1"]')) == null ? void 0 : _c.setAttribute("height", shutterOpen ? "72" : "130");
  }
  function buildEmulsion() {
    const g = el2("g");
    g.dataset.stage = "emulsion";
    const layers = [
      ["#5f8ec4", "\u84DD\u654F\u5C42"],
      ["#d9c23a", "\u9EC4\u6EE4\u5C42"],
      ["#4f9e57", "\u7EFF\u654F\u5C42"],
      ["#c1503f", "\u7EA2\u654F\u5C42"]
    ];
    const top = 70, lh = 34;
    layers.forEach(([c, nm], k) => {
      g.appendChild(el2("rect", { x: 60, y: top + k * lh, width: 380, height: lh - 4, fill: c, "fill-opacity": 0.5 }));
      g.appendChild(txt(nm, { x: 446, y: top + k * lh + 20, "font-size": 11, fill: MUT }));
      for (let j = 0; j < 6; j++) {
        g.appendChild(el2("polygon", {
          points: hexPts(90 + j * 58, top + k * lh + 14, 9),
          fill: "none",
          stroke: MUT,
          "stroke-width": 1,
          opacity: 0.5
        }));
      }
    });
    g.appendChild(el2("rect", { x: 60, y: top + 4 * lh, width: 380, height: 14, fill: "#8a6b4a", "fill-opacity": 0.5 }));
    g.appendChild(txt("\u7247\u57FA", { x: 446, y: top + 4 * lh + 11, "font-size": 11, fill: MUT }));
    const zoom = el2("g");
    zoom.dataset.zoom = "1";
    zoom.setAttribute("opacity", "0");
    zoom.appendChild(el2("line", { x1: 300, y1: 100, x2: 500, y2: 70, stroke: HAIR, "stroke-width": 1, "stroke-dasharray": "3 3" }));
    zoom.appendChild(el2("line", { x1: 300, y1: 128, x2: 500, y2: 210, stroke: HAIR, "stroke-width": 1, "stroke-dasharray": "3 3" }));
    zoom.appendChild(el2("polygon", { points: hexPts(560, 150, 60), fill: MUT, "fill-opacity": 0.05, stroke: MUT, "stroke-width": 1.5, "data-crystal": "1" }));
    const cluster = el2("g");
    cluster.dataset.cluster = "1";
    zoom.appendChild(cluster);
    zoom.appendChild(el2("line", { x1: 470, y1: 60, x2: 540, y2: 128, stroke: LIGHT, "stroke-width": 2.4, "stroke-linecap": "round", "data-photon": "1" }));
    g.appendChild(zoom);
    const ray = el2("g");
    ray.dataset.eray = "1";
    g.appendChild(ray);
    return g;
  }
  function hexPts(cx, cy, r) {
    const p = [];
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2 - Math.PI / 2;
      p.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
    }
    return p.join(" ");
  }
  function renderEmulsion(g, beatIdx, t) {
    const zoom = g.querySelector("[data-zoom]");
    const eray = g.querySelector("[data-eray]");
    if (!zoom || !eray) return;
    const showZoom = beatIdx >= 7;
    zoom.setAttribute("opacity", showZoom ? "1" : "0");
    const layerRayVisible = beatIdx === 6;
    while (eray.firstChild) eray.removeChild(eray.firstChild);
    if (layerRayVisible) {
      [120, 240, 360].forEach((x) => {
        eray.appendChild(el2("line", { x1: x, y1: 40, x2: x, y2: 216, stroke: LIGHT, "stroke-width": 2.6, "stroke-linecap": "round", opacity: 0.85 }));
      });
    }
    const cluster = g.querySelector("[data-cluster]");
    if (cluster) {
      while (cluster.firstChild) cluster.removeChild(cluster.firstChild);
      const atoms = Math.min(4, Math.floor(t * 5));
      const spots = [[548, 148], [560, 156], [570, 146], [556, 138]];
      for (let k = 0; k < atoms; k++) {
        cluster.appendChild(el2("circle", { cx: spots[k][0], cy: spots[k][1], r: 5, fill: "#8e79c9" }));
      }
      if (atoms >= 4) {
        cluster.appendChild(txt("\u22654 \u7A33\u5B9A", { x: 560, y: 200, "text-anchor": "middle", "font-size": 10, fill: MUT }));
      }
    }
    const photon = g.querySelector("[data-photon]");
    photon == null ? void 0 : photon.setAttribute("opacity", t < 0.4 ? "1" : "0.25");
  }
  function buildDarkroom() {
    const g = el2("g");
    g.dataset.stage = "darkroom";
    g.appendChild(el2("rect", { x: 20, y: 20, width: 640, height: 240, rx: 8, fill: "#1a1512", "fill-opacity": 0.5 }));
    g.appendChild(el2("circle", { cx: 60, cy: 52, r: 12, fill: "#c23a2a", opacity: 0.8 }));
    g.appendChild(el2("circle", { cx: 60, cy: 52, r: 22, fill: "#c23a2a", opacity: 0.12 }));
    g.appendChild(txt("\u5B89\u5168\u7EA2\u706F", { x: 90, y: 56, "font-size": 10.5, fill: "#d98", "text-anchor": "start" }));
    const tanks = [
      ["#3f9e8c", "\u663E\u5F71"],
      ["#5f8ec4", "\u505C\u663E"],
      ["#c98a3a", "\u6F02\u767D"],
      ["#9a8fc4", "\u5B9A\u5F71"]
    ];
    tanks.forEach(([c, nm], k) => {
      const x = 120 + k * 120;
      const tank = el2("g");
      tank.dataset.tank = String(k);
      tank.appendChild(el2("rect", { x, y: 150, width: 84, height: 90, rx: 4, fill: "none", stroke: HAIR, "stroke-width": 1.4 }));
      tank.appendChild(el2("rect", { x: x + 3, y: 178, width: 78, height: 59, fill: c, "fill-opacity": 0.35, "data-liquid": String(k) }));
      tank.appendChild(txt(nm, { x: x + 42, y: 256, "text-anchor": "middle", "font-size": 11, fill: MUT }));
      g.appendChild(tank);
    });
    g.appendChild(el2("line", { x1: 40, y1: 244, x2: 640, y2: 244, stroke: HAIR, "stroke-width": 1.5 }));
    const strip = el2("g");
    strip.dataset.strip = "1";
    strip.appendChild(el2("rect", { x: -20, y: -34, width: 40, height: 68, rx: 3, fill: "#3a3733", stroke: HAIR, "stroke-width": 1, "data-stripbody": "1" }));
    [-26, -10, 6, 22].forEach((y) => {
      strip.appendChild(el2("rect", { x: -17, y, width: 5, height: 5, fill: "var(--paper,#fff)", opacity: 0.7 }));
      strip.appendChild(el2("rect", { x: 12, y, width: 5, height: 5, fill: "var(--paper,#fff)", opacity: 0.7 }));
    });
    strip.setAttribute("transform", "translate(162,120)");
    g.appendChild(strip);
    return g;
  }
  function renderDarkroom(g, beatIdx, t) {
    var _a;
    const strip = g.querySelector("[data-strip]");
    const body = g.querySelector("[data-stripbody]");
    if (!strip || !body) return;
    const tankX = [162, 162, 162, 282, 402, 522, 522, 522];
    const local = Math.max(0, beatIdx - 10);
    const cx = (_a = tankX[Math.min(local, tankX.length - 1)]) != null ? _a : 162;
    const dipped = local >= 1 && local <= 5;
    strip.setAttribute("transform", `translate(${cx},${dipped ? 175 : 120})`);
    let fill = "#3a3733";
    if (local >= 2 && local <= 4) fill = "#5a4a5a";
    else if (local === 5) fill = "#c99a5a";
    else if (local >= 6) fill = "#d98b3a";
    body.setAttribute("fill", fill);
    g.querySelectorAll("[data-liquid]").forEach((liq, k) => {
      const active = k === Math.min(Math.max(local - 1, 0), 3) && dipped;
      liq.setAttribute("fill-opacity", active ? "0.55" : "0.3");
    });
  }
  mount(
    "film-journey",
    () => defineDemo({
      state: { p: 0, playing: false },
      controls: [
        { kind: "button", label: "\u25B6 \u64AD\u653E / \u6682\u505C", action: "toggle" },
        { kind: "button", label: "\u21BA \u56DE\u5230\u5F00\u5934", action: "reset" }
      ],
      actions: {
        toggle: (ctx) => ctx.set({ playing: !ctx.state.playing }),
        reset: (ctx) => ctx.set({ p: 0, playing: false })
      },
      setup(ctx) {
        const grid = ctx.stage.parentElement;
        if (grid) grid.style.gridTemplateColumns = "1fr";
        const svg = el2("svg", {
          viewBox: "0 0 680 280",
          style: "width:100%;height:auto;display:block"
        });
        svg.appendChild(buildCamera());
        svg.appendChild(buildEmulsion());
        svg.appendChild(buildDarkroom());
        ctx.stage.appendChild(svg);
        const bar = document.createElement("div");
        bar.style.cssText = "display:flex;align-items:center;gap:12px;margin:.9rem 0 1.1rem";
        const scrub = document.createElement("input");
        scrub.type = "range";
        scrub.min = "0";
        scrub.max = "1000";
        scrub.dataset.scrub = "1";
        scrub.style.cssText = "flex:1;accent-color:var(--bengara,#9d3b2f)";
        const cnt = document.createElement("span");
        cnt.dataset.cnt = "1";
        cnt.style.cssText = "font-size:.78rem;font-variant-numeric:tabular-nums;min-width:56px;text-align:right;color:var(--ink-muted,#6b6760)";
        bar.append(scrub, cnt);
        ctx.stage.appendChild(bar);
        scrub.addEventListener("input", () => ctx.set({ p: Number(scrub.value) / 1e3, playing: false }));
        const card = document.createElement("div");
        card.style.cssText = "border-top:1px solid var(--hairline,#e2ded5);padding-top:1rem";
        const act = document.createElement("span");
        act.dataset.act = "1";
        act.style.cssText = "display:inline-block;font-size:.72rem;letter-spacing:.1em;color:var(--bengara,#9d3b2f);margin-bottom:.5rem";
        const nm = document.createElement("div");
        nm.dataset.k = "name";
        nm.style.cssText = "font-size:.95rem;font-weight:600;color:var(--ink,#26231e);margin-bottom:.5rem";
        const say = document.createElement("p");
        say.dataset.k = "say";
        say.style.cssText = "margin:0 0 .9rem;font-size:1rem;line-height:1.8;color:var(--ink,#26231e)";
        card.append(act, nm, say);
        const mk = (lab, key) => {
          const d = document.createElement("div");
          d.dataset.wrap = key;
          d.style.cssText = "margin-bottom:.5rem";
          const l = document.createElement("span");
          l.style.cssText = "display:block;font-size:.71rem;letter-spacing:.09em;color:var(--ink-muted,#8b8880)";
          l.textContent = lab;
          const v = document.createElement("span");
          v.dataset.k = key;
          v.style.cssText = "display:block;font-size:.85rem;line-height:1.7;color:var(--ink-muted,#6b6760)";
          d.append(l, v);
          return d;
        };
        card.append(mk("\u7269\u7406\u4E0A\u53D1\u751F\u4E86\u4EC0\u4E48", "how"), mk("\u8FD9\u51B3\u5B9A\u4E86\u7167\u7247\u7684\u4EC0\u4E48", "why"));
        ctx.stage.appendChild(card);
      },
      frame(dt, ctx) {
        if (!ctx.state.playing) return;
        const next = ctx.state.p + dt / 4e4;
        if (next >= 1) ctx.set({ p: 1, playing: false });
        else ctx.set({ p: next });
      },
      render(ctx) {
        const p = ctx.state.p;
        const idx = Math.min(N - 1, Math.round(p * (N - 1)));
        const beat = BEATS[idx];
        ["camera", "emulsion", "darkroom"].forEach((st) => {
          const g = ctx.stage.querySelector(`[data-stage="${st}"]`);
          if (g) g.setAttribute("opacity", beat.stage === st ? "1" : "0");
        });
        if (beat.stage === "camera") {
          const g = ctx.stage.querySelector('[data-stage="camera"]');
          if (g) renderCameraRay(g, beat.t);
        } else if (beat.stage === "emulsion") {
          const g = ctx.stage.querySelector('[data-stage="emulsion"]');
          if (g) renderEmulsion(g, idx, beat.t);
        } else {
          const g = ctx.stage.querySelector('[data-stage="darkroom"]');
          if (g) renderDarkroom(g, idx, beat.t);
        }
        const scrub = ctx.stage.querySelector("[data-scrub]");
        if (scrub) scrub.value = String(Math.round(p * 1e3));
        const cnt = ctx.stage.querySelector("[data-cnt]");
        if (cnt) cnt.textContent = `${idx + 1} / ${N}`;
        const actName = beat.stage === "camera" ? "\u7B2C\u4E00\u5E55 \xB7 \u5149\u8FDB\u5165\u76F8\u673A" : beat.stage === "emulsion" ? "\u7B2C\u4E8C\u5E55 \xB7 \u4E73\u5242\u91CC\u7684 1/125 \u79D2" : "\u7B2C\u4E09\u5E55 \xB7 \u6697\u623F";
        const put = (k, v) => {
          const n = ctx.stage.querySelector(`[data-${k === "act" ? "act" : "k"}${k === "act" ? "" : `="${k}"`}]`);
          if (n) n.textContent = v;
        };
        const actEl = ctx.stage.querySelector("[data-act]");
        if (actEl) actEl.textContent = actName;
        put("name", beat.name);
        put("say", beat.say);
        put("how", beat.how);
        put("why", beat.why);
        const wrap = ctx.stage.querySelector('[data-wrap="why"]');
        if (wrap) wrap.style.display = beat.why ? "" : "none";
      }
    })
  );
})();
