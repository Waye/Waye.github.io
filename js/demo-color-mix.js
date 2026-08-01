(() => {
  // ns-hugo-imp:/Users/weiyihu/hugo-website/mysite/assets/demos/runtime.ts
  function defineDemo(d) {
    return d;
  }

  // <stdin>
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
})();
