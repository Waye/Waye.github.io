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
  var ACT_M2 = [
    {
      n: "Inputs",
      sub: "log_E \xB7 disparity",
      st: "io",
      zh: "\u6570\u7801 RAW \u7ECF\u7EBF\u6027\u5316\u3001\u5185\u8574\u5206\u89E3\u3001\u8272\u9002\u5E94\u3001\u5149\u8C31\u4E0A\u91C7\u6837\uFF0C\u9010\u5C42\u79EF\u5206\u6210 log-exposure \u573A\uFF1B\u5355\u76EE\u6DF1\u5EA6\u7ED9\u51FA disparity\u3002",
      en: "A digital RAW is linearised, decomposed for albedo, chromatically adapted, spectrally upsampled and integrated per layer into a log-exposure field; monocular depth supplies disparity.",
      pzh: "Jakob & Hanika 2019 \u5149\u8C31\u4E0A\u91C7\u6837 \xB7 Depth Anything V2 \u6DF1\u5EA6",
      pen: "Jakob & Hanika 2019 spectral upsampling \xB7 Depth Anything V2"
    },
    {
      n: "FilmINR",
      sub: "\u2605 \u552F\u4E00\u88AB\u8BAD\u7EC3",
      st: "learn",
      zh: "\u5750\u6807 MLP\uFF1A(log E_R, log E_G, log E_B, e_f) \u2192 (D_R, D_G, D_B)\u3002e_f \u662F\u6BCF\u5377\u80F6\u7247\u4E00\u4E2A\u7684\u53EF\u5B66\u4E60\u5D4C\u5165\u2014\u2014\u7EBF\u6027\u63D2\u503C\u4E24\u5377\u7684\u5D4C\u5165\uFF0C\u5C31\u5F97\u5230\u4E00\u5377\u7269\u7406\u4E0A\u5408\u7406\u7684\u300C\u4E2D\u95F4\u80F6\u7247\u300D\u3002",
      en: "A coordinate MLP mapping (log E_R, log E_G, log E_B, e_f) to a per-layer density triple. e_f is a learnable per-stock embedding \u2014 linearly interpolating two stocks yields a physically plausible intermediate film.",
      pzh: "\u4E09\u9690\u5C42 width 256 + GELU\uFF08\u66F2\u7387\u6B63\u5219\u9700\u4E8C\u9636\u5BFC\u975E\u96F6\uFF0CReLU \u7684\u6052\u4E3A\u96F6\uFF09\xB7 137,539 \u53C2\u6570 \xB7 \u56DB\u5377 Vision3 \u5171\u4EAB\u540C\u4E00\u9AA8\u5E72",
      pen: "Three hidden layers, width 256, GELU (the curvature regulariser needs a non-vanishing second derivative; ReLU's is identically zero) \xB7 137,539 parameters \xB7 one shared backbone across four Vision3 stocks"
    },
    {
      n: "Crosstalk",
      sub: "\u5C42\u95F4\u4E32\u6270",
      st: "frozen",
      zh: "3\xD73 \u8026\u5408\u77E9\u9635\uFF0C\u5EFA\u6A21\u5C42\u95F4\u6548\u5E94\u4E0E DIR \u6210\u8272\u5242\u7684\u67D3\u6599\u6C61\u67D3\uFF0C\u521D\u59CB\u5316\u5728\u5355\u4F4D\u9635\u9644\u8FD1\u3002",
      en: "A 3x3 coupling matrix modelling inter-image effects and DIR-coupler dye contamination, initialised near identity.",
      pzh: "Hunt 1977 \xA75.14 inter-image effect \u7684\u4E00\u9636\u7EBF\u6027\u8FD1\u4F3C \xB7 Vittum 1969 DIR couplers",
      pen: "First-order linear approximation of Hunt 1977 \xA75.14 \xB7 Vittum 1969 DIR couplers"
    },
    {
      n: "Halation",
      sub: "\u5149\u6655",
      st: "frozen",
      zh: "\u5F3A\u5149\u7A7F\u900F\u4E73\u5242\u3001\u4ECE\u7247\u57FA\u80CC\u9762\u53CD\u5C04\u56DE\u6765\uFF0C\u5728\u9AD8\u5149\u8FB9\u7F18\u5F62\u6210\u7EA2\u6655\u3002\u5B9E\u73B0\u4E3A\u6DF1\u5EA6\u6761\u4EF6\u5316\u7684\u70B9\u6269\u6563\u51FD\u6570\u3002",
      en: "Strong light passes the emulsion, reflects off the back of the base and blooms red at highlight edges. Implemented as a depth-conditioned PSF.",
      pzh: "Henyey\u2013Greenstein \u76F8\u51FD\u6570\u4F5C\u4E3A Mie \u6563\u5C04\u7684\u5DE5\u7A0B\u8FD1\u4F3C\uFF0C\u6BCF\u901A\u9053\u4E00\u4E2A\u4E0D\u5BF9\u79F0\u53C2\u6570",
      pen: "Henyey\u2013Greenstein phase function as an engineering approximation to Mie scattering, one asymmetry parameter per channel"
    },
    {
      n: "Defocus",
      sub: "\u79BB\u7126",
      st: "frozen",
      zh: "\u7531 disparity \u4E0E\u5149\u5708\u9A71\u52A8\u7684\u5F25\u6563\u5706\u6A21\u7CCA\u3002",
      en: "Circle-of-confusion blur driven by disparity and aperture.",
      pzh: "\u51E0\u4F55\u5149\u5B66 circle-of-confusion \xB7 \u6DF1\u5EA6\u6765\u81EA\u5355\u76EE\u4F30\u8BA1",
      pen: "Geometric-optics circle of confusion \xB7 depth from monocular estimation"
    },
    {
      n: "Zernike+Cauchy",
      sub: "\u50CF\u5DEE + \u8272\u6563",
      st: "frozen",
      zh: "\u6CE2\u524D\u7528 Zernike \u591A\u9879\u5F0F\u5C55\u5F00\uFF08Noll Z5\u2013Z15\uFF09\u6784\u6210\u5149\u77B3\u3001\u8FDB\u800C\u5F97\u5230 PSF\uFF1BCauchy \u6298\u5C04\u7387\u6A21\u578B\u8BA9\u6CE2\u957F\u4F9D\u8D56\u7684\u6298\u5C04\u7387\u5582\u8FDB\u50CF\u5DEE\u7B97\u5B50\uFF0C\u4EA7\u751F\u7D2B\u8FB9\u3002",
      en: "The wavefront is expanded in Zernike polynomials (Noll Z5\u2013Z15) to form the pupil and hence the PSF; a Cauchy index model feeds wavelength-dependent refraction into the aberration operator, producing purple fringing.",
      pzh: "\u8FD9\u662F G3 \u95E8\u6700\u5173\u952E\u7684\u4E00\u73AF\u2014\u2014Cauchy \u8272\u6563\u7CFB\u6570\u7684\u68AF\u5EA6\u5FC5\u987B\u7A7F\u8FC7 Zernike \u7B97\u5B50\u7684\u6CE2\u957F\u4F9D\u8D56\u6298\u5C04\u7387\u624D\u80FD\u8FDE\u901A\u3002",
      pen: "This is the sharpest edge of gate G3 \u2014 the Cauchy dispersion coefficients can only connect through the Zernike operator's wavelength-dependent index."
    },
    {
      n: "Vignetting",
      sub: "\u6697\u89D2",
      st: "frozen",
      zh: "cos\u2074 \u8870\u51CF\u3002",
      en: "A cos^4 falloff.",
      pzh: "Born & Wolf \xA74.8 \xB7 Smith, Modern Optical Engineering \xA76.3",
      pen: "Born & Wolf \xA74.8 \xB7 Smith, Modern Optical Engineering \xA76.3"
    },
    {
      n: "Bokeh",
      sub: "\u7126\u5916",
      st: "frozen",
      zh: "\u975E\u5706\u5F62\uFF08\u591A\u53F6\u7247\uFF09\u5149\u5708\u7684\u70B9\u6269\u6563\u51FD\u6570\u3002",
      en: "A non-circular, multi-blade aperture PSF.",
      pzh: "Goodman, Introduction to Fourier Optics",
      pen: "Goodman, Introduction to Fourier Optics"
    },
    {
      n: "Callier",
      sub: "\u626B\u63CF\u6563\u5C04",
      st: "frozen",
      zh: "\u8BFB\u51FA\u73AF\u8282\u7684\u65B9\u5411\u6027\u6563\u5C04\u2014\u2014\u6240\u8C13\u300C\u80F6\u7247\u5473\u300D\uFF0C\u6709\u4E00\u90E8\u5206\u5176\u5B9E\u662F\u626B\u63CF\u4EEA\u7684\u3002\u540C\u6837\u8D70 Henyey\u2013Greenstein\u3002",
      en: "Directional scattering at readout \u2014 part of what people call the film look is really the scanner. Again a Henyey\u2013Greenstein term.",
      pzh: "Kodak, The Callier Effect in Practical Densitometry",
      pen: "Kodak, The Callier Effect in Practical Densitometry"
    },
    {
      n: "Film density",
      sub: "(B,3,H,W)",
      st: "io",
      zh: "\u524D\u5411\u94FE\u7684\u8F93\u51FA\u3002\u6CE8\u610F\u8FD9\u662F\u5BC6\u5EA6\u56FE\uFF0C\u4E0D\u662F\u53EF\u89C6 RGB\u2014\u2014density\u2192RGB \u7684\u6210\u50CF\u9636\u6BB5\u5728\u7A84\u524D\u5411\u4E4B\u5916\u3002",
      en: "The output of the forward chain. Note this is a density map, not viewable RGB \u2014 the density-to-RGB image-formation stage sits outside the narrow forward pass.",
      pzh: "claim A \u7684\u7EC8\u70B9\u3002claim B\uFF08\u5BF9\u771F\u5B9E\u80F6\u7247\u7684\u4FDD\u771F\uFF09\u9700\u8981\u53D7\u63A7\u5B9E\u62CD\uFF0C\u5C5E sim2real\u3002",
      pen: "The end of claim A. Claim B \u2014 fidelity to developed film \u2014 needs controlled real capture and belongs to sim2real."
    },
    {
      n: "Loss",
      sub: "L1 + \u6B63\u5219",
      st: "loss",
      zh: "\u6570\u636E\u8868 H&D \u6563\u70B9\u7684 L1 + \u5408\u6210 ColorChecker \u7684 L1 + \u5355\u8C03\u6027\u4E0E\u66F2\u7387\u6B63\u5219\u3002\u5168\u7A0B\u65E0\u4EFB\u4F55\u771F\u5B9E\u5B9E\u62CD\u3002",
      en: "L1 on the datasheet H&D scatter, L1 on a synthetic ColorChecker, plus monotonicity and curvature regularisers. No real capture anywhere.",
      pzh: "\u03BB_HD=10, \u03BB_synth=1, \u03BB_mono=0.01, \u03BB_curv=0.001 \xB7 H&D RMSE < 0.007\uFF08\u56DB\u5377\u5171\u4EAB\u4E00\u4E2A\u6A21\u578B\uFF09\xB7 \u6700\u4F73\u9A8C\u8BC1 L1 = 0.0105 @ step 4800",
      pen: "\u03BB_HD=10, \u03BB_synth=1, \u03BB_mono=0.01, \u03BB_curv=0.001 \xB7 H&D RMSE < 0.007 across all four stocks with one model \xB7 best validation L1 = 0.0105 at step 4800"
    }
  ];
  var ACT_M3 = [
    {
      n: "Inputs",
      sub: "multi-illuminant",
      st: "io",
      zh: "\u8F93\u5165\u6269\u5C55\u6210\u591A\u5149\u6E90 RAW\uFF0C\u52A0\u4E0A\u5355\u76EE\u6DF1\u5EA6\u8F6C\u51FA\u7684 disparity\u3002",
      en: "Inputs extend to multi-illuminant RAW plus disparity from monocular depth.",
      pzh: "0.6 \u591A\u5149\u6E90\u6570\u636E\u6269\u5C55\uFF0C\u4E3A Router \u63D0\u4F9B\u5206\u7C7B\u76D1\u7763\u3002",
      pen: "The 0.6 multi-illuminant data extension supplies the Router's classification supervision."
    },
    {
      n: "Router",
      sub: "\u573A\u666F / \u5149\u6E90\u5206\u7C7B",
      st: "learn",
      m3new: true,
      zh: "\u8F7B\u91CF ResNet-18 \u8BFB RAW \u7F29\u7565\u56FE\uFF0C\u8F93\u51FA daylight / tungsten / fluorescent \u4E09\u7C7B softmax \u8F6F\u6743\u91CD\uFF0C\u7528\u6765\u5728\u7269\u7406\u53C2\u6570\u9884\u8BBE\u4E4B\u95F4\u63D2\u503C\u3002",
      en: "A lightweight ResNet-18 reads an RGB thumbnail and emits three-class softmax weights over daylight / tungsten / fluorescent, interpolating between physical parameter presets.",
      pzh: "D54 \u7ACB\u573A\uFF1A\u8FD9\u662F ML pragmatism\uFF0C\u4E0D\u662F\u7269\u7406 first principles\u3002\u7BA1\u7EBF\u5185\u90E8\u6CA1\u6709\u8DDF\u5149\u6E90 SPD \u76F4\u63A5\u76F8\u5173\u7684\u53EF\u5B66\u53C2\u6570\u2014\u2014\u5149\u6E90\u5728 Phase 2b \u4E0A\u6E38\u5DF2\u88AB\u79EF\u5206\u6389\u3002\u8BBA\u6587\u8981\u81EA\u5DF1\u627F\u8BA4\u8FD9\u4E00\u70B9\uFF0C\u4E0D\u5047\u88C5\u3002",
      pen: "Position D54: this is ML pragmatism, not physical first principles. The pipeline holds no learnable parameter tied to the illuminant SPD \u2014 that was integrated out upstream in Phase 2b. The paper owns this framing rather than dressing it up."
    },
    {
      n: "Reciprocity",
      sub: "E_eff = I \xB7 t^p",
      st: "frozen",
      m3new: true,
      zh: "\u5012\u6613\u5F8B\u5931\u6548\u9879\u63A5\u8FDB\u66DD\u5149\u57DF\u3002\u5F31\u5149\u4E0B\u7535\u5B50\u6765\u5F97\u592A\u6162\uFF0C\u4E9A\u6F5C\u5F71\u7C07\u5728\u4E0B\u4E00\u4E2A\u7535\u5B50\u5230\u8FBE\u524D\u5C31\u8870\u53D8\u2014\u2014\u6240\u4EE5\u66DD\u5149\u91CF\u4E0D\u518D\u662F\u7167\u5EA6\u4E0E\u65F6\u95F4\u7684\u7B80\u5355\u4E58\u79EF\u3002",
      en: "The reciprocity-failure term enters the exposure domain. Under weak light electrons arrive too slowly and sub-latent-image clusters decay before the next one lands, so exposure is no longer a plain product of illuminance and time.",
      pzh: "Schwarzschild \u6307\u6570 p < 1\uFF0C\u9010\u5C42\u4E0D\u540C \u2192 \u957F\u66DD\u5149\u591C\u666F\u504F\u8272\u3002",
      pen: "The Schwarzschild exponent p is below 1 and differs per layer, which is why long night exposures shift colour."
    },
    {
      n: "Colour / density",
      sub: "FilmINR + coupler",
      st: "learn",
      tbd: true,
      zh: "FilmINR \u7EE7\u7EED\u8BAD\u7EC3\uFF0Ccrosstalk \u4ECE\u51BB\u7ED3\u6539\u4E3A\u53EF\u8BAD\u7EC3\uFF0Ccoupler kinetics \u63A5\u8FDB\u524D\u5411\u3002",
      en: "FilmINR keeps training, crosstalk moves from frozen to trained, and coupler kinetics enter the forward pass.",
      pzh: "[S] binding \u4ECD\u662F TBD\u2014\u2014coupler \u6A21\u5757\u7684 substrate \u8F93\u5165\u76EE\u524D\u662F\u62BD\u8C61\u5360\u4F4D\uFF0C\u9700\u8981\u7269\u7406\u7ED1\u5B9A\u3002\u4E14 Michaelis\u2013Menten \u7684\u9971\u548C\u6BB5\u662F\u5EFA\u6A21\u9009\u62E9\uFF0C\u6444\u5F71\u6587\u732E\u6CA1\u6709\u80CC\u4E66\u3002",
      pen: "The [S] binding is still TBD \u2014 the coupler module's substrate input is an abstract placeholder awaiting physical binding. And the Michaelis\u2013Menten saturation regime is a modelling choice with no photographic-domain endorsement."
    },
    {
      n: "Development",
      sub: "reaction\u2013diffusion",
      st: "frozen",
      tbd: true,
      m3new: true,
      zh: "\u663E\u5F71\u6DB2\u5C40\u90E8\u8017\u7AED\u52A0\u6269\u6563\u56DE\u6D41\uFF0C\u5728\u660E\u6697\u4EA4\u754C\u5904\u5F62\u6210 Mackie lines \u8FB9\u7F18\u8FC7\u51B2\u3002\u8FD9\u662F\u7A7A\u95F4\u8FC7\u7A0B\u2014\u2014\u67E5\u627E\u8868\u7ED3\u6784\u4E0A\u505A\u4E0D\u5230\u3002",
      en: "Local developer depletion plus diffusive replenishment produce Mackie-line edge overshoot at tonal boundaries. This is a spatial process, structurally impossible for a lookup table.",
      pzh: "Gray\u2013Scott \u53CD\u5E94\u6269\u6563\u6A21\u578B\uFF08Pearson 1993\uFF09\u3002adapter \u63A5\u7EBF\u65B9\u5F0F\u4ECD TBD\u3002",
      pen: "A Gray\u2013Scott reaction\u2013diffusion model (Pearson 1993). The adapter wiring is still TBD."
    },
    {
      n: "Spatial optics",
      sub: "now trained",
      st: "learn",
      zh: "\u516D\u4E2A\u7A7A\u95F4\u5149\u5B66\u7B97\u5B50\u4ECE\u51BB\u7ED3\u6539\u4E3A\u53EF\u8BAD\u7EC3\u2014\u2014\u56E0\u4E3A M3 \u6709\u4E86\u771F\u5B9E\u6D4B\u91CF\u4FE1\u53F7\uFF0C\u5B83\u4EEC\u7B2C\u4E00\u6B21\u53D8\u5F97\u53EF\u8FA8\u8BC6\u3002",
      en: "The six spatial-optics operators move from frozen to trained \u2014 with real measured signal in M3 they become identifiable for the first time.",
      pzh: "\u5DF2\u77E5\u8FB9\u754C\uFF1A\u771F\u5B9E\u5947\u6570\u5C3A\u5BF8\u8F93\u5165\u4E0A\uFF0CFFT \u5377\u79EF\u4F1A\u6CE8\u5165\u4F4E\u5E45\u9AD8\u9891\u4F2A\u5F71\uFF08\u7EB5\u5411\u8C31\u80FD\u91CF 0.6% \u4EE5\u4E0B\uFF09\uFF0C\u7591\u4F3C\u96F6\u586B\u5145\u8FB9\u754C\u632F\u94C3\u3002reflect-padding \u662F\u5019\u9009\u4FEE\u6CD5\uFF0C\u9700\u91CD\u9A8C\u53CC\u540E\u7AEF parity\u3002full-train vs fine-tune \u4ECD TBD\u3002",
      pen: "A known boundary: on real odd-sized inputs the FFT convolutions inject a low-amplitude high-frequency artifact, under 0.6% of vertical spectral energy, consistent with zero-padding boundary ringing. Reflect padding is the candidate remedy, pending re-verified backend parity. Full-train versus fine-tune is still TBD."
    },
    {
      n: "Grain",
      sub: "Boolean model",
      st: "frozen",
      m3new: true,
      zh: "\u9897\u7C92\u63A5\u8FDB\u524D\u5411\u3002\u5355\u9897\u6676\u4F53\u662F\u4E8C\u503C\u7684\u2014\u2014\u8981\u4E48\u5168\u663E\u5F71\u3001\u8981\u4E48\u5B8C\u5168\u4E0D\u663E\u5F71\uFF1B\u8FDE\u7EED\u5F71\u8C03\u662F\u51E0\u767E\u4E07\u4E2A\u4E8C\u503C\u63A2\u6D4B\u5668\u7684\u7EDF\u8BA1\u5047\u8C61\u3002",
      en: "Grain enters the forward pass. A single crystal is binary \u2014 it either develops fully or not at all; continuous tone is a statistical illusion over millions of binary detectors.",
      pzh: "Boolean model + Gumbel-sigmoid \u677E\u5F1B\uFF0C\u8BA9\u79BB\u6563\u7684\u4E8C\u503C\u8FC7\u7A0B\u53EF\u5FAE\u3002",
      pen: "A Boolean model with Gumbel-sigmoid relaxation, making the discrete binary process differentiable."
    },
    {
      n: "Imaging",
      sub: "Beer\u2013Lambert + D&B",
      st: "frozen",
      tbd: true,
      m3new: true,
      zh: "\u6210\u50CF\u9636\u6BB5\uFF1ABeer\u2013Lambert \u900F\u8FC7\u7387\u3001\u6A59\u7F69\u76F8\u51CF\uFF0C\u4EE5\u53CA\u53EF\u5FAE\u5206\u7684\u52A0\u5149\u51CF\u5149\uFF08SAM2 \u8BED\u4E49\u63A9\u7801 + \u6BCF\u4E2A\u63A9\u7801\u4E00\u4E2A\u53EF\u5B66\u4E60\u7684\u66DD\u5149\u8865\u507F\uFF09\u3002",
      en: "The imaging stage: Beer\u2013Lambert transmittance, orange-mask subtraction, and differentiable dodging and burning \u2014 SAM2 semantic masks each carrying one learnable exposure offset.",
      pzh: "D&B \u6570\u5B66\u6A21\u578B\uFF1Alog_E_eff = log_E + \u03A3_n mask_n \xB7 \u03B4_n\uFF0C\u7B49\u4EF7\u4E8E\u4FEE\u6539\u6709\u6548\u66DD\u5149\u65F6\u95F4\uFF0C\u4E0E\u6697\u623F first principles \u4E25\u683C\u5BF9\u5E94\u3002density\u2192RGB \u7684\u6210\u50CF\u62D3\u6251\u4ECD TBD\u3002",
      pen: "The D&B model is log_E_eff = log_E + sum_n mask_n \xB7 \u03B4_n, equivalent to altering effective exposure time and strictly grounded in darkroom first principles. The density-to-RGB image-formation topology is still TBD."
    },
    {
      n: "Rendered RGB",
      sub: "was: film density",
      st: "io",
      zh: "\u8F93\u51FA\u4ECE\u5BC6\u5EA6\u56FE\u5347\u7EA7\u6210\u771F\u6B63\u7684 RGB\u2014\u2014\u8FD9\u624D\u662F\u80FD\u548C\u5B9E\u62CD\u5BF9\u6BD4\u7684\u4E1C\u897F\u3002",
      en: "The output upgrades from a density map to actual RGB \u2014 the thing that can finally be compared against a real capture.",
      pzh: "\u8FD9\u5C31\u662F claim B \u7684\u76EE\u6807\u3002",
      pen: "This is the claim B target."
    },
    {
      n: "Real capture",
      sub: "ECN-2 + linear scan",
      st: "supervise",
      zh: "\u53D7\u63A7\u5B9E\u62CD\uFF1A\u540C\u4E00\u573A\u666F\u8D70 ECN-2 \u51B2\u6D17\uFF0C\u7EBF\u6027\u626B\u63CF\u6210\u6570\u5B57\u3002\u8FD9\u662F sim2real \u7684\u53E6\u4E00\u534A\u3002",
      en: "Controlled real capture: the same scene developed in ECN-2 and linearly scanned. This is the other half of sim2real.",
      pzh: "\u6CA1\u6709\u8FD9\u4E00\u6B65\uFF0C\u4FDD\u771F\u5EA6\uFF08claim B\uFF09\u65E0\u4ECE\u8C08\u8D77\u2014\u2014\u8FD9\u6B63\u662F\u672C\u7BC7 paper \u660E\u786E\u5212\u5728\u8303\u56F4\u4E4B\u5916\u7684\u4E1C\u897F\u3002",
      pen: "Without this step there is no fidelity claim at all \u2014 precisely what the current paper places outside its scope."
    },
    {
      n: "Training loss",
      sub: "vs real scan",
      st: "loss",
      zh: "L1 + \u0394E2000 + LPIPS + \u7269\u7406\u4E00\u81F4\u6027 + Router \u7684\u4EA4\u53C9\u71B5\u3002\u68AF\u5EA6\u4ECE\u8FD9\u91CC\u51FA\u53D1\uFF0C\u7A7F\u8FC7\u6574\u6761\u94FE\u56DE\u5230\u6BCF\u4E00\u4E2A\u7B97\u5B50\u3002",
      en: "L1 + \u0394E2000 + LPIPS + physical consistency + Router cross-entropy. Gradients start here and travel back through the entire chain to every operator.",
      pzh: "\u4E0E\u7B2C\u4E00\u5E55\u6700\u5927\u7684\u4E0D\u540C\uFF1AM3 \u7684\u76D1\u7763\u6765\u81EA\u771F\u5B9E\u4FE1\u53F7\uFF0C\u6240\u4EE5\u7A7A\u95F4\u5149\u5B66\u3001Router\u3001D&B \u7B2C\u4E00\u6B21\u6709\u4E86\u53EF\u8FA8\u8BC6\u7684\u8BAD\u7EC3\u4FE1\u53F7\u3002",
      pen: "The key difference from act one: M3's supervision comes from real signal, so spatial optics, the Router and D&B finally carry identifiable training signal."
    }
  ];
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
  var BW = 112;
  var BH = 54;
  var PER_ROW = 6;
  var COL = {
    learn: "#378ADD",
    frozen: "#5DCAA5",
    io: "#B4B2A9",
    loss: "#639922",
    supervise: "#639922"
  };
  var TBD_C = "#EF9F27";
  function posOf(i) {
    if (i < PER_ROW) return { x: 22 + i * (BW - 4), y: 58 };
    const k = i - PER_ROW;
    return { x: 22 + (PER_ROW - 2 - k) * (BW - 4), y: 176 };
  }
  var L = {
    zh: {
      acts: ["M2 \xB7 \u5DF2\u5B9E\u73B0", "M3 \xB7 \u89C4\u5212\u4E2D"],
      dirs: ["\u524D\u5411 \xB7 \u5149 \u2192 \u5BC6\u5EA6", "\u53CD\u5411 \xB7 \u2202L/\u2202\u03B8 \u56DE\u6D41"],
      badge: {
        learn: "\u8BAD\u7EC3\u4E2D \xB7 \u68AF\u5EA6\u66F4\u65B0\u5B83",
        frozen: "\u51BB\u7ED3\u5728\u6587\u732E\u5148\u9A8C \xB7 \u4F46\u68AF\u5EA6\u7A7F\u8FC7\u5B83",
        io: "\u8F93\u5165 / \u8F93\u51FA",
        loss: "\u76D1\u7763\u4FE1\u53F7",
        supervise: "\u771F\u5B9E\u6570\u636E\u76D1\u7763"
      },
      m3new: "M3 \u65B0\u63A5\u8FDB\u524D\u5411",
      tbd: "\u51B3\u7B56\u5F85\u5B9A",
      basis: "\u7269\u7406\u4F9D\u636E / \u8FB9\u754C",
      proj: "PROJECTED \xB7 \u591A\u5904\u51B3\u7B56\u5F85\u5B9A \xB7 \u975E\u5DF2\u627F\u8BFA\u67B6\u6784",
      standalone: "\u5DF2\u5B9E\u73B0 \xB7 \u5355\u5143\u6D4B\u8BD5\u8FC7 \xB7 \u53CC\u540E\u7AEF\u9A8C\u8BC1 \u2014\u2014 \u4F46\u4E0D\u5728\u524D\u5411\u94FE\uFF08\u63A8 sim2real / M3\uFF09",
      play: "\u25B6 \u64AD\u653E",
      pause: "\u275A\u275A \u6682\u505C",
      reset: "\u21BA \u91CD\u6765"
    },
    en: {
      acts: ["M2 \xB7 implemented", "M3 \xB7 projected"],
      dirs: ["forward \xB7 light \u2192 density", "backward \xB7 \u2202L/\u2202\u03B8"],
      badge: {
        learn: "trained \xB7 gradients update it",
        frozen: "frozen at literature prior \xB7 gradients still pass through",
        io: "input / output",
        loss: "supervision",
        supervise: "real-data supervision"
      },
      m3new: "newly wired in M3",
      tbd: "decision pending",
      basis: "physical basis / boundary",
      proj: "PROJECTED \xB7 several decisions pending \xB7 not a committed architecture",
      standalone: "implemented \xB7 unit-tested \xB7 dual-backend verified \u2014 but not in the forward pass (deferred to sim2real / M3)",
      play: "\u25B6 play",
      pause: "\u275A\u275A pause",
      reset: "\u21BA restart"
    }
  };
  var STANDALONE = [
    "reaction\u2013diffusion \xB7 Mackie lines",
    "Boolean grain \xB7 Gumbel-sigmoid",
    "reciprocity \xB7 Schwarzschild",
    "Beer\u2013Lambert \xB7 orange mask",
    "coupler kinetics \xB7 Michaelis\u2013Menten"
  ];
  mount(
    "lumen-neuro",
    () => defineDemo({
      state: { p: 0, playing: false, act: "m2", dir: "fwd", lang: "zh" },
      controls: [
        { kind: "button", label: "\u25B6 / \u275A\u275A", action: "toggle" },
        { kind: "button", label: "\u21BA", action: "reset" }
      ],
      actions: {
        toggle: (ctx) => ctx.set({ playing: !ctx.state.playing }),
        reset: (ctx) => ctx.set({ p: 0, playing: false })
      },
      setup(ctx) {
        const grid = ctx.stage.parentElement;
        if (grid) grid.style.gridTemplateColumns = "1fr";
        const bar = document.createElement("div");
        bar.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-bottom:.9rem";
        const mkBtn = (label, key, val) => {
          const b = document.createElement("button");
          b.type = "button";
          b.dataset.key = key;
          b.dataset.val = val;
          b.textContent = label;
          b.style.cssText = "padding:.4rem .8rem;font:inherit;font-size:.82rem;cursor:pointer;background:transparent;border:1px solid var(--hairline,#e2ded5);color:var(--ink-muted,#6b6760);transition:color .18s,border-color .18s";
          b.addEventListener("click", () => {
            const patch = { p: 0, playing: false };
            patch[key] = val;
            ctx.set(patch);
          });
          return b;
        };
        bar.append(
          mkBtn("M2", "act", "m2"),
          mkBtn("M3", "act", "m3"),
          mkBtn("\u2192", "dir", "fwd"),
          mkBtn("\u2190", "dir", "bwd"),
          mkBtn("\u4E2D", "lang", "zh"),
          mkBtn("EN", "lang", "en")
        );
        ctx.stage.appendChild(bar);
        const svg = el2("svg", {
          viewBox: "0 0 680 400",
          style: "width:100%;height:auto;display:block"
        });
        svg.dataset.svg = "1";
        ctx.stage.appendChild(svg);
        const pbar = document.createElement("div");
        pbar.style.cssText = "display:flex;align-items:center;gap:12px;margin:.8rem 0 1rem";
        const scrub = document.createElement("input");
        scrub.type = "range";
        scrub.min = "0";
        scrub.max = "1000";
        scrub.dataset.scrub = "1";
        scrub.style.cssText = "flex:1;accent-color:var(--bengara,#9d3b2f)";
        const cnt = document.createElement("span");
        cnt.dataset.cnt = "1";
        cnt.style.cssText = "font-size:.78rem;font-variant-numeric:tabular-nums;min-width:48px;text-align:right;color:var(--ink-muted,#6b6760)";
        pbar.append(scrub, cnt);
        ctx.stage.appendChild(pbar);
        scrub.addEventListener(
          "input",
          () => ctx.set({ p: Number(scrub.value) / 1e3, playing: false })
        );
        const card = document.createElement("div");
        card.style.cssText = "border-top:1px solid var(--hairline,#e2ded5);padding-top:.9rem";
        const head = document.createElement("div");
        head.style.cssText = "display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:.45rem";
        const nm = document.createElement("span");
        nm.dataset.k = "nm";
        nm.style.cssText = "font-size:1rem;font-weight:600;color:var(--ink,#26231e)";
        const bd = document.createElement("span");
        bd.dataset.k = "bd";
        bd.style.cssText = "font-size:.73rem;padding:2px 8px;border-radius:3px";
        const tb = document.createElement("span");
        tb.dataset.k = "tb";
        tb.style.cssText = "font-size:.73rem;padding:2px 8px;border-radius:3px;border:1px dashed " + TBD_C + ";color:" + TBD_C;
        head.append(nm, bd, tb);
        const say = document.createElement("p");
        say.dataset.k = "say";
        say.style.cssText = "margin:0 0 .75rem;font-size:.95rem;line-height:1.75;color:var(--ink,#26231e)";
        const bl = document.createElement("span");
        bl.dataset.k = "bl";
        bl.style.cssText = "display:block;font-size:.71rem;letter-spacing:.09em;color:var(--ink-muted,#8b8880)";
        const ph = document.createElement("span");
        ph.dataset.k = "ph";
        ph.style.cssText = "display:block;font-size:.84rem;line-height:1.7;color:var(--ink-muted,#6b6760)";
        card.append(head, say, bl, ph);
        ctx.stage.appendChild(card);
      },
      frame(dt, ctx) {
        if (!ctx.state.playing) return;
        const next = ctx.state.p + dt / 22e3;
        if (next >= 1) ctx.set({ p: 1, playing: false });
        else ctx.set({ p: next });
      },
      render(ctx) {
        const st = ctx.state;
        const NODES = st.act === "m2" ? ACT_M2 : ACT_M3;
        const N = NODES.length;
        const T = st.lang === "zh" ? L.zh : L.en;
        const bwd = st.dir === "bwd";
        ctx.stage.querySelectorAll("button[data-key]").forEach((b2) => {
          var _a;
          const on = st[(_a = b2.dataset.key) != null ? _a : ""] === b2.dataset.val;
          b2.style.color = on ? "var(--bengara,#9d3b2f)" : "var(--ink-muted,#6b6760)";
          b2.style.borderColor = on ? "var(--bengara,#9d3b2f)" : "var(--hairline,#e2ded5)";
        });
        const svg = ctx.stage.querySelector("[data-svg]");
        if (!svg) return;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        const f = bwd ? 1 - st.p : st.p;
        const pos = f * (N - 1);
        const idx = Math.min(N - 1, Math.max(0, Math.round(pos)));
        svg.appendChild(txt(T.acts[st.act === "m2" ? 0 : 1], {
          x: 22,
          y: 24,
          "font-size": 12.5,
          "font-weight": 600,
          fill: "var(--ink,#26231e)"
        }));
        svg.appendChild(txt(T.dirs[bwd ? 1 : 0], {
          x: 22,
          y: 42,
          "font-size": 11,
          fill: "var(--ink-muted,#8b8880)"
        }));
        if (st.act === "m3") {
          svg.appendChild(el2("rect", {
            x: 400,
            y: 10,
            width: 258,
            height: 34,
            rx: 4,
            fill: TBD_C,
            "fill-opacity": 0.07,
            stroke: TBD_C,
            "stroke-width": 1,
            "stroke-dasharray": "5 4"
          }));
          svg.appendChild(txt(T.proj, {
            x: 529,
            y: 31,
            "text-anchor": "middle",
            "font-size": 9.5,
            fill: TBD_C
          }));
        }
        for (let i = 0; i < N - 1; i++) {
          const a2 = posOf(i), b2 = posOf(i + 1);
          const ax = a2.x + BW / 2, ay = a2.y + BH / 2;
          const bx = b2.x + BW / 2, by = b2.y + BH / 2;
          let d;
          if (a2.y === b2.y) d = `M${ax + BW / 2 - 4} ${ay} L ${bx - BW / 2 + 4} ${by}`;
          else d = `M${ax} ${ay + BH / 2} L ${ax} ${by - BH / 2 - 12} Q ${ax} ${by - BH / 2} ${ax - 12} ${by - BH / 2} L ${bx + BW / 2} ${by - BH / 2}`;
          const on = bwd ? i >= idx : i < idx;
          svg.appendChild(el2("path", {
            d,
            fill: "none",
            stroke: on ? bwd ? "#E24B4A" : "#EF9F27" : "var(--hairline,#d8d4cb)",
            "stroke-width": on ? 2.2 : 1.2,
            ...bwd && on ? { "stroke-dasharray": "6 4" } : {}
          }));
        }
        NODES.forEach((o2, i) => {
          const p = posOf(i);
          const g = el2("g", { transform: `translate(${p.x},${p.y})` });
          const passed = bwd ? i >= idx : i <= idx;
          g.setAttribute("opacity", passed ? "1" : "0.32");
          g.appendChild(el2("rect", {
            x: 0,
            y: 0,
            width: BW,
            height: BH,
            rx: 5,
            fill: COL[o2.st],
            "fill-opacity": 0.2,
            stroke: o2.tbd ? TBD_C : COL[o2.st],
            "stroke-width": o2.st === "learn" ? 2 : o2.tbd ? 1.6 : 1,
            ...o2.tbd ? { "stroke-dasharray": "5 3" } : {}
          }));
          g.appendChild(txt(o2.n, {
            x: BW / 2,
            y: 22,
            "text-anchor": "middle",
            "font-size": 11,
            "font-weight": 600,
            fill: "var(--ink,#26231e)"
          }));
          g.appendChild(txt(o2.sub, {
            x: BW / 2,
            y: 38,
            "text-anchor": "middle",
            "font-size": 9.5,
            fill: "var(--ink-muted,#6b6760)"
          }));
          if (o2.m3new) {
            g.appendChild(el2("circle", { cx: BW - 9, cy: 9, r: 3.5, fill: "#378ADD" }));
          }
          svg.appendChild(g);
        });
        if (st.act === "m2") {
          const db = el2("g", { transform: "translate(22,292)" });
          db.appendChild(el2("rect", {
            x: 0,
            y: 0,
            width: 636,
            height: 54,
            rx: 5,
            fill: "none",
            stroke: "var(--ink-muted,#8b8880)",
            "stroke-width": 1,
            "stroke-dasharray": "5 4",
            opacity: 0.65
          }));
          db.appendChild(txt(T.standalone, {
            x: 318,
            y: 20,
            "text-anchor": "middle",
            "font-size": 10,
            fill: "var(--ink-muted,#8b8880)"
          }));
          STANDALONE.forEach((m, k) => {
            db.appendChild(txt(m, {
              x: 14 + k * 126,
              y: 40,
              "font-size": 8.5,
              fill: "var(--ink-muted,#8b8880)"
            }));
          });
          svg.appendChild(db);
        }
        const i0 = Math.floor(pos), i1 = Math.min(N - 1, i0 + 1), fr = pos - i0;
        const a = posOf(i0), b = posOf(i1);
        const mx = a.x + BW / 2 + (b.x - a.x) * fr;
        const my = a.y + BH / 2 + (b.y - a.y) * fr;
        if (bwd) {
          svg.appendChild(el2("circle", { cx: mx, cy: my, r: 8, fill: "#E24B4A", "fill-opacity": 0.35 }));
          svg.appendChild(el2("path", {
            d: `M${mx - 14} ${my} L ${mx} ${my - 6} L ${mx} ${my + 6} Z`,
            fill: "#E24B4A"
          }));
          svg.appendChild(txt("\u2202L/\u2202\u03B8", {
            x: mx,
            y: my - 16,
            "text-anchor": "middle",
            "font-size": 10,
            fill: "#A32D2D"
          }));
        } else {
          svg.appendChild(el2("circle", { cx: mx, cy: my, r: 8, fill: "#EF9F27" }));
        }
        const o = NODES[idx];
        const scrub = ctx.stage.querySelector("[data-scrub]");
        if (scrub) scrub.value = String(Math.round(st.p * 1e3));
        const cnt = ctx.stage.querySelector("[data-cnt]");
        if (cnt) cnt.textContent = `${idx + 1}/${N}`;
        const put = (k, v) => {
          const n = ctx.stage.querySelector(`[data-k="${k}"]`);
          if (n) n.textContent = v;
        };
        put("nm", o.n);
        put("bd", T.badge[o.st]);
        put("say", st.lang === "zh" ? o.zh : o.en);
        put("bl", T.basis);
        put("ph", st.lang === "zh" ? o.pzh : o.pen);
        const bd = ctx.stage.querySelector('[data-k="bd"]');
        if (bd) {
          bd.style.background = COL[o.st];
          bd.style.color = "#fff";
          bd.style.opacity = "0.92";
        }
        const tb = ctx.stage.querySelector('[data-k="tb"]');
        if (tb) {
          tb.textContent = o.tbd ? T.tbd : "";
          tb.style.display = o.tbd ? "" : "none";
        }
      }
    })
  );
})();
