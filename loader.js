const loader = document.querySelector(".page-loader");

if (loader) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    Object.assign(canvas.style, {
        position: "fixed",
        left: "0",
        top: "0",
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: "10000"
    });

    document.body.appendChild(canvas);

    const DURATION = 2000;
    const TRAIL_START = 1250;
    const MAX_PARTICLES = 30;

    let particles = [];
    let startTime = null;

    function resize() {
        const dpr = window.devicePixelRatio || 1;

        canvas.width = innerWidth * dpr;
        canvas.height = innerHeight * dpr;

        canvas.style.width = innerWidth + "px";
        canvas.style.height = innerHeight + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function easeOut(t) {
        return 1 - (1 - t) ** 3;
    }

    function easeInOut(t) {
        return t < 0.5
            ? 4 * t ** 3
            : 1 - (-2 * t + 2) ** 3 / 2;
    }

    function addParticle() {
        const y = loader.getBoundingClientRect().top;

        let size;
        const r = Math.random();

        if (r < 0.45) {
            size = Math.random() * 4 + 4;
        } else if (r < 0.78) {
            size = Math.random() * 7 + 7;
        } else if (r < 0.95) {
            size = Math.random() * 11 + 12;
        } else {
            size = Math.random() * 15 + 24;
        }

        particles.push({
            x: Math.random() * innerWidth,
            y,

            size,

            vx: (Math.random() - 0.5) * 2.5,
            vy: Math.random() * 3.5 + 5.5,

            curve: (Math.random() - 0.5) * 0.18,
            curveV: (Math.random() - 0.5) * 0.025,

            friction: 0.965,
            gravity: Math.random() * 0.025 + 0.015,

            phase: 0,
            time: 0,

            travel: Math.random() * 12 + 15,
            settle: Math.random() * 7 + 7,
            linger: Math.random() * 18 + 28,
            pop: 7,

            scaleX: 0.45,
            scaleY: 2.5,

            opacity: 1
        });
    }

    function update() {
        particles = particles.filter(p => {

            p.time++;

            /* TRAVEL */
            if (p.phase === 0) {

                p.vx += p.curve;
                p.curve += p.curveV;

                p.x += p.vx;
                p.y += p.vy;

                p.vx *= p.friction;
                p.vy *= p.friction;

                p.vy += p.gravity;

                const speed = Math.hypot(p.vx, p.vy);

                /*
                    IMPORTANT:
                    Stretch is locked vertically.
                    No rotation is applied.
                */
                p.scaleY = Math.min(
                    4.5,
                    1 + speed * 0.42
                );

                p.scaleX = Math.max(
                    0.32,
                    1 - speed * 0.055
                );

                if (p.time >= p.travel) {
                    p.phase = 1;
                    p.time = 0;
                }
            }

            /* SETTLE */
            else if (p.phase === 1) {

                p.x += p.vx;
                p.y += p.vy;

                p.vx *= 0.88;
                p.vy *= 0.88;

                p.vy += p.gravity * 0.35;

                const t = Math.min(
                    1,
                    p.time / p.settle
                );

                const e = easeOut(t);

                /*
                    Gradually collapse the vertical stretch
                    back into a circle.
                */
                p.scaleY = 4.5 - 3.5 * e;

                p.scaleX =
                    0.45 +
                    0.55 * e;

                if (p.time >= p.settle) {
                    p.phase = 2;
                    p.time = 0;

                    p.vx = 0;
                    p.vy = 0;

                    p.scaleX = 1;
                    p.scaleY = 1;
                }
            }

            /* LINGER */
            else if (p.phase === 2) {

                p.scaleX = 1;
                p.scaleY = 1;

                if (p.time >= p.linger) {
                    p.phase = 3;
                    p.time = 0;
                }
            }

            /* POP */
            else {

                const t = Math.min(
                    1,
                    p.time / p.pop
                );

                const pop =
                    1 - easeInOut(t);

                p.scaleX = pop;
                p.scaleY = pop;

                if (t > 0.55) {
                    p.opacity =
                        1 -
                        (t - 0.55) / 0.45;
                }

                if (p.time >= p.pop) {
                    return false;
                }
            }

            /* DRAW */

            ctx.save();

            ctx.translate(
                p.x,
                p.y
            );

            /*
                NO ROTATION HERE.

                This guarantees that the stretched
                particles remain perfectly vertical.
            */
            ctx.scale(
                p.scaleX,
                p.scaleY
            );

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                p.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(255,22,9,${p.opacity})`;

            ctx.fill();

            ctx.restore();

            return true;
        });
    }

    function animate(time) {

        if (startTime === null) {
            startTime = time;
        }

        const elapsed =
            time - startTime;

        ctx.clearRect(
            0,
            0,
            innerWidth,
            innerHeight
        );

        if (
            elapsed >= TRAIL_START &&
            elapsed <= DURATION &&
            particles.length < MAX_PARTICLES
        ) {
            addParticle();
        }

        update();

        requestAnimationFrame(animate);
    }

    resize();

    addEventListener(
        "resize",
        resize
    );

    requestAnimationFrame(animate);
}
