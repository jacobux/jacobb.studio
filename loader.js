/* =========================================================
   PAGE LOADER + PARTICLE TRAIL
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
       Particles begin appearing when the red loader
       starts sliding downward.
    */
    const TRAIL_START = 1250;

    /*
       Maximum number of particles alive at once.
    */
    const MAX_PARTICLES = 30;


    /* =====================================================
       STATE
       ===================================================== */

    let particles = [];
    let startTime = null;


    /* =====================================================
       CANVAS RESIZE
       ===================================================== */

    function resizeCanvas() {

        const dpr = window.devicePixelRatio || 1;

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

        return 1 - Math.pow(
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
           Random particle size.

           Most particles are small,
           with occasional larger pieces.
        */

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


            /* Size */

            size:
                size,


            /* Movement */

            velocityX:
                (Math.random() - 0.5) * 2.5,

            velocityY:
                Math.random() * 3.5 + 5.5,


            /* Curved movement */

            curve:
                (Math.random() - 0.5) * 0.18,

            curveVelocity:
                (Math.random() - 0.5) * 0.025,


            /* Physics */

            friction:
                0.965,

            gravity:
                Math.random() * 0.025 + 0.015,


            /* Animation */

            phase:
                "stretch",

            phaseTime:
                0,


            /*
               Very short stretch.

               The particle does NOT move during
               this phase.
            */

            stretchTime:
                Math.random() * 3 + 3,


            /*
               Short release.

               The particle becomes round before
               it starts moving.
            */

            releaseTime:
                Math.random() * 4 + 4,


            /*
               Travel duration.
            */

            travelTime:
                Math.random() * 12 + 15,


            /*
               Short settling phase.
            */

            settleTime:
                Math.random() * 6 + 6,


            /*
               Time spent lingering.
            */

            lingerTime:
                Math.random() * 18 + 28,


            /*
               Final pop duration.
            */

            popTime:
                7,


            /* Shape */

            scaleX:
                0.35,

            scaleY:
                3.8,


            /* Opacity */

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
       UPDATE PARTICLES
       ===================================================== */

    function updateParticles() {

        particles =
            particles.filter(function (particle) {


            /* =============================================
               PHASE 1 — STRETCH
               ============================================= */

            if (
                particle.phase ===
                "stretch"
            ) {

                particle.phaseTime++;


                /*
                   NO MOVEMENT HERE.

                   The particle stays attached to the
                   red edge while it stretches vertically.
                */

                particle.scaleX =
                    0.35;


                const progress =
                    Math.min(
                        1,
                        particle.phaseTime /
                        particle.stretchTime
                    );


                const eased =
                    easeOut(progress);


                /*
                   Start very stretched, then slightly
                   relax before release.
                */

                particle.scaleY =
                    3.8 -
                    (0.8 * eased);


                /*
                   Move to release phase.
                */

                if (
                    particle.phaseTime >=
                    particle.stretchTime
                ) {

                    particle.phase =
                        "release";

                    particle.phaseTime =
                        0;
                }
            }


            /* =============================================
               PHASE 2 — RELEASE
               ============================================= */

            else if (
                particle.phase ===
                "release"
            ) {

                particle.phaseTime++;


                /*
                   Still stationary.

                   The stretched shape contracts toward
                   a normal circle.
                */

                const progress =
                    Math.min(
                        1,
                        particle.phaseTime /
                        particle.releaseTime
                    );


                const eased =
                    easeOut(progress);


                particle.scaleY =
                    3 -
                    (2 * eased);


                particle.scaleX =
                    0.35 +
                    (0.65 * eased);


                /*
                   Only after the release finishes does
                   the particle begin travelling.
                */

                if (
                    particle.phaseTime >=
                    particle.releaseTime
                ) {

                    particle.phase =
                        "travel";

                    particle.phaseTime =
                        0;

                    particle.scaleX =
                        1;

                    particle.scaleY =
                        1;
                }
            }


            /* =============================================
               PHASE 3 — TRAVEL
               ============================================= */

            else if (
                particle.phase ===
                "travel"
            ) {

                particle.phaseTime++;


                /*
                   NOW movement begins.

                   The particle is already round.
                */

                particle.velocityX +=
                    particle.curve;

                particle.curve +=
                    particle.curveVelocity;


                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;


                /*
                   Inertia.
                */

                particle.velocityX *=
                    particle.friction;

                particle.velocityY *=
                    particle.friction;


                /*
                   Gravity.
                */

                particle.velocityY +=
                    particle.gravity;


                /*
                   Keep particle perfectly round.
                */

                particle.scaleX =
                    1;

                particle.scaleY =
                    1;


                /*
                   Transition to settling.
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


            /* =============================================
               PHASE 4 — SETTLE
               ============================================= */

            else if (
                particle.phase ===
                "settle"
            ) {

                particle.phaseTime++;


                /*
                   Continue momentum while slowing.
                */

                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;


                particle.velocityX *=
                    0.88;

                particle.velocityY *=
                    0.88;


                particle.velocityY +=
                    particle.gravity * 0.35;


                /*
                   Keep round.
                */

                particle.scaleX =
                    1;

                particle.scaleY =
                    1;


                /*
                   Stop completely.
                */

                if (
                    particle.phaseTime >=
                    particle.settleTime
                ) {

                    particle.phase =
                        "linger";

                    particle.phaseTime =
                        0;

                    particle.velocityX =
                        0;

                    particle.velocityY =
                        0;
                }
            }


            /* =============================================
               PHASE 5 — LINGER
               ============================================= */

            else if (
                particle.phase ===
                "linger"
            ) {

                particle.phaseTime++;


                /*
                   Completely stationary circle.
                */

                particle.scaleX =
                    1;

                particle.scaleY =
                    1;


                /*
                   Begin pop.
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


            /* =============================================
               PHASE 6 — POP
               ============================================= */

            else if (
                particle.phase ===
                "pop"
            ) {

                particle.phaseTime++;


                const progress =
                    Math.min(
                        1,
                        particle.phaseTime /
                        particle.popTime
                    );


                /*
                   Rapid shrink.
                */

                const pop =
                    1 -
                    easeInOut(progress);


                particle.scaleX =
                    pop;

                particle.scaleY =
                    pop;


                /*
                   Fade toward the end.
                */

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


                /*
                   Remove particle.
                */

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

               Stretch therefore remains perfectly
               vertical relative to the screen.
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
       MAIN ANIMATION LOOP
       ===================================================== */

    function animate(timestamp) {

        if (
            startTime ===
            null
        ) {

            startTime =
                timestamp;
        }


        const elapsed =
            timestamp -
            startTime;


        /*
           Clear previous frame.
        */

        ctx.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );


        /* =============================================
           CREATE PARTICLES
           ============================================= */

        if (
            elapsed >=
            TRAIL_START &&

            elapsed <=
            DURATION &&

            particles.length <
            MAX_PARTICLES
        ) {

            const edgeY =
                getLoaderEdge();


            /*
               One particle per frame.
            */

            createParticle(
                edgeY
            );
        }


        /* =============================================
           UPDATE + DRAW
           ============================================= */

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
