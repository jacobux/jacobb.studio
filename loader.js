/* =========================================================
   PAGE LOADER + PARTICLE TRAIL
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
    const TRAIL_START = 1250;
    const MAX_PARTICLES = 30;

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

        let size;

        const random =
            Math.random();


        /*
           Smaller particles than the original.
        */

        if (random < 0.45) {

            size =
                Math.random() * 2 + 3;

        } else if (random < 0.80) {

            size =
                Math.random() * 3 + 5;

        } else if (random < 0.95) {

            size =
                Math.random() * 4 + 8;

        } else {

            size =
                Math.random() * 5 + 12;
        }


        particles.push({

            /* Position */

            x:
                Math.random() *
                window.innerWidth,

            y:
                edgeY,


            /* Movement */

            velocityX:
                0,

            velocityY:
                5 +
                Math.random() * 3,


            /*
               VERY subtle horizontal destination.
            */

            targetX:
                (Math.random() - 0.5) * 0.35,


            /*
               Very subtle curve.
            */

            curve:
                (Math.random() - 0.5) * 0.006,


            /*
               Slow natural deceleration.
            */

            friction:
                0.985,


            gravity:
                0.015 +
                Math.random() * 0.01,


            /* Timing */

            phase:
                "stretch",

            phaseTime:
                0,

            stretchTime:
                Math.random() * 5 + 6,

            trailTime:
                Math.random() * 18 + 35,

            popTime:
                8,


            /* Shape */

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

               Still attached to the red line.

               X stays locked.
               Y continues naturally.
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
                   No horizontal movement while attached.
                */

                particle.velocityX =
                    0;


                /*
                   Continue moving downward.
                */

                particle.y +=
                    particle.velocityY;


                /*
                   Gravity remains continuous.
                */

                particle.velocityY +=
                    particle.gravity;


                /*
                   Subtle vertical stretch.
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
                        1.8 *
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

               Continuous motion.

               No stopping.
               No velocity reset.
               ================================================= */

            else if (
                particle.phase ===
                "trail"
            ) {

                /*
                   Slowly introduce tiny X movement.
                */

                particle.velocityX +=
                    (
                        particle.targetX -
                        particle.velocityX
                    ) * 0.025;


                /*
                   Very subtle curve.
                */

                particle.velocityX +=
                    particle.curve;


                /*
                   Move using the SAME velocity.
                */

                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;


                /*
                   Gradually slow down.
                */

                particle.velocityX *=
                    particle.friction;

                particle.velocityY *=
                    particle.friction;


                /*
                   Gravity keeps the particle moving.
                */

                particle.velocityY +=
                    particle.gravity;


                /*
                   Smoothly return to round.
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
                    2.8 -
                    (
                        1.8 *
                        round
                    );


                /*
                   Move to the pop.

                   IMPORTANT:
                   We do NOT zero either velocity.
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

               Movement continues while the particle shrinks.
               ================================================= */

            else if (
                particle.phase ===
                "pop"
            ) {

                /*
                   KEEP MOVING.
                */

                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;


                /*
                   Continue slowing naturally.
                */

                particle.velocityX *=
                    0.98;

                particle.velocityY *=
                    0.98;


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


            /*
               Vertical stretch only.
            */

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
           Particles originate from the actual moving
           top edge of the red loader.
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
