/* =========================================================
   HERO INTERACTIONS
   Image-based drone for now. The controller is deliberately
   isolated so the image can later be replaced by a GLB.
========================================================= */

export function initHero() {

    const drone = document.getElementById("heroDrone");
    if (!drone) return;

    const visual = document.querySelector(".hero-visual");
    const image = drone.querySelector(".drone-image");
    if (!visual || !image) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let flying = false;
    let alphaCanvas = null;
    let alphaContext = null;
    let alphaPixels = null;

    /* ---------------------------------------------------------
       Pixel-accurate hover detection.
       CSS :hover sees the entire rectangular button. The PNG
       itself has transparency, so we sample its alpha channel
       and only light the drone when the cursor is actually over
       visible pixels.
    --------------------------------------------------------- */

    const prepareAlphaMap = () => {

        if (!image.complete || !image.naturalWidth) return;

        /* Use a compact alpha map so image hit-testing never disrupts motion. */
        alphaCanvas = document.createElement("canvas");
        alphaCanvas.width = Math.ceil(image.naturalWidth * 0.25);
        alphaCanvas.height = Math.ceil(image.naturalHeight * 0.25);

        alphaContext = alphaCanvas.getContext("2d", { willReadFrequently: true });

        try {
            alphaContext.drawImage(image, 0, 0, alphaCanvas.width, alphaCanvas.height);
            alphaPixels = alphaContext.getImageData(0, 0, alphaCanvas.width, alphaCanvas.height).data;
        } catch (error) {
            alphaCanvas = null;
            alphaContext = null;
            alphaPixels = null;
        }
    };

    const prepareWhenIdle = () => {
        const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 250));
        schedule(prepareAlphaMap, { timeout: 1000 });
    };

    if (image.complete) prepareWhenIdle();
    else image.addEventListener("load", prepareWhenIdle, { once: true });

    const cursorHitsDrone = (event) => {

        if (!alphaPixels || flying) return false;

        const rect = image.getBoundingClientRect();

        const x = Math.floor(
            ((event.clientX - rect.left) / rect.width) * alphaCanvas.width
        );

        const y = Math.floor(
            ((event.clientY - rect.top) / rect.height) * alphaCanvas.height
        );

        if (
            x < 0 || y < 0 ||
            x >= alphaCanvas.width ||
            y >= alphaCanvas.height
        ) return false;

        return alphaPixels[(y * alphaCanvas.width + x) * 4 + 3] > 24;
    };

    drone.addEventListener("pointermove", (event) => {

        if (event.pointerType === "touch" || flying) return;

        drone.classList.toggle("is-lit", cursorHitsDrone(event));
    });

    drone.addEventListener("pointerleave", () => {
        if (!flying) drone.classList.remove("is-lit");
    });

    /* ---------------------------------------------------------
       Click flight.
       The drone is frozen at its exact rendered hover position,
       flies from there, exits completely beyond the left edge,
       is repositioned while invisible, then returns from the
       right and settles back at the same vertical position.
    --------------------------------------------------------- */

    drone.addEventListener("click", async () => {

        if (flying || !drone.classList.contains("is-lit")) return;

        flying = true;
        drone.classList.remove("is-lit");
        drone.classList.add("is-flying");

        const visualRect = visual.getBoundingClientRect();
        const droneRect = drone.getBoundingClientRect();

        const currentY =
            (droneRect.top + droneRect.height / 2) -
            (visualRect.top + visualRect.height / 2);

        /* Freeze the exact vertical point reached by the hover cycle. */
        drone.style.animation = "none";
        drone.style.transform = `translate3d(0, ${currentY}px, 0)`;
        void drone.offsetWidth;

        const travelDistance = Math.max(
            window.innerWidth + droneRect.width + 160,
            visualRect.left + droneRect.width + 160
        );

        const durationOut = 1850;
        const durationIn = 1850;
        const easing = "cubic-bezier(.55,.02,.18,1)";

        const out = drone.animate([
            { transform: `translate3d(0, ${currentY}px, 0) rotateZ(0deg)` },
            { transform: `translate3d(${-travelDistance}px, ${currentY}px, 0) rotateZ(-2deg)` }
        ], {
            duration: durationOut,
            easing,
            fill: "forwards"
        });

        try {
            await out.finished;
        } catch (e) {
            out.cancel();
        }

        /* Reposition only after the drone is completely outside the viewport. */
        drone.style.transform =
            `translate3d(${travelDistance}px, ${currentY}px, 0) rotateZ(2deg)`;
        void drone.offsetWidth;

        const back = drone.animate([
            { transform: `translate3d(${travelDistance}px, ${currentY}px, 0) rotateZ(2deg)` },
            { transform: `translate3d(0, ${currentY}px, 0) rotateZ(0deg)` }
        ], {
            duration: durationIn,
            easing,
            fill: "forwards"
        });

        try {
            await back.finished;
        } catch (e) {
            back.cancel();
        }

        drone.getAnimations().forEach(animation => animation.cancel());
        drone.style.transform = "";
        drone.style.animation = "";
        drone.classList.remove("is-flying");
        flying = false;
    });

    reduceMotion.addEventListener?.("change", () => {

        if (!reduceMotion.matches) return;

        drone.classList.remove("is-flying", "is-lit");
        drone.style.animation = "";
        drone.style.removeProperty("--flight-start-y");
        drone.style.removeProperty("--flight-end-y");
        flying = false;
    });
}
