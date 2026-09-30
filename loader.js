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

    /*
     * Start slightly before the red line begins
     * sliding away.
     */
    const TRAIL_START = 1250;


    /*
     * FEWER PARTICLES
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

        if (randomSize < 0.45) {

            /*
             * Normal
             */
            size =
                Math.random() * 4 + 4;

        } else if (randomSize < 0.80) {

            /*
             * Larger
             */
            size =
                Math.random() * 7 + 7;

        } else {

            /*
             * Occasional big chunk
             */
            size =
                Math.random() * 10 + 11;
        }


        /* =================================================
           CREATE
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

            originalSize:
                size,


            /*
             * Start stretched vertically.
             */
            scaleX:
                0.55,

            scaleY:
                2.8,


            /* ---------------------------------------------
               MOVEMENT
               --------------------------------------------- */

            velocityY:
                Math.random() * 2.5 + 3.5,

            velocityX:
                (Math.random() - 0.5) * 0.8,


            /* ---------------------------------------------
               PHASE TIMING
               --------------------------------------------- */

            /*
             * Phase 1:
             * stretch while breaking away.
             */
            stretchTime:
                Math.random() * 5 + 5,

            /*
             * Phase 2:
             * settle into round shape.
             */
            settleTime:
                Math.random() * 5 + 5,

            /*
             * Phase 3:
             * linger.
             */
            lingerTime:
                Math.random() * 18 + 25,

            /*
             * Phase 4:
             * pop.
             */
            popTime:
                7,


            phase:
                "stretch",

            phaseTime:
                0,


            /* ---------------------------------------------
               APPEARANCE
               --------------------------------------------- */

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

        return 1 - Math.pow(1 - t, 3);
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
            particles.filter(particle => {


                particle.phaseTime += 1;


                /* =================================================
                   PHASE 1 — BREAK / STRETCH
                   ================================================= */

                if (
                    particle.phase === "stretch"
                ) {

                    /*
                     * Move quickly with the red line.
                     */
                    particle.y +=
                        particle.velocityY;

                    particle.x +=
                        particle.velocityX;


                    /*
                     * Stretch gets longer at first.
                     */
                    const progress =
                        Math.min(
                            1,
                            particle.phaseTime /
                            particle.stretchTime
                        );

                    particle.scaleY =
                        2.8 +
                        progress * 2.0;

                    particle.scaleX =
                        0.55 -
                        progress * 0.15;


                    /*
                     * Slow down toward the end
                     * of the stretch.
                     */
                    particle.velocityY *=
                        0.78;


                    particle.velocityX *=
                        0.94;


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
                   PHASE 2 — BECOME ROUND
                   ================================================= */

                else if (
                    particle.phase === "settle"
                ) {

                    /*
                     * Continue moving just slightly.
                     */
                    particle.y +=
                        particle.velocityY;

                    particle.x +=
                        particle.velocityX;


                    particle.velocityY *=
                        0.55;

                    particle.velocityX *=
                        0.90;


                    const progress =
                        Math.min(
                            1,
                            particle.phaseTime /
                            particle.settleTime
                        );


                    /*
                     * Long → round
                     */
                    particle.scaleY =
                        4.8 -
                        (
                            3.8 *
                            easeOut(progress)
                        );

                    particle.scaleX =
                        0.40 +
                        (
                            0.60 *
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

                        particle.scaleX =
                            1;

                        particle.scaleY =
                            1;

                        particle.velocityY =
                            0;

                        particle.velocityX =
                            0;
                    }
                }


                /* =================================================
                   PHASE 3 — LINGER
                   ================================================= */

                else if (
                    particle.phase === "linger"
                ) {

                    /*
                     * Almost completely frozen.
                     *
                     * This is the important part:
                     * the particles don't keep falling.
                     */
                    particle.x +=
                        particle.velocityX;

                    particle.y +=
                        particle.velocityY;


                    particle.velocityX *=
                        0.90;

                    particle.velocityY *=
                        0.90;


                    /*
                     * Stay perfectly round.
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
                     * Very fast contraction.
                     */
                    const pop =
                        1 -
                        easeInOut(progress);


                    particle.scaleX =
                        pop;

                    particle.scaleY =
                        pop;


                    /*
                     * Fade only at the very end.
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
           EMIT
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


    /* =====================================================
       IOS SAFARI CLEANUP
       ===================================================== */

    loader.addEventListener(
        "animationend",
        function () {

            loader.style.display =
                "none";

        }
    );
}
