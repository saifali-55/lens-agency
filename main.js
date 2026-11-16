(() => {
  const WA_NUMBER = "9647817773950";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- شعار العدسة: أشعة حول فتحة الكاميرا ---------- */
  const SVG_NS = "http://www.w3.org/2000/svg";

  function drawSunburst(svg) {
    const rays = 40;
    const inner = 17;
    const width = 2.7;
    let d = "";

    for (let i = 0; i < rays; i++) {
      const outer = i % 2 === 0 ? 48 : 42;
      const a = (i * 2 * Math.PI) / rays;
      const point = (x, y) => {
        const rx = x * Math.cos(a) - y * Math.sin(a);
        const ry = x * Math.sin(a) + y * Math.cos(a);
        return `${rx.toFixed(2)},${ry.toFixed(2)}`;
      };
      d +=
        `M${point(0, -outer)}` +
        `C${point(width, -outer * 0.72)} ${point(width, -inner * 1.5)} ${point(0, -inner)}` +
        `C${point(-width, -inner * 1.5)} ${point(-width, -outer * 0.72)} ${point(0, -outer)}Z`;
    }

    const raysPath = document.createElementNS(SVG_NS, "path");
    raysPath.setAttribute("d", d);
    raysPath.setAttribute("stroke", "none");
    svg.appendChild(raysPath);

    const ring = document.createElementNS(SVG_NS, "circle");
    ring.setAttribute("r", "11");
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke-width", "2.2");
    svg.appendChild(ring);

    let blades = "";
    for (let k = 0; k < 6; k++) {
      const a1 = (k * Math.PI) / 3;
      const a2 = a1 + (75 * Math.PI) / 180;
      blades +=
        `M${(11 * Math.cos(a1)).toFixed(2)},${(11 * Math.sin(a1)).toFixed(2)}` +
        `L${(4.6 * Math.cos(a2)).toFixed(2)},${(4.6 * Math.sin(a2)).toFixed(2)}`;
    }
    const bladesPath = document.createElementNS(SVG_NS, "path");
    bladesPath.setAttribute("d", blades);
    bladesPath.setAttribute("fill", "none");
    bladesPath.setAttribute("stroke-width", "1.5");
    bladesPath.setAttribute("stroke-linecap", "round");
    svg.appendChild(bladesPath);
  }

  document.querySelectorAll(".sunburst").forEach(drawSunburst);

  /* ---------- روابط واتساب ---------- */
  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- الشريط العلوي + دوران العدسة ويا السكرول ---------- */
  const nav = document.getElementById("nav");
  const heroLens = document.querySelector(".hero-lens");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("is-stuck", y > 40);
    if (!reduceMotion && heroLens && y < window.innerHeight * 1.2) {
      heroLens.style.setProperty("--turn", `${(y * 0.07).toFixed(2)}deg`);
    }
    pickFocusByScroll();
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );

  /* ---------- الأعمال: المشروع اللي عليه الفوكس يوضح ---------- */
  const list = document.getElementById("workList");
  const buttons = [...list.querySelectorAll("button")];
  const posterClient = document.getElementById("posterClient");
  const posterCat = document.getElementById("posterCat");
  const touchOnly = window.matchMedia("(hover: none)").matches;
  let current = null;

  function focusOn(btn) {
    if (btn === current) return;
    current = btn;
    buttons.forEach((b) => b.classList.toggle("is-focus", b === btn));
    list.classList.add("has-focus");

    posterClient.textContent = btn.dataset.name;
    posterCat.textContent = btn.dataset.cat;
    posterClient.classList.remove("is-swapping");
    void posterClient.offsetWidth; // يعيد تشغيل حركة الفوكس
    posterClient.classList.add("is-swapping");
  }

  buttons.forEach((btn) => {
    btn.addEventListener("pointerenter", () => focusOn(btn));
    btn.addEventListener("focus", () => focusOn(btn));
    btn.addEventListener("click", () => focusOn(btn));
  });

  // على اللمس ماكو تأشير، فالمشروع الأقرب لنص الشاشة ياخذ الفوكس
  function pickFocusByScroll() {
    if (!touchOnly) return;
    const rect = list.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const mid = window.innerHeight / 2;
    let best = buttons[0];
    let bestDist = Infinity;
    buttons.forEach((b) => {
      const r = b.getBoundingClientRect();
      const dist = Math.abs(r.top + r.height / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = b;
      }
    });
    focusOn(best);
  }

  focusOn(buttons[0]);
  onScroll();

  /* ---------- نموذج التواصل: يفتح واتساب برسالة جاهزة ---------- */
  const form = document.getElementById("waForm");
  const nameInput = document.getElementById("fName");
  const nameErr = document.getElementById("fNameErr");

  nameInput.addEventListener("input", () => {
    nameInput.removeAttribute("aria-invalid");
    nameErr.hidden = true;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();

    if (!name) {
      nameInput.setAttribute("aria-invalid", "true");
      nameInput.setAttribute("aria-describedby", "fNameErr");
      nameErr.hidden = false;
      nameInput.focus();
      return;
    }

    const type = form.elements.type.value;
    const services = [...form.querySelectorAll('input[name="svc"]:checked')].map((i) => i.value);

    const lines = [`مرحبا لينس، اسمي ${name}.`, `مشروعي: ${type}.`];
    if (services.length) lines.push(`أحتاج: ${services.join("، ")}.`);

    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });
})();
