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
        return 1 - Math.pow(1 - t, 3);
    }

    function easeInOut(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }


    /* =====================================================
       CREATE PARTICLE
       ===================================================== */

    function createParticle(edgeY) {

        let size;

        const random = Math.random();

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

            x:
                Math.random() *
                window.innerWidth,

            y:
                edgeY,

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
                "travel",

            phaseTime:
                0,

            travelTime:
                Math.random() * 12 + 15,

            lingerTime:
                Math.random() * 18 + 28,

            popTime:
                7,


            /* Shape */

            scaleX:
                0.45,

            scaleY:
                2.5,


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
               MOVEMENT + STRETCH
               ============================================= */

            if (
                particle.phase ===
                "travel"
            ) {

                /*
                   The particle moves immediately.

                   This is intentionally NOT separated
                   into a stationary stretch phase.
                */

                particle.velocityX +=
                    particle.curve;

                particle.curve +=
                    particle.curveVelocity;


                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;


                /* Inertia */

                particle.velocityX *=
                    particle.friction;

                particle.velocityY *=
                    particle.friction;


                /* Gravity */

                particle.velocityY +=
                    particle.gravity;


                /*
                   Calculate movement speed.

                   This controls how stretched the
                   particle appears.
                */

                const speed =
                    Math.sqrt(
                        particle.velocityX *
                        particle.velocityX +

                        particle.velocityY *
                        particle.velocityY
                    );


                /*
                   STRETCH

                   The particle starts elongated and
                   naturally becomes round as its motion
                   settles.

                   It is ALWAYS vertically aligned.
                */

                const stretch =
                    Math.min(
                        4.5,
                        1 + speed * 0.42
                    );


                particle.scaleY =
                    stretch;


                particle.scaleX =
                    Math.max(
                        0.32,
                        1 - speed * 0.055
                    );


                /*
                   After the initial burst of movement,
                   smoothly transition into the lingering
                   phase.
                */

                if (
                    particle.phaseTime >=
                    particle.travelTime
                ) {

                    particle.phase =
                        "linger";

                    particle.phaseTime =
                        0;

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
               IMPORTANT:

               No rotation.

               The particle's movement can curve,
               but its stretched shape stays vertically
               aligned with the screen.
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
            startTime = timestamp;
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
           Create particles while the red loader
           is sliding away.
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
