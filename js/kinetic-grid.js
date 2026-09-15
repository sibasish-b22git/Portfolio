/* =========================================================
   KINETIC HERO GRID
   Canvas adaptation of the supplied component, kept local to
   the static portfolio so no framework migration is required.
========================================================= */

export function initKineticGrid() {

    const hero = document.querySelector(".hero");
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.className = "kinetic-grid";
    canvas.setAttribute("aria-hidden", "true");
    hero.prepend(canvas);

    const context = canvas.getContext("2d");
    if (!context) return;

    const pointer = { x: -9999, y: -9999, targetX: -9999, targetY: -9999 };
    const ripples = [];
    let frame = 0;
    let width = 0;
    let height = 0;
    const cell = 58;
    const influence = 240;

    const resize = () => {
        const rect = hero.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (now) => {
        pointer.x += (pointer.targetX - pointer.x) * 0.08;
        pointer.y += (pointer.targetY - pointer.y) * 0.08;
        context.clearRect(0, 0, width, height);

        const light = document.body.classList.contains("light-mode");
        const line = light ? "rgba(20, 22, 26, 0.10)" : "rgba(236, 239, 238, 0.11)";
        const active = light ? "rgba(226, 97, 10," : "rgba(255, 122, 26,";
        const cols = Math.ceil(width / cell) + 1;
        const rows = Math.ceil(height / cell) + 1;
        const points = [];

        for (let row = 0; row < rows; row += 1) {
            points[row] = [];
            for (let col = 0; col < cols; col += 1) {
                const baseX = col * (width / (cols - 1));
                const baseY = row * (height / (rows - 1));
                const edge = Math.min(col / 1.5, (cols - 1 - col) / 1.5, row / 1.5, (rows - 1 - row) / 1.5, 1);
                const dx = baseX - pointer.x;
                const dy = baseY - pointer.y;
                const distance = Math.hypot(dx, dy);
                const proximity = Math.max(0, 1 - distance / influence) * edge * edge;
                const push = proximity * proximity * 23;
                let x = baseX + (distance ? (dx / distance) * push : 0);
                let y = baseY + (distance ? (dy / distance) * push : 0);

                ripples.forEach((ripple) => {
                    const rx = baseX - ripple.x;
                    const ry = baseY - ripple.y;
                    const rippleDistance = Math.hypot(rx, ry);
                    const difference = Math.abs(rippleDistance - ripple.radius);
                    if (difference >= 48 || !rippleDistance) return;
                    const strength = (1 - difference / 48) * ripple.opacity * 13 * edge;
                    x += (rx / rippleDistance) * strength;
                    y += (ry / rippleDistance) * strength;
                });
                points[row][col] = { x, y, proximity };
            }
        }

        context.lineCap = "butt";
        for (let row = 0; row < rows; row += 1) {
            for (let col = 0; col < cols; col += 1) {
                const point = points[row][col];
                const neighbours = [points[row][col + 1], points[row + 1]?.[col]].filter(Boolean);
                neighbours.forEach((next) => {
                    const intensity = Math.max(point.proximity, next.proximity);
                    context.beginPath();
                    context.moveTo(point.x, point.y);
                    context.lineTo(next.x, next.y);
                    context.strokeStyle = intensity ? `${active}${(0.13 + intensity * 0.66).toFixed(3)})` : line;
                    context.lineWidth = 0.7 + intensity * 0.8;
                    context.stroke();
                });
                context.beginPath();
                context.arc(point.x, point.y, 1 + point.proximity * 1.7, 0, Math.PI * 2);
                context.fillStyle = point.proximity ? `${active}${(0.28 + point.proximity * 0.7).toFixed(3)})` : line;
                context.fill();
            }
        }

        for (let index = ripples.length - 1; index >= 0; index -= 1) {
            const ripple = ripples[index];
            const age = (now - ripple.born) / 1000;
            ripple.radius = age * 360;
            ripple.opacity = Math.max(0, 1 - age * 1.15);
            if (!ripple.opacity) ripples.splice(index, 1);
        }
        frame = requestAnimationFrame(draw);
    };

    const onPointerMove = (event) => {
        const rect = hero.getBoundingClientRect();
        pointer.targetX = event.clientX - rect.left;
        pointer.targetY = event.clientY - rect.top;
    };
    const onPointerLeave = () => { pointer.targetX = -9999; pointer.targetY = -9999; };
    const onClick = (event) => {
        const rect = hero.getBoundingClientRect();
        ripples.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, radius: 0, opacity: 1, born: performance.now() });
    };

    resize();
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
    hero.addEventListener("click", onClick);
    window.addEventListener("resize", resize, { passive: true });
    frame = requestAnimationFrame(draw);

    return () => {
        cancelAnimationFrame(frame);
        hero.removeEventListener("pointermove", onPointerMove);
        hero.removeEventListener("pointerleave", onPointerLeave);
        hero.removeEventListener("click", onClick);
        window.removeEventListener("resize", resize);
        canvas.remove();
    };
}
