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

    /* ---------------------------------------------------------
       Pixel-accurate hover detection.
       CSS :hover sees the entire rectangular button. The PNG
       itself has transparency, so we sample its alpha channel
       and only light the drone when the cursor is actually over
       visible pixels.
    --------------------------------------------------------- */

    const prepareAlphaMap = () => {

        if (!image.complete || !image.naturalWidth) return;

        alphaCanvas = document.createElement("canvas");
        alphaCanvas.width = image.naturalWidth;
        alphaCanvas.height = image.naturalHeight;

        alphaContext = alphaCanvas.getContext("2d", { willReadFrequently: true });

        try {
            alphaContext.drawImage(image, 0, 0);
        } catch (error) {
            alphaCanvas = null;
            alphaContext = null;
        }
    };

    if (image.complete) prepareAlphaMap();
    else image.addEventListener("load", prepareAlphaMap, { once: true });

    const cursorHitsDrone = (event) => {

        if (!alphaContext || flying) return false;

        const rect = image.getBoundingClientRect();

        const x = Math.floor(
            ((event.clientX - rect.left) / rect.width) * image.naturalWidth
        );

        const y = Math.floor(
            ((event.clientY - rect.top) / rect.height) * image.naturalHeight
        );

        if (
            x < 0 || y < 0 ||
            x >= image.naturalWidth ||
            y >= image.naturalHeight
        ) return false;

        try {
            const alpha = alphaContext.getImageData(x, y, 1, 1).data[3];
            return alpha > 24;
        } catch {
            return false;
        }
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
