// Market Lab guide hero: a particles.js field over the purple gradient.
// Particles drift and link up; hovering pulls lines to the pointer and a
// click adds a few more. Reduced motion keeps the field still.
(() => {
  const host = document.getElementById("guide-particles");
  if (!host || typeof window.particlesJS !== "function") return;

  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = window.matchMedia("(max-width: 720px)").matches;

  window.particlesJS("guide-particles", {
    particles: {
      // particles.js 2.0.0 crashes when density runs with movement off (it
      // draws before setting the line colour), so a still field skips it.
      number: { value: narrow ? 40 : 90, density: { enable: !still, value_area: 900 } },
      color: { value: ["#e2ddff", "#c6bff5", "#96f550"] },
      shape: { type: "circle" },
      opacity: {
        value: 0.6,
        random: true,
        anim: { enable: !still, speed: 0.6, opacity_min: 0.2, sync: false },
      },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 140,
        color: "#c6bff5",
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: !still,
        speed: 1.4,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: !still, mode: "grab" },
        onclick: { enable: !still, mode: "push" },
        resize: true,
      },
      modes: {
        grab: { distance: 170, line_linked: { opacity: 0.75 } },
        push: { particles_nb: 4 },
      },
    },
    retina_detect: true,
  });
})();
