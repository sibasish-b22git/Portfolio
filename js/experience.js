/* =========================================================
   EXPERIENCE INTERACTIONS
========================================================= */

export function initExperience() {

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = !window.matchMedia("(pointer: coarse)").matches && !reduced;

    /* ---------------------------------------------------------
       Subtle hover lift
    --------------------------------------------------------- */
    if (fine) {
        document.querySelectorAll(".leadership-card").forEach((card) => {

            let frame = null;

            card.addEventListener("mousemove", (event) => {

                if (frame || card.classList.contains("is-flipped")) return;

                frame = requestAnimationFrame(() => {

                    const rect = card.getBoundingClientRect();
                    const x = (event.clientX - rect.left) / rect.width - 0.5;
                    const y = (event.clientY - rect.top) / rect.height - 0.5;

                    card.style.transform =
                        `translate3d(${x * 3}px, calc(-4px + ${y * 3}px), 0)`;

                    frame = null;
                });
            });

            card.addEventListener("mouseleave", () => {
                if (frame) cancelAnimationFrame(frame);
                frame = null;
                card.style.transform = "";
            });
        });
    }

    /* ---------------------------------------------------------
       NXP AIM — local flip only
    --------------------------------------------------------- */
    document.querySelectorAll(".leadership-flip").forEach((card) => {

        const flip = () => {
            card.classList.toggle("is-flipped");
        };

        card.addEventListener("click", flip);
        card.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            flip();
        });
    });

    /* ---------------------------------------------------------
       Leadership → project
       Scroll to the project, then open its flip face.
    --------------------------------------------------------- */
    document.querySelectorAll(".leadership-project-link").forEach((card) => {

        const openProject = () => {

            const id = card.dataset.projectTarget;
            const project = document.getElementById(id);
            if (!project) return;

            const navbar = document.querySelector(".navbar");
            const offset = (navbar?.getBoundingClientRect().height || 0) + 24;
            const targetY =
                project.getBoundingClientRect().top +
                window.scrollY -
                offset;

            window.scrollTo({
                top: Math.max(0, targetY),
                behavior: reduced ? "auto" : "smooth"
            });

            /* Wait for the scroll to settle enough that the flip is visible. */
            window.setTimeout(() => {
                project.classList.add("is-flipped");
                project.setAttribute("aria-expanded", "true");
            }, reduced ? 0 : 550);
        };

        card.addEventListener("click", openProject);
        card.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            openProject();
        });
    });

    /* ---------------------------------------------------------
       External leadership cards
       Replace the placeholder data-external-url values in
       experience.html with the real destinations.
    --------------------------------------------------------- */
    document.querySelectorAll(".leadership-link").forEach((card) => {

        const openExternal = () => {

            const url = card.dataset.externalUrl || "";
            if (!url || url.startsWith("PASTE_")) return;

            window.open(url, "_blank", "noopener,noreferrer");
        };

        card.addEventListener("click", openExternal);
        card.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            openExternal();
        });
    });
}
