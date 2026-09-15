/* =========================================================
   TRANSITIONS
   Shared motion helpers. Everything here is GPU-friendly:
   only opacity and transform are ever animated.
========================================================= */

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ---------- SCROLL REVEAL ---------- */

export function initReveal() {

    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (reduced || !("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: "0px 0px -12% 0px" });

    items.forEach((el) => observer.observe(el));
}


/* ---------- SUBTLE SCROLL DEPTH ---------- */

export function initScrollDepth() {

    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;

    const layers = [
        ...document.querySelectorAll(".about-portrait, .contact-card"),
        ...document.querySelectorAll(".pcard-front .media-slot")
    ];

    if (!layers.length) return;
    let frame = null;

    const update = () => {
        const viewport = window.innerHeight;
        layers.forEach((layer) => {
            const rect = layer.getBoundingClientRect();
            const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
            const offset = Math.max(-10, Math.min(10, progress * -14));
            layer.style.setProperty("--scroll-depth", `${offset.toFixed(2)}px`);
        });
        frame = null;
    };

    const request = () => {
        if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
}


/* ---------- ANCHOR SCROLL ---------- */

export function initSmoothAnchors() {

    document.addEventListener("click", (event) => {

        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const id = link.getAttribute("href").slice(1);
        if (!id) return;

        const target = document.getElementById(id);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
}
