/* =========================================================
   PAGE LOADER
   SPIRALLING / GRAINY PAINT PARTICLES
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
     * VERY FEW PARTICLES
     */
    const PARTICLES_PER_FRAME = 1;

    const MAX_PARTICLES = 38;


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
       CREATE GRAINY PARTICLE SHAPE
       ===================================================== */

    function createParticleShape(points) {

        const shape = [];

        for (
            let i = 0;
            i < points;
            i++
        ) {

            const angle =
                (
                    Math.PI * 2
                ) *
                (
                    i / points
                );


            /*
             * Random radius creates the
             * rough / grainy perimeter.
             */
            const variation =
                0.72 +
                Math.random() * 0.45;


            shape.push({

                angle:
                    angle,

                radius:
                    variation
            });
        }

        return shape;
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

        const r =
            Math.random();


        if (r < 0.45) {

            /*
             * Small
             */
            size =
                Math.random() * 4 + 4;

        } else if (r < 0.78) {

            /*
             * Medium
             */
            size =
                Math.random() * 7 + 7;

        } else if (r < 0.95) {

            /*
             * Large
             */
            size =
                Math.random() * 11 + 12;

        } else {

            /*
             * VERY LARGE
             */
            size =
                Math.random() * 15 + 24;
        }


        /* =================================================
           PARTICLE
           ================================================= */

        particles.push({

            x:
                Math.random() *
                window.innerWidth,

            y:
                edgeY,


            size:
                size,


            /* ---------------------------------------------
               GRAIN
               --------------------------------------------- */

            shape:
                createParticleShape(
                    Math.floor(
                        Math.random() * 4
                    ) + 9
                ),


            /* ---------------------------------------------
               MOVEMENT
               --------------------------------------------- */

            /*
             * Initial downward movement.
             */
            velocityX:
                (Math.random() - 0.5) *
                2.5,

            velocityY:
                Math.random() * 3.5 +
                5.5,


            /*
             * Curved / spiral force.
             */
            curve:
                (Math.random() - 0.5) *
                0.18,


            /*
             * Direction changes over time.
             */
            curveVelocity:
                (Math.random() - 0.5) *
                0.025,


            /*
             * Momentum retention.
             *
             * Higher = travels farther.
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


            /* ---------------------------------------------
               ROTATION
               --------------------------------------------- */

            rotation:
                Math.random() *
                Math.PI *
                2,

            rotationSpeed:
                (Math.random() - 0.5) *
                0.08,


            /* ---------------------------------------------
               PHASES
               --------------------------------------------- */

            phase:
                "travel",

            phaseTime:
                0,


            /*
             * Long travel.
             */
            travelTime:
                Math.random() * 12 +
                15,


            /*
             * Become round.
             */
            settleTime:
                Math.random() * 7 +
                7,


            /*
             * Stay suspended.
             */
            lingerTime:
                Math.random() * 25 +
                35,


            /*
             * Pop.
             */
            popTime:
                7,


            /* ---------------------------------------------
               SHAPE
               --------------------------------------------- */

            scaleX:
                0.45,

            scaleY:
                2.5,


            opacity:
                1
        });
    }


    /* =====================================================
       GET MOVING RED EDGE
       ===================================================== */

    function getLoaderEdge() {

        const rect =
            loader.getBoundingClientRect();

        return rect.top;
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
                   PHASE 1 — TRAVEL / SPIRAL
                   ================================================= */

                if (
                    particle.phase === "travel"
                ) {

                    /*
                     * ---------------------------------------------
                     * CURVED MOTION
                     * ---------------------------------------------
                     */

                    /*
                     * Change horizontal velocity
                     * based on the particle's curve.
                     */
                    particle.velocityX +=
                        particle.curve;


                    /*
                     * Slowly change the curve itself.
                     *
                     * This creates a subtle
                     * spiralling / wandering path.
                     */
                    particle.curve +=
                        particle.curveVelocity;


                    /*
                     * Move.
                     */
                    particle.x +=
                        particle.velocityX;

                    particle.y +=
                        particle.velocityY;


                    /*
                     * Momentum decay.
                     *
                     * MUCH slower than the previous
                     * version.
                     */
                    particle.velocityX *=
                        particle.friction;

                    particle.velocityY *=
                        particle.friction;


                    /*
                     * Small gravitational influence.
                     */
                    particle.velocityY +=
                        particle.gravity;


                    /*
                     * Rotate as it travels.
                     */
                    particle.rotation +=
                        particle.rotationSpeed;


                    /* ---------------------------------------------
                       STRETCH BASED ON SPEED
                       --------------------------------------------- */

                    const speed =
                        Math.sqrt(
                            particle.velocityX *
                            particle.velocityX +
                            particle.velocityY *
                            particle.velocityY
                        );


                    /*
                     * Fast = stretched.
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
                            (
                                speed *
                                0.055
                            )
                        );


                    /*
                     * End travel.
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
                     * Continue moving.
                     */
                    particle.x +=
                        particle.velocityX;

                    particle.y +=
                        particle.velocityY;


                    /*
                     * Continue losing momentum.
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
                     * Long → round.
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


                    if (
                        particle.phaseTime >=
                        particle.settleTime
                    ) {

                        particle.phase =
                            "linger";

                        particle.phaseTime =
                            0;


                        /*
                         * Stop it completely.
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
                     * Completely suspended.
                     */
                    particle.scaleX =
                        1;

                    particle.scaleY =
                        1;


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
                     * Slightly irregular fade.
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
                 * DRAW IRREGULAR / GRAINY EDGE
                 */
                ctx.beginPath();


                particle.shape.forEach(
                    (point, index) => {

                        const x =
                            Math.cos(
                                point.angle
                            ) *
                            particle.size *
                            point.radius;

                        const y =
                            Math.sin(
                                point.angle
                            ) *
                            particle.size *
                            point.radius;


                        if (index === 0) {

                            ctx.moveTo(
                                x,
                                y
                            );

                        } else {

                            ctx.lineTo(
                                x,
                                y
                            );
                        }
                    }
                );


                ctx.closePath();


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

                    createParticle(
                        edgeY
                    );
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
