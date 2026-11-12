/* ==========================================================
   Museo de lo Efímero — interacciones y animaciones (GSAP)
   ========================================================== */

// Cambia este correo por el real antes de publicar.
const CONTACT_EMAIL = "contacto@museodelefimero.pe";

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined";

  /* ---------- Encabezado: sombra al hacer scroll + menú móvil ---------- */
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");

  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  }
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Formulario de contacto ---------- */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  function showError(name, msg) {
    const field = form.elements[name].closest(".field");
    field.classList.toggle("invalid", Boolean(msg));
    form.querySelector('.err[data-for="' + name + '"]').textContent = msg || "";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";

    const nombre = form.elements.nombre.value.trim();
    const correo = form.elements.correo.value.trim();
    const mensaje = form.elements.mensaje.value.trim();
    const motivo = form.elements.motivo.value;

    showError("nombre", nombre ? "" : "Escribe tu nombre.");
    showError("correo", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ? "" : "Escribe un correo válido, por ejemplo nombre@correo.com.");
    showError("mensaje", mensaje ? "" : "Cuéntanos en qué podemos ayudarte.");

    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || !mensaje) {
      const firstInvalid = form.querySelector(".invalid input, .invalid textarea");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Sin servidor de correo: se abre el programa de correo del visitante con el mensaje listo.
    const subject = encodeURIComponent("[" + motivo + "] " + nombre);
    const body = encodeURIComponent(mensaje + "\n\n— " + nombre + " (" + correo + ")");
    window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    status.textContent = "Abrimos tu programa de correo con el mensaje listo. Envíalo desde allí.";
  });

  if (!hasGsap) {
    // Sin GSAP el contenido sigue visible: solo se rellenan las barras.
    document.querySelectorAll(".seg").forEach((s) => { s.style.width = s.dataset.w + "%"; });
    return;
  }

  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  if (reduceMotion) {
    document.querySelectorAll(".seg").forEach((s) => { s.style.width = s.dataset.w + "%"; });
    return;
  }

  /* ---------- Hero: aparición del título como si se secara la pintura ---------- */
  const title = document.querySelector(".hero-title");
  const words = title.textContent.trim().split(/\s+/);
  title.setAttribute("aria-label", title.textContent.trim());
  title.innerHTML = words
    .map((w) => '<span class="word" aria-hidden="true">' + w + "</span>")
    .join(" ");

  const intro = gsap.timeline({ defaults: { ease: "power2.out" } });
  intro
    .from(".wash", { opacity: 0, scale: 0.6, duration: 2.4, stagger: 0.18 }, 0)
    .from(".hero-title .word", {
      opacity: 0, y: 28, filter: "blur(14px)", duration: 1.6, stagger: 0.22,
    }, 0.4)
    .from(".hero-lead", { opacity: 0, y: 16, duration: 1.1 }, 1.5)
    .from(".hero-actions .btn", { opacity: 0, duration: 0.9, stagger: 0.12 }, 1.8)
    .from(".hero-hint", { opacity: 0, duration: 1.2 }, 2.4);

  /* ---------- Hero: las manchas de color flotan despacio ---------- */
  const drift = [
    [".w1", 60, 40], [".w2", -70, 50], [".w3", 50, -45],
    [".w4", 45, -35], [".w5", -55, -40], [".w6", -40, 55],
  ];
  drift.forEach(([sel, x, y], i) => {
    gsap.to(sel, {
      x, y, duration: 9 + i * 1.7, ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.4,
    });
  });

  /* ---------- Hero: pinceladas que se desvanecen (lo efímero) ---------- */
  const hero = document.querySelector(".hero");
  const dabs = document.querySelector(".dabs");
  const palette = ["#7fb3c8", "#b9a6d6", "#8fb89a", "#f2a65a", "#e8a0a8", "#f0d78c"];
  let last = { x: -999, y: -999 };

  function dab(x, y) {
    if (dabs.childElementCount > 24) return;
    const size = gsap.utils.random(60, 150);
    const el = document.createElement("span");
    el.className = "dab";
    el.style.cssText =
      "left:" + (x - size / 2) + "px;top:" + (y - size / 2) + "px;width:" + size +
      "px;height:" + size * gsap.utils.random(0.6, 1) + "px;background:" +
      gsap.utils.random(palette) + ";";
    dabs.appendChild(el);
    gsap.fromTo(el,
      { opacity: 0.55, scale: 0.4, rotation: gsap.utils.random(-30, 30) },
      { opacity: 0, scale: 1.25, duration: 2.6, ease: "power1.out", onComplete: () => el.remove() }
    );
  }

  function onMove(e) {
    const r = hero.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (y < 0 || y > r.height) return;
    if (Math.hypot(x - last.x, y - last.y) < 70) return;
    last = { x, y };
    dab(x, y);
  }
  hero.addEventListener("pointermove", onMove);
  hero.addEventListener("pointerdown", onMove);

  /* ---------- Hero: las manchas se alejan suavemente al bajar ---------- */
  if (window.ScrollTrigger) {
    gsap.to(".washes", {
      yPercent: 18, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });

    /* ---------- Revelado suave de textos ---------- */
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 24, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });

    /* ---------- Tarjetas de productos ---------- */
    ScrollTrigger.batch(".card", {
      start: "top 90%", once: true,
      onEnter: (batch) =>
        gsap.from(batch, { opacity: 0, y: 40, duration: 1, ease: "power2.out", stagger: 0.14 }),
    });

    /* ---------- Reparto de utilidades: las barras se pintan ---------- */
    const bar = document.querySelector(".split-bar");
    const segs = gsap.utils.toArray(".seg");
    ScrollTrigger.create({
      trigger: bar, start: "top 90%", once: true,
      onEnter: () => {
        segs.forEach((s, i) => {
          gsap.to(s, { width: s.dataset.w + "%", duration: 1.6, ease: "power2.inOut", delay: i * 0.25 });
        });
      },
    });

    /* ---------- Testimonios: aparecen como brumas ---------- */
    gsap.from(".quote", {
      opacity: 0, y: 36, filter: "blur(10px)", duration: 1.3, ease: "power2.out", stagger: 0.2,
      scrollTrigger: { trigger: ".quotes", start: "top 82%", once: true },
    });

    /* ---------- Contacto ---------- */
    gsap.from([".contact-info > *", ".form"], {
      opacity: 0, y: 28, duration: 1, ease: "power2.out", stagger: 0.15,
      scrollTrigger: { trigger: ".contact-grid", start: "top 80%", once: true },
    });
  }
})();
