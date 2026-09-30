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


        if (random < 0.45) {

            size =
                Math.random() * 4 + 4;

        } else if (random < 0.78) {

            size =
                Math.random() * 7 + 7;

        } else if (random < 0.95) {

            size =
                Math.random() * 11 + 12;

        } else {

            size =
                Math.random() * 15 + 24;
        }


        particles.push({

            /* Position */

            x:
                Math.random() *
                window.innerWidth,

            y:
                edgeY,


            size:
                size,


            /* =============================================
               CONTINUOUS MOTION
               ============================================= */

            velocityX:
                0,

            velocityY:
                5.5 +
                Math.random() * 3.5,


            /* Curve */

            curve:
                (Math.random() - 0.5) * 0.18,

            curveVelocity:
                (Math.random() - 0.5) * 0.025,


            /* Physics */

            friction:
                0.965,

            gravity:
                Math.random() * 0.025 +
                0.015,


            /* =============================================
               TIMING
               ============================================= */

            phase:
                "stretch",

            phaseTime:
                0,

            stretchTime:
                Math.random() * 5 + 6,

            trailTime:
                Math.random() * 16 + 24,

            lingerTime:
                Math.random() * 18 + 28,

            popTime:
                7,


            /* Shape */

            scaleX:
                0.45,

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

        return loader.getBoundingClientRect().top;
    }


    /* =====================================================
       UPDATE PARTICLES
       ===================================================== */

    function updateParticles() {

        particles =
            particles.filter(function (particle) {

            particle.phaseTime++;


            /* =============================================
               STRETCH / BREAK AWAY
               ============================================= */

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
                   The particle moves vertically using
                   its actual velocity.

                   X remains locked while attached.
                */

                particle.velocityX =
                    0;


                /*
                   Gradually reduce downward velocity
                   as the particle stretches.

                   This creates a smooth "pulling away"
                   rather than a fixed-speed movement.
                */

                const stretchDrag =
                    1 -
                    (
                        eased *
                        0.55
                    );


                particle.velocityY *=
                    stretchDrag;


                particle.velocityY +=
                    particle.gravity *
                    0.15;


                particle.y +=
                    particle.velocityY;


                /*
                   Vertical stretch.
                */

                particle.scaleX =
                    0.45 +
                    (0.55 * eased);


                particle.scaleY =
                    1 +
                    (3.5 * eased);


                /*
                   Once the stretch reaches its end,
                   the particle naturally breaks away.
                */

                if (
                    particle.phaseTime >=
                    particle.stretchTime
                ) {

                    particle.phase =
                        "trail";

                    particle.phaseTime =
                        0;


                    /*
                       Give it sideways momentum,
                       but preserve the Y velocity it
                       already has.

                       This prevents a mechanical jump.
                    */

                    particle.velocityX =
                        (
                            Math.random() -
                            0.5
                        ) * 2.5;


                    particle.scaleX =
                        1;

                    particle.scaleY =
                        1;
                }
            }


            /* =============================================
               TRAIL
               ============================================= */

            else if (
                particle.phase ===
                "trail"
            ) {

                /*
                   Curve develops gradually.
                */

                particle.velocityX +=
                    particle.curve;

                particle.curve +=
                    particle.curveVelocity;


                /*
                   Continue the existing velocity.
                */

                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;


                /*
                   Friction gradually removes momentum.
                */

                particle.velocityX *=
                    particle.friction;

                particle.velocityY *=
                    particle.friction;


                /*
                   Gravity continues naturally.
                */

                particle.velocityY +=
                    particle.gravity;


                /*
                   The particle becomes round as it
                   separates from the stretched state.
                */

                const progress =
                    Math.min(
                        1,
                        particle.phaseTime / 8
                    );


                const eased =
                    easeOut(progress);


                particle.scaleX =
                    1;

                particle.scaleY =
                    1;


                /*
                   End the active movement naturally.
                */

                if (
                    particle.phaseTime >=
                    particle.trailTime
                ) {

                    particle.phase =
                        "linger";

                    particle.phaseTime =
                        0;

                    /*
                       Only now does the particle
                       become stationary.
                    */

                    particle.velocityX =
                        0;

                    particle.velocityY =
                        0;
                }
            }


            /* =============================================
               LINGER
               ============================================= */

            else if (
                particle.phase ===
                "linger"
            ) {

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


            /* =============================================
               POP
               ============================================= */

            else if (
                particle.phase ===
                "pop"
            ) {

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


                if (
                    progress >
                    0.55
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


            /* =============================================
               DRAW
               ============================================= */

            ctx.save();


            ctx.translate(
                particle.x,
                particle.y
            );


            /*
               No rotation.

               Stretch always stays aligned to
               the vertical screen axis.
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


        if (
            elapsed >=
            TRAIL_START &&

            elapsed <=
            DURATION &&

            particles.length <
            MAX_PARTICLES
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
