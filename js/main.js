/* =========================================================
   MAIN
========================================================= */

import { initTheme } from "./theme.js";
import { initReveal, initSmoothAnchors } from "./transitions.js";
import { initHero } from "./hero.js";
import { initProjects } from "./projects.js";
import { initExperience } from "./experience.js";


const sections = ["hero", "projects", "experience", "about", "contact"];


/* ---------- SECTION LOADER ---------- */

async function loadSections() {

    const container = document.getElementById("page-sections");
    if (!container) return;

    const parts = await Promise.all(
        sections.map(async (name) => {
            try {
                const res = await fetch(`sections/${name}.html`);
                if (!res.ok) throw new Error(`Cannot load sections/${name}.html`);
                return await res.text();
            } catch (error) {
                console.error(error);
                return "";
            }
        })
    );

    container.insertAdjacentHTML("beforeend", parts.join("\n"));
}


/* ---------- NAVBAR ----------
   Only toggles a class. Colours live in CSS, so the bar
   re-themes the instant the theme flips, without scrolling.
------------------------------------------------------- */

function initNavbar() {

    const navbar = document.querySelector(".navbar");
    const toggle = document.getElementById("navToggle");
    const links  = document.getElementById("navLinks");

    if (!navbar) return;

    const onScroll = () => navbar.classList.toggle("is-scrolled", window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && links) {
        toggle.addEventListener("click", () => links.classList.toggle("is-open"));
        links.addEventListener("click", (e) => {
            if (e.target.closest("a")) links.classList.remove("is-open");
        });
    }
}


/* ---------- ACTIVE LINK ---------- */

function initActiveLink() {

    const map = new Map();

    document.querySelectorAll(".nav-link").forEach((link) => {
        const id = link.getAttribute("href").slice(1);
        const el = document.getElementById(id);
        if (el) map.set(el, link);
    });

    if (!map.size) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("is-active"));
            map.get(entry.target)?.classList.add("is-active");
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    map.forEach((_, el) => observer.observe(el));
}


/* ---------- PRELOADER ---------- */

async function finishPreloader() {

    const preloader = document.getElementById("preloader");
    if (!preloader) return;

    const imagePromises = [...document.images].map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
        });
    });

    try {
        if (document.fonts?.ready) await document.fonts.ready;
        await Promise.all(imagePromises);
    } catch (error) {}

    preloader.classList.add("is-hidden");
    document.body.classList.add("is-ready");

    window.setTimeout(() => preloader.remove(), 650);
}


/* ---------- START ---------- */

async function init() {

    initTheme();
    initNavbar();

    await loadSections();

    initReveal();
    initSmoothAnchors();
    initActiveLink();

    initHero();
    initProjects();
    initExperience();
    await finishPreloader();
}

init();
