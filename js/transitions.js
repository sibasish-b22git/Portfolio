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
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    items.forEach((el) => observer.observe(el));
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
