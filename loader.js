/* =========================================================
   PAGE LOADER + DRIPPING / POPPING PARTICLES
   ========================================================= */

const loader = document.querySelector(".page-loader");

if (!loader) {
    console.warn("Page loader not found.");
} else {

    /* =====================================================
       CANVAS
       ===================================================== */

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.style.position = "fixed";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "10000";

    document.body.appendChild(canvas);


    /* =====================================================
       SETTINGS
       ===================================================== */

    const DURATION = 2000;

    const TRAIL_START = 1250;


    /*
     * KEEP PARTICLE COUNT LOW
     */
    const PARTICLES_PER_FRAME = 1;

    const MAX_PARTICLES = 45;


    let particles = [];
    let startTime = null;


    /* =====================================================
       CANVAS SIZE
       ===================================================== */

    function resizeCanvas() {

        const dpr =
            window.devicePixelRatio || 1;

        canvas.width =
            window.innerWidth * dpr;

        canvas.height =
            window.innerHeight * dpr;

        canvas.style.width =
            window.innerWidth + "px";

        canvas.style.height =
            window.innerHeight + "px";

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );
    }


    /* =====================================================
       CREATE PARTICLE
       ===================================================== */

    function createParticle(edgeY) {

        if (
            edgeY < -40 ||
            edgeY > window.innerHeight + 40
        ) {
            return;
        }


        /* =================================================
           SIZE
           ================================================= */

        let size;

        const randomSize =
            Math.random();


        if (randomSize < 0.42) {

            /*
             * Normal particles
             */
            size =
                Math.random() * 4 + 4;

        } else if (randomSize < 0.78) {

            /*
             * Larger particles
             */
            size =
                Math.random() * 8 + 7;

        } else if (randomSize < 0.95) {

            /*
             * Big chunks
             */
            size =
                Math.random() * 12 + 12;

        } else {

            /*
             * RARE HUGE CHUNK
             *
             * These should feel like actual
             * pieces breaking from the red line.
             */
            size =
                Math.random() * 14 + 22;
        }


        /* =================================================
           INITIAL MOMENTUM
           ================================================= */

        particles.push({

            x:
                Math.random() *
                window.innerWidth,

            y:
                edgeY,


            /* ---------------------------------------------
               SIZE
               --------------------------------------------- */

            size:
                size,


            /* ---------------------------------------------
               SHAPE
               --------------------------------------------- */

            scaleX:
                0.45,

            scaleY:
                2.5,


            /* ---------------------------------------------
               INERTIA
               --------------------------------------------- */

            /*
             * Strong initial downward velocity.
             */
            velocityY:
                Math.random() * 2.5 + 5.5,

            /*
             * Slight sideways movement.
             */
            velocityX:
                (Math.random() - 0.5) * 1.2,


            /*
             * How quickly the initial velocity
             * is lost.
             *
             * Higher = more inertia.
             */
            friction:
                0.91,


            /*
             * Tiny gravity.
             *
             * This keeps the particle moving after
             * the initial burst without making it
             * constantly fall.
             */
            gravity:
                Math.random() * 0.025 + 0.015,


            /* ---------------------------------------------
               PHASE TIMING
               --------------------------------------------- */

            stretchTime:
                Math.random() * 5 + 5,

            settleTime:
                Math.random() * 7 + 6,

            lingerTime:
                Math.random() * 20 + 30,

            popTime:
                7,


            phase:
                "stretch",

            phaseTime:
                0,


            opacity:
                1
        });
    }


    /* =====================================================
       GET RED LOADER EDGE
       ===================================================== */

    function getLoaderEdge() {

        const rect =
            loader.getBoundingClientRect();

        return rect.top;
    }


    /* =====================================================
       EASING
       ===================================================== */

    function easeOut(t) {

        return 1 -
            Math.pow(
                1 - t,
                3
            );
    }


    function easeInOut(t) {

        return t < 0.5
            ? 4 * t * t * t
            : 1 -
              Math.pow(
                  -2 * t + 2,
                  3
              ) / 2;
    }


    /* =====================================================
       UPDATE PARTICLES
       ===================================================== */

    function updateParticles() {

        particles =
            particles.filter(
                particle => {


                particle.phaseTime += 1;


                /* =================================================
                   PHASE 1 — BREAK AWAY
                   ================================================= */

                if (
                    particle.phase === "stretch"
                ) {

                    /*
                     * INERTIA IS THE MAIN MOVEMENT HERE.
                     *
                     * Particle initially moves quickly,
                     * carrying momentum away from the line.
                     */
                    particle.x +=
                        particle.velocityX;

                    particle.y +=
                        particle.velocityY;


                    /*
                     * Stretch while it is being
                     * pulled away.
                     */
                    const progress =
                        Math.min(
                            1,
                            particle.phaseTime /
                            particle.stretchTime
                        );


                    particle.scaleY =
                        2.5 +
                        progress * 2.5;

                    particle.scaleX =
                        0.45 -
                        progress * 0.12;


                    /*
                     * DON'T kill the momentum too quickly.
                     */
                    particle.velocityY *=
                        particle.friction;

                    particle.velocityY +=
                        particle.gravity;


                    particle.velocityX *=
                        0.97;


                    if (
                        particle.phaseTime >=
                        particle.stretchTime
                    ) {

                        particle.phase =
                            "settle";

                        particle.phaseTime =
                            0;
                    }
                }


                /* =================================================
                   PHASE 2 — INERTIA + BECOMING ROUND
                   ================================================= */

                else if (
                    particle.phase === "settle"
                ) {

                    /*
                     * Continue carrying momentum.
                     */
                    particle.x +=
                        particle.velocityX;

                    particle.y +=
                        particle.velocityY;


                    /*
                     * Gradually kill the momentum.
                     *
                     * This is what gives the effect
                     * that the particle has weight.
                     */
                    particle.velocityY *=
                        0.88;

                    particle.velocityY +=
                        particle.gravity * 0.5;

                    particle.velocityX *=
                        0.92;


                    const progress =
                        Math.min(
                            1,
                            particle.phaseTime /
                            particle.settleTime
                        );


                    /*
                     * Stretch → round
                     */
                    particle.scaleY =
                        5 -
                        (
                            4 *
                            easeOut(progress)
                        );


                    particle.scaleX =
                        0.33 +
                        (
                            0.67 *
                            easeOut(progress)
                        );


                    if (
                        particle.phaseTime >=
                        particle.settleTime
                    ) {

                        particle.phase =
                            "linger";

                        particle.phaseTime =
                            0;


                        /*
                         * Freeze its final position.
                         */
                        particle.velocityY =
                            0;

                        particle.velocityX =
                            0;


                        particle.scaleX =
                            1;

                        particle.scaleY =
                            1;
                    }
                }


                /* =================================================
                   PHASE 3 — LINGER
                   ================================================= */

                else if (
                    particle.phase === "linger"
                ) {

                    /*
                     * Completely still.
                     *
                     * This creates the suspended
                     * "floating chunk" effect.
                     */
                    particle.scaleX = 1;
                    particle.scaleY = 1;


                    if (
                        particle.phaseTime >=
                        particle.lingerTime
                    ) {

                        particle.phase =
                            "pop";

                        particle.phaseTime =
                            0;
                    }
                }


                /* =================================================
                   PHASE 4 — POP
                   ================================================= */

                else if (
                    particle.phase === "pop"
                ) {

                    const progress =
                        Math.min(
                            1,
                            particle.phaseTime /
                            particle.popTime
                        );


                    /*
                     * Very fast collapse.
                     */
                    const pop =
                        1 -
                        easeInOut(progress);


                    particle.scaleX =
                        pop;

                    particle.scaleY =
                        pop;


                    /*
                     * Fade only near the end.
                     */
                    if (
                        progress > 0.65
                    ) {

                        particle.opacity =
                            1 -
                            (
                                (progress - 0.65) /
                                0.35
                            );
                    }


                    if (
                        particle.phaseTime >=
                        particle.popTime
                    ) {

                        return false;
                    }
                }


                /* =================================================
                   DRAW
                   ================================================= */

                ctx.save();


                ctx.translate(
                    particle.x,
                    particle.y
                );


                ctx.scale(
                    particle.scaleX,
                    particle.scaleY
                );


                ctx.beginPath();


                ctx.arc(
                    0,
                    0,
                    particle.size,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    `rgba(
                        255,
                        22,
                        9,
                        ${particle.opacity}
                    )`;


                ctx.fill();


                ctx.restore();


                return true;
            });
    }


    /* =====================================================
       ANIMATION
       ===================================================== */

    function animate(timestamp) {

        if (startTime === null) {
            startTime =
                timestamp;
        }


        const elapsed =
            timestamp -
            startTime;


        /* ---------------------------------------------
           CLEAR
           --------------------------------------------- */

        ctx.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );


        /* ---------------------------------------------
           EMIT PARTICLES
           --------------------------------------------- */

        if (
            elapsed >= TRAIL_START &&
            elapsed <= DURATION
        ) {

            const edgeY =
                getLoaderEdge();


            if (
                particles.length <
                MAX_PARTICLES
            ) {

                for (
                    let i = 0;
                    i < PARTICLES_PER_FRAME;
                    i++
                ) {

                    createParticle(edgeY);
                }
            }
        }


        /* ---------------------------------------------
           UPDATE
           --------------------------------------------- */

        updateParticles();


        /* ---------------------------------------------
           CONTINUE
           --------------------------------------------- */

        requestAnimationFrame(
            animate
        );
    }


    /* =====================================================
       START
       ===================================================== */

    resizeCanvas();


    window.addEventListener(
        "resize",
        resizeCanvas
    );


    requestAnimationFrame(
        animate
    );
}
