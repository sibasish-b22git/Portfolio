/* =========================================================
   THEME

   Performance notes:
   - No View Transition snapshot (that was the frame drop:
     the browser screenshotted and cross-faded the whole page
     while every element also ran its own colour transition).
   - Instead the swap is instantaneous and only <body> and the
     navbar cross-fade, guarded by html.theme-anim for 250ms.
========================================================= */

export function initTheme() {

    const root   = document.documentElement;
    const toggle = document.getElementById("themeSwitch");

    if (!toggle) return;

    /* restore, before any listener runs */
    const isLight = root.dataset.initialTheme === "light";

    document.body.classList.toggle("light-mode", isLight);
    toggle.checked = isLight;

    let timer = null;

    toggle.addEventListener("change", () => {

        const light = toggle.checked;

        root.classList.add("theme-anim");

        /* The knob has a directional squash: it stretches toward the
           direction it is travelling, so light → dark does not read
           like the same animation played backwards. */
        toggle.closest(".theme-switch")?.classList.remove("moving-left", "moving-right");
        toggle.closest(".theme-switch")?.classList.add(light ? "moving-right" : "moving-left");

        document.body.classList.toggle("light-mode", light);

        try {
            localStorage.setItem("portfolio-theme", light ? "light" : "dark");
        } catch (e) {}

        clearTimeout(timer);
        timer = setTimeout(() => {
            root.classList.remove("theme-anim");
            toggle.closest(".theme-switch")?.classList.remove("moving-left", "moving-right");
        }, 600);
    });
}
