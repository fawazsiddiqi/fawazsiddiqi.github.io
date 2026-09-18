/* fawazsiddiqi.dev — theme, mobile nav, pointer lighting, glass refraction.
   No dependencies. Everything degrades to a working page if any piece bails. */
(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  // Only Chromium supports SVG filters inside backdrop-filter, which is what real
  // refraction needs. userAgentData exists only there, which makes it a safe probe.
  // Phones skip it: re-filtering the backdrop every scroll frame is the most
  // expensive thing on the page, and they get the same frosted glass Safari does.
  const canRefract = !!(navigator.userAgentData?.brands || []).some((b) => /Chromium/i.test(b.brand)) && innerWidth >= 860;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  /* ---------- theme ---------------------------------------------------- */

  const themeBtn = $("[data-theme-toggle]");

  function setTheme(next) {
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    if (themeBtn) themeBtn.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
    document.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  }

  if (themeBtn) {
    setTheme(root.dataset.theme || "dark");
    themeBtn.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      if (!document.startViewTransition || reduceMotion.matches) return setTheme(next);

      // circular wipe out of the toggle
      const r = themeBtn.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      // Safari can take ~1s to invoke the transition callback; apply the theme
      // anyway after a beat so the toggle never feels stuck.
      let applied = false;
      const apply = () => { if (!applied) { applied = true; setTheme(next); } };
      setTimeout(apply, 220);
      document.startViewTransition(apply).ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${far}px at ${x}px ${y}px)`] },
          { duration: 520, easing: "cubic-bezier(.3,0,.2,1)", pseudoElement: "::view-transition-new(root)" }
        );
      }).catch(() => { /* skipped, e.g. a page navigation started mid-wipe: the theme still applies */ });
    });
  }

  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem("theme"); } catch (err) { /* ignore */ }
    if (!saved) setTheme(e.matches ? "dark" : "light");
  });

  /* ---------- mobile menu ----------------------------------------------- */
  // Each nav item is its own page now; the active one is marked server-side
  // (aria-current="page") and its pill morphs between pages via view transitions.

  const nav = $(".nav");
  const navToggle = $(".nav-toggle");

  function closeMenu() {
    if (!nav || !nav.hasAttribute("data-open")) return;
    nav.removeAttribute("data-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.toggleAttribute("data-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !nav.hasAttribute("data-open")) return;
      closeMenu();
      navToggle.focus();
    });
  }

  /* ---------- pointer lighting ----------------------------------------- */

  const lit = new Set();
  if ("IntersectionObserver" in window) {
    const litObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? lit.add(e.target) : lit.delete(e.target))),
      { rootMargin: "20% 0px" }
    );
    $$(".panel, .lg").forEach((el) => litObs.observe(el));
  }

  let px = innerWidth * 0.5;
  let py = -200;
  let lightRaf = 0;

  function paintLight() {
    lightRaf = 0;
    for (const el of lit) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--lx", (px - r.left).toFixed(1) + "px");
      el.style.setProperty("--ly", (py - r.top).toFixed(1) + "px");
    }
  }
  const queueLight = () => { if (!lightRaf) lightRaf = requestAnimationFrame(paintLight); };

  addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    px = e.clientX; py = e.clientY;
    queueLight();
  }, { passive: true });

  /* ---------- scroll: edge fade under the nav --------------------------- */

  let scrollRaf = 0;
  function onScrollFrame() {
    scrollRaf = 0;
    document.body.classList.toggle("is-scrolled", scrollY > 24);
    queueLight();
  }
  addEventListener("scroll", () => { if (!scrollRaf) scrollRaf = requestAnimationFrame(onScrollFrame); }, { passive: true });

  /* ---------- refraction: displacement maps for Chromium ---------------- */

  const filterHost = $("#glass-filters");
  let filterSeq = 0;

  // signed distance to a rounded rectangle, negative inside
  function sdRoundRect(x, y, w, h, r) {
    const qx = Math.abs(x - w / 2) - (w / 2 - r);
    const qy = Math.abs(y - h / 2) - (h / 2 - r);
    const ax = Math.max(qx, 0);
    const ay = Math.max(qy, 0);
    return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
  }

  // Encodes, per pixel, how far the backdrop should be pushed: strongest at the
  // bezel, like the thick rounded edge of a pane of glass, and zero in the middle.
  function displacementMap(w, h, radius, bezel) {
    // Generated at half resolution: the map is smooth, feImage scales it back up,
    // and it keeps this per-pixel loop (plus the PNG encode) off the critical path.
    const q = 0.5;
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * q));
    c.height = Math.max(1, Math.round(h * q));
    radius *= q; bezel *= q;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(c.width, c.height);
    const d = img.data;

    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        const px0 = x + 0.5;
        const py0 = y + 0.5;
        const dist = sdRoundRect(px0, py0, c.width, c.height, radius);
        let nx = 0;
        let ny = 0;
        let m = 0;
        if (dist < 0) {
          m = Math.pow(1 - clamp(-dist / bezel, 0, 1), 1.7);   // refraction concentrates at the rim
          // outward normal, by central difference
          nx = sdRoundRect(px0 + 1, py0, c.width, c.height, radius) - sdRoundRect(px0 - 1, py0, c.width, c.height, radius);
          ny = sdRoundRect(px0, py0 + 1, c.width, c.height, radius) - sdRoundRect(px0, py0 - 1, c.width, c.height, radius);
          const len = Math.hypot(nx, ny) || 1;
          nx /= len; ny /= len;
        }
        // sample from further inside: push against the outward normal
        d[i] = clamp(128 - nx * m * 127, 0, 255);
        d[i + 1] = clamp(128 - ny * m * 127, 0, 255);
        d[i + 2] = 128;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* Builds (or rebuilds) one filter sized to the element and points the
     element's backdrop-filter at it. opts: radius, bezel, scale, extra (css
     filters applied before the displacement). */
  function refract(el, opts) {
    if (!canRefract || !filterHost) return;
    const rect = el.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (!w || !h) return;
    if (el._rf && el._rf.w === w && el._rf.h === h) return;

    const id = el._rf?.id || `rf-${++filterSeq}`;
    const radius = Math.min(opts.radius ?? h / 2, Math.min(w, h) / 2);
    const bezel = opts.bezel ?? Math.min(22, Math.min(w, h) * 0.32);
    const href = displacementMap(w, h, radius, bezel);

    el._rf?.node?.remove();
    const filter = svg("filter", {
      id, filterUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB",
      x: 0, y: 0, width: w, height: h,
    });
    filter.appendChild(svg("feImage", { href, x: 0, y: 0, width: w, height: h, preserveAspectRatio: "none", result: "map" }));
    filter.appendChild(svg("feDisplacementMap", {
      in: "SourceGraphic", in2: "map", scale: opts.scale ?? bezel * 1.7, xChannelSelector: "R", yChannelSelector: "G",
    }));

    filterHost.appendChild(filter);
    el._rf = { id, w, h, node: filter };
    el.style.backdropFilter = el.style.webkitBackdropFilter = `${opts.extra || ""} url(#${id})`.trim();
  }

  const refractTargets = [];
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 60));
  function registerRefraction(el, opts) {
    if (!el || !canRefract) return;
    refractTargets.push([el, opts]);
    idle(() => refract(el, opts), { timeout: 600 });
  }
  const refreshRefraction = () => refractTargets.forEach(([el, opts]) => refract(el, opts));

  if (nav) registerRefraction(nav, { radius: 999, bezel: 16, scale: 26, extra: "blur(7px) saturate(180%)" });

  /* ---------- boot ------------------------------------------------------ */

  let resizeRaf = 0;
  addEventListener("resize", () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; refreshRefraction(); });
  });

  onScrollFrame();
  document.fonts?.ready.then(refreshRefraction);
})();
