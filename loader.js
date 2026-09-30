/* =========================================================
   PAGE LOADER + PARTICLE TRAIL
   Based on the working loader-edge version
   ========================================================= */

const loader = document.querySelector(".page-loader");

if (!loader) {

    console.warn("No .page-loader found.");

} else {

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
    const TRAIL_START = 1300;

    const MAX_PARTICLES = 26;


    let particles = [];
    let startTime = null;


    /* =====================================================
       CANVAS
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

        const random =
            Math.random();

        let size;


        /*
           Smaller particles overall.
        */

        if (random < 0.50) {

            size =
                Math.random() * 2.5 + 2.5;

        } else if (random < 0.82) {

            size =
                Math.random() * 3 + 4;

        } else if (random < 0.96) {

            size =
                Math.random() * 4 + 7;

        } else {

            size =
                Math.random() * 5 + 10;
        }


        particles.push({

            /* Position */

            x:
                Math.random() *
                window.innerWidth,

            y:
                edgeY,


            /* =================================================
               MOVEMENT
               ================================================= */

            velocityX: 0,

            velocityY:
                4.5 +
                Math.random() * 2.5,


            /*
               Very small sideways movement.

               This is intentionally much lower than before.
            */

            targetX:
                (Math.random() - 0.5) * 0.45,


            curve:
                (Math.random() - 0.5) * 0.008,


            friction:
                0.975,


            gravity:
                0.012 +
                Math.random() * 0.01,


            /* =================================================
               TIMING
               ================================================= */

            phase:
                "stretch",

            phaseTime:
                0,


            stretchTime:
                6 +
                Math.random() * 4,


            trailTime:
                45 +
                Math.random() * 20,


            popTime:
                9,


            /* =================================================
               SHAPE
               ================================================= */

            scaleX:
                0.55,

            scaleY:
                1,


            opacity:
                1
        });
    }


    /* =====================================================
       LOADER EDGE
       ===================================================== */

    function getLoaderEdge() {

        return loader
            .getBoundingClientRect()
            .top;
    }


    /* =====================================================
       UPDATE PARTICLES
       ===================================================== */

    function updateParticles() {

        particles =
            particles.filter(function (particle) {

            particle.phaseTime++;


            /* =================================================
               STRETCH

               Particle is still attached to the red edge.

               It moves ONLY vertically here.
               ================================================= */

            if (
                particle.phase ===
                "stretch"
            ) {

                const progress =
                    Math.min(
                        1,
                        particle.phaseTime /
                        particle.stretchTime
                    );


                const eased =
                    easeOut(progress);


                /*
                   Keep X completely locked.
                */

                particle.velocityX =
                    0;


                /*
                   Continuous vertical movement.

                   No velocity reset.
                */

                particle.y +=
                    particle.velocityY;


                /*
                   Gravity continues naturally.
                */

                particle.velocityY +=
                    particle.gravity;


                /*
                   SUBTLE vertical stretch.

                   Much less exaggerated than before.
                */

                particle.scaleX =
                    0.55 +
                    (
                        0.45 *
                        eased
                    );

                particle.scaleY =
                    1 +
                    (
                        1.7 *
                        eased
                    );


                /*
                   Break away.
                */

                if (
                    particle.phaseTime >=
                    particle.stretchTime
                ) {

                    particle.phase =
                        "trail";

                    particle.phaseTime =
                        0;
                }
            }


            /* =================================================
               TRAIL

               This is the important part:

               The particle NEVER stops.

               It gradually loses momentum while continuing
               to drift until it reaches the pop.
               ================================================= */

            else if (
                particle.phase ===
                "trail"
            ) {

                /*
                   Slowly introduce sideways movement.

                   This prevents the sudden horizontal jump
                   that caused the previous mechanical motion.
                */

                particle.velocityX +=
                    (
                        particle.targetX -
                        particle.velocityX
                    ) * 0.035;


                /*
                   Very subtle curve.
                */

                particle.velocityX +=
                    particle.curve;


                /*
                   CONTINUOUS movement.
                */

                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;


                /*
                   Gradually slow the particle.

                   It keeps moving because gravity continues
                   acting on the Y velocity.
                */

                particle.velocityX *=
                    particle.friction;

                particle.velocityY *=
                    particle.friction;


                particle.velocityY +=
                    particle.gravity;


                /*
                   Return smoothly from stretched shape.
                */

                const roundProgress =
                    Math.min(
                        1,
                        particle.phaseTime / 12
                    );


                const round =
                    easeOut(roundProgress);


                particle.scaleX =
                    1;

                particle.scaleY =
                    2.7 -
                    (
                        1.7 *
                        round
                    );


                /*
                   IMPORTANT:

                   No velocity is ever set to zero.

                   Even if momentum gets very small,
                   gravity keeps the particle drifting.
                */


                /*
                   Move to pop once its trail has naturally
                   run long enough.
                */

                if (
                    particle.phaseTime >=
                    particle.trailTime
                ) {

                    particle.phase =
                        "pop";

                    particle.phaseTime =
                        0;
                }
            }


            /* =================================================
               POP

               Particle keeps moving while disappearing.
               ================================================= */

            else if (
                particle.phase ===
                "pop"
            ) {

                /*
                   Continue the exact same motion.
                */

                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;


                /*
                   Continue slowing while it pops.
                */

                particle.velocityX *=
                    0.97;

                particle.velocityY *=
                    0.97;

                particle.velocityY +=
                    particle.gravity;


                const progress =
                    Math.min(
                        1,
                        particle.phaseTime /
                        particle.popTime
                    );


                const pop =
                    1 -
                    easeInOut(progress);


                particle.scaleX =
                    pop;

                particle.scaleY =
                    pop;


                particle.opacity =
                    1 -
                    progress;


                if (
                    progress >=
                    1
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


        ctx.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );


        /*
           Create particles from the ACTUAL moving edge
           of the red loader.
        */

        if (
            elapsed >= TRAIL_START &&
            elapsed <= DURATION &&
            particles.length < MAX_PARTICLES
        ) {

            createParticle(
                getLoaderEdge()
            );
        }


        updateParticles();


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
