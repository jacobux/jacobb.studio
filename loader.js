/* =========================================================
   PAGE LOADER + SPIRALLING PARTICLE TRAIL
   ========================================================= */

const loader = document.querySelector(".page-loader");

if (!loader) {
    console.warn("No .page-loader found.");
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
     * When particles begin appearing.
     */
    const TRAIL_START = 1250;

    /*
     * Fewer particles.
     */
    const MAX_PARTICLES = 30;

    /*
     * Only one particle is created per frame.
     */
    const PARTICLES_PER_FRAME = 1;


    let particles = [];
    let startTime = null;


    /* =====================================================
       CANVAS RESIZE
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
       CREATE PARTICLE
       ===================================================== */

    function createParticle(edgeY) {

        /*
         * Don't create particles outside the viewport.
         */
        if (
            edgeY < -50 ||
            edgeY > window.innerHeight + 50
        ) {
            return;
        }


        /* =================================================
           RANDOM SIZE
           ================================================= */

        let size;

        const random =
            Math.random();


        /*
         * 45% small
         */
        if (random < 0.45) {

            size =
                Math.random() * 4 + 4;
        }


        /*
         * 33% medium
         */
        else if (random < 0.78) {

            size =
                Math.random() * 7 + 7;
        }


        /*
         * 17% large
         */
        else if (random < 0.95) {

            size =
                Math.random() * 11 + 12;
        }


        /*
         * 5% HUGE
         */
        else {

            size =
                Math.random() * 15 + 24;
        }


        /* =================================================
           CREATE PARTICLE
           ================================================= */

        particles.push({

            /*
             * Spawn somewhere along the red edge.
             */
            x:
                Math.random() *
                window.innerWidth,

            y:
                edgeY,


            /*
             * Size.
             */
            size:
                size,


            /* =================================================
               MOVEMENT
               ================================================= */

            /*
             * Initial sideways movement.
             */
            velocityX:
                (Math.random() - 0.5) *
                2.5,

            /*
             * Strong downward movement.
             */
            velocityY:
                Math.random() * 3.5 +
                5.5,


            /*
             * Curve force.
             *
             * This gives the particle its
             * spiral / wandering motion.
             */
            curve:
                (Math.random() - 0.5) *
                0.18,

            /*
             * Curve changes slightly over time.
             */
            curveVelocity:
                (Math.random() - 0.5) *
                0.025,


            /*
             * Momentum retention.
             *
             * 1.0 = never slows down.
             * Lower = slows faster.
             */
            friction:
                0.965,


            /*
             * Tiny gravity.
             */
            gravity:
                Math.random() *
                0.025 +
                0.015,


            /* =================================================
               ROTATION
               ================================================= */

            rotation:
                Math.random() *
                Math.PI *
                2,

            rotationSpeed:
                (Math.random() - 0.5) *
                0.08,


            /* =================================================
               PHASE
               ================================================= */

            /*
             * travel
             * settle
             * linger
             * pop
             */
            phase:
                "travel",

            phaseTime:
                0,


            /*
             * How long it travels.
             */
            travelTime:
                Math.random() * 12 +
                15,


            /*
             * How long it takes to become round.
             */
            settleTime:
                Math.random() * 7 +
                7,


            /*
             * Shorter stationary period.
             */
            lingerTime:
                Math.random() * 18 +
                28,


            /*
             * Pop duration.
             */
            popTime:
                7,


            /* =================================================
               SHAPE
               ================================================= */

            scaleX:
                0.45,

            scaleY:
                2.5,


            opacity:
                1
        });
    }


    /* =====================================================
       GET RED LINE POSITION
       ===================================================== */

    function getLoaderEdge() {

        const rect =
            loader.getBoundingClientRect();

        /*
         * The moving top edge of the red loader.
         */
        return rect.top;
    }


    /* =====================================================
       UPDATE PARTICLES
       ===================================================== */

    function updateParticles() {

        particles =
            particles.filter(
                function (particle) {


                particle.phaseTime += 1;


                /* =================================================
                   PHASE 1 — TRAVEL
                   ================================================= */

                if (
                    particle.phase === "travel"
                ) {

                    /*
                     * Add curve to horizontal movement.
                     */
                    particle.velocityX +=
                        particle.curve;


                    /*
                     * Slowly change the curve.
                     */
                    particle.curve +=
                        particle.curveVelocity;


                    /*
                     * Move particle.
                     */
                    particle.x +=
                        particle.velocityX;

                    particle.y +=
                        particle.velocityY;


                    /*
                     * Retain most of the momentum.
                     */
                    particle.velocityX *=
                        particle.friction;

                    particle.velocityY *=
                        particle.friction;


                    /*
                     * Small gravitational force.
                     */
                    particle.velocityY +=
                        particle.gravity;


                    /*
                     * Rotate.
                     */
                    particle.rotation +=
                        particle.rotationSpeed;


                    /* =================================================
                       STRETCH BASED ON SPEED
                       ================================================= */

                    const speed =
                        Math.sqrt(
                            particle.velocityX *
                            particle.velocityX +
                            particle.velocityY *
                            particle.velocityY
                        );


                    /*
                     * Fast = long.
                     * Slow = round.
                     */
                    const stretch =
                        Math.min(
                            4.5,
                            1 +
                            speed * 0.42
                        );


                    particle.scaleY =
                        stretch;

                    particle.scaleX =
                        Math.max(
                            0.32,
                            1 -
                            speed * 0.055
                        );


                    /*
                     * Move to settle phase.
                     */
                    if (
                        particle.phaseTime >=
                        particle.travelTime
                    ) {

                        particle.phase =
                            "settle";

                        particle.phaseTime =
                            0;
                    }
                }


                /* =================================================
                   PHASE 2 — SETTLE
                   ================================================= */

                else if (
                    particle.phase === "settle"
                ) {

                    /*
                     * Keep moving while
                     * becoming round.
                     */
                    particle.x +=
                        particle.velocityX;

                    particle.y +=
                        particle.velocityY;


                    /*
                     * Gradually remove momentum.
                     */
                    particle.velocityX *=
                        0.88;

                    particle.velocityY *=
                        0.88;


                    particle.velocityY +=
                        particle.gravity *
                        0.35;


                    particle.rotation +=
                        particle.rotationSpeed;


                    const progress =
                        Math.min(
                            1,
                            particle.phaseTime /
                            particle.settleTime
                        );


                    /*
                     * Stretch → round.
                     */
                    const stretch =
                        1 +
                        (
                            3.5 *
                            (
                                1 -
                                easeOut(progress)
                            )
                        );


                    particle.scaleY =
                        stretch;


                    particle.scaleX =
                        0.45 +
                        (
                            0.55 *
                            easeOut(progress)
                        );


                    /*
                     * Finished settling.
                     */
                    if (
                        particle.phaseTime >=
                        particle.settleTime
                    ) {

                        particle.phase =
                            "linger";

                        particle.phaseTime =
                            0;


                        /*
                         * Completely stop.
                         */
                        particle.velocityX =
                            0;

                        particle.velocityY =
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
                     * Stay perfectly round.
                     */
                    particle.scaleX =
                        1;

                    particle.scaleY =
                        1;


                    /*
                     * After lingering,
                     * begin popping.
                     */
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
                     * Fast collapse.
                     */
                    const pop =
                        1 -
                        easeInOut(
                            progress
                        );


                    particle.scaleX =
                        pop;

                    particle.scaleY =
                        pop;


                    /*
                     * Fade only near the end.
                     */
                    if (
                        progress > 0.55
                    ) {

                        particle.opacity =
                            1 -
                            (
                                (
                                    progress -
                                    0.55
                                ) /
                                0.45
                            );
                    }


                    /*
                     * Remove particle.
                     */
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


                ctx.rotate(
                    particle.rotation
                );


                ctx.scale(
                    particle.scaleX,
                    particle.scaleY
                );


                /*
                 * CLEAN CIRCLE.
                 */
                ctx.beginPath();

                ctx.arc(
                    0,
                    0,
                    particle.size,
                    0,
                    Math.PI * 2
                );


                /*
                 * Red particle.
                 */
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
       MAIN ANIMATION LOOP
       ===================================================== */

    function animate(timestamp) {

        /*
         * Establish start time.
         */
        if (startTime === null) {

            startTime =
                timestamp;
        }


        const elapsed =
            timestamp -
            startTime;


        /* =================================================
           CLEAR CANVAS
           ================================================= */

        ctx.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );


        /* =================================================
           CREATE NEW PARTICLES
           ================================================= */

        if (
            elapsed >= TRAIL_START &&
            elapsed <= DURATION
        ) {

            const edgeY =
                getLoaderEdge();


            /*
             * Create particles.
             */
            for (
                let i = 0;
                i < PARTICLES_PER_FRAME;
                i++
            ) {

                if (
                    particles.length <
                    MAX_PARTICLES
                ) {

                    createParticle(
                        edgeY
                    );
                }
            }
        }


        /* =================================================
           UPDATE
           ================================================= */

        updateParticles();


        /* =================================================
           NEXT FRAME
           ================================================= */

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
