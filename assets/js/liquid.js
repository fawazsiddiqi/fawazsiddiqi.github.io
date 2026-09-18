/* fawazsiddiqi.dev — the light field behind the glass.
   One fullscreen WebGL quad: four colour pools drifting through warped noise.
   Colours come from the CSS theme tokens, so a theme switch tweens them.
   If anything here fails, the CSS gradient on body::before stays visible. */
const startLightField = () => {
  "use strict";

  const canvas = document.getElementById("bg");
  if (!canvas) return;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = navigator.connection?.saveData;
  if (saveData) return;

  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) return;

  // No GPU (SwiftShader, llvmpipe, VMs, headless) means every frame is rasterised
  // on the CPU, which is far too expensive for a decorative background. The CSS
  // gradient fallback looks nearly identical, so bail out and leave it in place.
  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String((dbg && gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || "");
  if (/swiftshader|llvmpipe|softwarerasterizer|basic render|microsoft basic/i.test(renderer)) return;

  const VERT = `
    attribute vec2 a;
    void main() { gl_Position = vec4(a, 0.0, 1.0); }
  `;

  const FRAG = `
    precision mediump float;
    uniform vec2 u_res;
    uniform float u_time;
    uniform vec2 u_ptr;
    uniform float u_scroll;
    uniform vec3 u_base, u_c1, u_c2, u_c3, u_c4;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 p = vec2(uv.x * (u_res.x / u_res.y), uv.y);
      float t = u_time * 0.035;

      // domain warp keeps the pools organic instead of round
      vec2 q = vec2(fbm(p * 1.25 + t), fbm(p * 1.25 + vec2(3.1, 1.7) - t));
      vec2 w = p + 0.45 * q;
      float s = u_scroll;

      vec3 col = u_base;
      col = mix(col, u_c1, smoothstep(0.66, 0.0, length(w - vec2(0.30 + 0.12 * sin(t * 1.1), 0.78 + 0.09 * cos(t * 0.9) - s * 0.22))) * 0.92);
      col = mix(col, u_c2, smoothstep(0.54, 0.0, length(w - vec2(1.00 + 0.10 * cos(t * 0.8), 0.86 + s * 0.20))) * 0.75);
      col = mix(col, u_c3, smoothstep(0.60, 0.0, length(w - vec2(0.92 + 0.13 * sin(t * 0.7), 0.16 + 0.08 * sin(t * 1.3) + s * 0.26))) * 0.80);
      col = mix(col, u_c4, smoothstep(0.48, 0.0, length(w - vec2(0.16 - 0.10 * cos(t * 1.2), 0.10 - s * 0.16))) * 0.62);

      // a soft bloom under the pointer
      col = mix(col, u_c2, smoothstep(0.40, 0.0, length(p - u_ptr)) * 0.16);

      // vignette for depth, grain to stop the gradients banding
      col *= 1.0 - 0.18 * pow(length(uv - 0.5) * 1.35, 2.5);
      col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.02;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  for (const n of ["u_res", "u_time", "u_ptr", "u_scroll", "u_base", "u_c1", "u_c2", "u_c3", "u_c4"]) {
    U[n] = gl.getUniformLocation(prog, n);
  }

  /* ---------- colours from the CSS tokens ---------------------------- */

  const TOKENS = ["--bg", "--pool-1", "--pool-2", "--pool-3", "--pool-4"];
  const parse = (hex) => {
    const h = hex.trim().replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  };
  const readTokens = () => {
    const cs = getComputedStyle(document.documentElement);
    return TOKENS.map((t) => parse(cs.getPropertyValue(t) || "#000"));
  };

  let colors = readTokens();
  let from = colors.map((c) => c.slice());
  let to = colors.map((c) => c.slice());
  let mixStart = 0;
  const MIX_MS = 700;

  document.addEventListener("themechange", () => {
    from = colors.map((c) => c.slice());
    to = readTokens();
    mixStart = performance.now();
  });

  /* ---------- size, pointer, scroll ---------------------------------- */

  let w = 0, h = 0;
  function resize() {
    // soft gradients: half res is plenty, and less again on phones
    const scale = Math.min(devicePixelRatio || 1, 2) * (innerWidth < 700 ? 0.4 : 0.5);
    w = Math.max(1, Math.round(innerWidth * scale));
    h = Math.max(1, Math.round(innerHeight * scale));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
  resize();
  addEventListener("resize", () => { resize(); if (reduceMotion.matches) render(performance.now()); }, { passive: true });

  let ptr = [0.5, 0.5];
  let ptrTarget = [0.5, 0.5];
  addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    ptrTarget = [(e.clientX / innerWidth) * (innerWidth / innerHeight), 1 - e.clientY / innerHeight];
  }, { passive: true });

  let scroll = 0;
  let scrollTarget = 0;
  addEventListener("scroll", () => {
    const max = Math.max(1, document.body.scrollHeight - innerHeight);
    scrollTarget = Math.min(scrollY / max, 1);
  }, { passive: true });

  /* ---------- draw ---------------------------------------------------- */

  // One clock per visit, so moving between pages continues the field where it
  // was instead of restarting it. Wrapped at 30 min: mediump floats on phones
  // lose the precision the noise needs as the value grows.
  let epoch = Date.now();
  let returning = false;
  try {
    const saved = Number(sessionStorage.getItem("lf-epoch"));
    if (saved) { epoch = saved; returning = true; } else sessionStorage.setItem("lf-epoch", String(epoch));
  } catch (e) { /* storage blocked: each page starts fresh */ }
  // arriving from another page of the site: appear at once rather than fading in again
  if (returning) canvas.style.transition = "none";
  let lastFrame = 0;
  let running = true;

  function render(now) {
    const k = mixStart ? Math.min((now - mixStart) / MIX_MS, 1) : 1;
    colors = to.map((c, i) => c.map((v, j) => from[i][j] + (v - from[i][j]) * k));

    ptr = [ptr[0] + (ptrTarget[0] - ptr[0]) * 0.06, ptr[1] + (ptrTarget[1] - ptr[1]) * 0.06];
    scroll += (scrollTarget - scroll) * 0.08;

    gl.uniform2f(U.u_res, w, h);
    gl.uniform1f(U.u_time, reduceMotion.matches ? 12 : ((Date.now() - epoch) / 1000) % 1800);
    gl.uniform2f(U.u_ptr, ptr[0], ptr[1]);
    gl.uniform1f(U.u_scroll, scroll);
    gl.uniform3fv(U.u_base, colors[0]);
    gl.uniform3fv(U.u_c1, colors[1]);
    gl.uniform3fv(U.u_c2, colors[2]);
    gl.uniform3fv(U.u_c3, colors[3]);
    gl.uniform3fv(U.u_c4, colors[4]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    canvas.classList.add("is-ready");
  }

  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    if (now - lastFrame < 1000 / (innerWidth < 700 ? 24 : 30)) return;   // plenty for slow gradients
    lastFrame = now;
    render(now);
  }

  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); running = false; canvas.classList.remove("is-ready"); });
  canvas.addEventListener("webglcontextrestored", () => { running = true; requestAnimationFrame(loop); });
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden && !reduceMotion.matches;
    if (running) requestAnimationFrame(loop);
  });

  if (reduceMotion.matches) {
    running = false;
    render(performance.now());
    document.addEventListener("themechange", () => setTimeout(() => render(performance.now()), MIX_MS));
  } else {
    requestAnimationFrame(loop);
  }
};

// Creating the WebGL context costs real main-thread time, so start once the page
// is interactive. The CSS gradient covers the gap.
(window.requestIdleCallback || ((fn) => setTimeout(fn, 200)))(startLightField, { timeout: 1500 });
