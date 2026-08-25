/* =========================================================
   PROJECT COLLAGE
   Click / Enter / Space flips a card. Pointer devices also
   get a subtle parallax lift on the un-flipped face.
========================================================= */

export function initProjects() {

    const cards = document.querySelectorAll(".pcard");
    if (!cards.length) return;

    const fine = !window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches;

    cards.forEach((card) => {

        const flip = () => {
            const next = !card.classList.contains("is-flipped");
            /* only one card open at a time keeps the collage readable */
            cards.forEach((c) => c.classList.remove("is-flipped"));
            card.classList.toggle("is-flipped", next);
            card.setAttribute("aria-expanded", String(next));
        };

        card.addEventListener("click", (event) => {
            /* let real links on the back face work normally */
            if (event.target.closest("a")) return;
            flip();
        });

        card.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            if (event.target.closest("a")) return;
            event.preventDefault();
            flip();
        });

        if (!fine) return;

        let frame = null;

        card.addEventListener("mousemove", (event) => {

            if (frame || card.classList.contains("is-flipped")) return;

            frame = requestAnimationFrame(() => {

                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;

                card.style.transform =
                    `translate3d(${x * 5}px, calc(-6px + ${y * 5}px), 0)`;

                frame = null;
            });
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
}
