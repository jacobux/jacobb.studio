/* =========================================================
   PAGE LOADER + SUBTLE PARTICLE TRAIL
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
    const MAX_PARTICLES = 24;


    let particles = [];
    let startTime = null;


    /* =====================================================
       CANVAS
       ===================================================== */

    function resizeCanvas() {

        const dpr = window.devicePixelRatio || 1;

        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;

        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";

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

        const random = Math.random();

        let size;

        /*
           Smaller overall particle sizes.
        */

        if (random < 0.50) {

            size = Math.random() * 2.5 + 2.5;

        } else if (random < 0.82) {

            size = Math.random() * 3.5 + 4;

        } else if (random < 0.96) {

            size = Math.random() * 5 + 7;

        } else {

            size = Math.random() * 7 + 11;
        }


        particles.push({

            /* Position */

            x:
                Math.random() *
                window.innerWidth,

            y:
                edgeY,


            /* =================================================
               MOTION

               One continuous velocity is used for the entire
               lifetime of the particle.
               ================================================= */

            velocityX: 0,

            velocityY:
                4.5 +
                Math.random() * 2.5,


            /*
               Very subtle sideways destination.
            */

            targetX:
                (Math.random() - 0.5) * 0.65,


            /*
               Extremely subtle curve.
            */

            curve:
                (Math.random() - 0.5) * 0.012,


            gravity:
                0.018 +
                Math.random() * 0.012,


            friction:
                0.985,


            /* =================================================
               TIMING
               ================================================= */

            age: 0,

            stretchTime:
                7 +
                Math.random() * 4,

            releaseTime:
                10 +
                Math.random() * 6,

            lifeTime:
                65 +
                Math.random() * 25,

            popTime:
                9,


            released: false,

            opacity: 1,


            /* =================================================
               SHAPE
               ================================================= */

            scaleX: 0.65,

            scaleY: 1
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

            particle.age++;


            /* =================================================
               ATTACHED / STRETCHING

               Particle remains directly beneath the line.

               No X movement yet.
               ================================================= */

            if (!particle.released) {

                const stretchProgress =
                    Math.min(
                        1,
                        particle.age /
                        particle.stretchTime
                    );

                const stretch =
                    easeOut(stretchProgress);


                /*
                   Keep horizontal position completely locked
                   while the particle is attached.
                */

                particle.velocityX = 0;


                /*
                   Continuous vertical movement.

                   No artificial velocity reset.
                */

                particle.y +=
                    particle.velocityY;


                /*
                   Slight natural slowing as it stretches,
                   but without repeatedly multiplying the
                   velocity into oblivion.
                */

                particle.velocityY +=
                    particle.gravity;


                /*
                   Stretch only along Y.

                   Subtle rather than exaggerated.
                */

                particle.scaleX =
                    0.65 +
                    (0.35 * stretch);

                particle.scaleY =
                    1 +
                    (1.8 * stretch);


                /*
                   Once stretched, release it.
                */

                if (
                    particle.age >=
                    particle.stretchTime
                ) {

                    particle.released = true;
                }
            }


            /* =================================================
               RELEASED / FREE MOTION

               Same velocity continues from the stretch.

               X movement slowly emerges rather than suddenly
               jumping sideways.
               ================================================= */

            else {

                const releaseAge =
                    particle.age -
                    particle.stretchTime;


                const releaseProgress =
                    Math.min(
                        1,
                        releaseAge /
                        particle.releaseTime
                    );


                const release =
                    easeOut(releaseProgress);


                /*
                   Gradually introduce the very small X velocity.
                */

                particle.velocityX +=
                    (
                        particle.targetX -
                        particle.velocityX
                    ) * 0.055;


                /*
                   Tiny curvature.
                */

                particle.velocityX +=
                    particle.curve;


                /*
                   Continuous movement.
                */

                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;


                /*
                   Natural deceleration.

                   The particle slows down but NEVER stops.
                */

                particle.velocityX *=
                    particle.friction;

                particle.velocityY *=
                    particle.friction;


                /*
                   Gravity keeps the particle drifting
                   vertically even as momentum fades.
                */

                particle.velocityY +=
                    particle.gravity;


                /*
                   Return from stretched shape to a normal
                   round particle.
                */

                particle.scaleX =
                    1;

                particle.scaleY =
                    2.8 -
                    (
                        1.8 *
                        release
                    );


                /*
                   Keep a tiny amount of motion alive.

                   This prevents the particle from ever
                   looking frozen before the pop.
                */

                if (
                    Math.abs(particle.velocityX) <
                    0.015
                ) {

                    particle.velocityX +=
                        particle.curve;
                }

                if (
                    Math.abs(particle.velocityY) <
                    0.08
                ) {

                    particle.velocityY +=
                        0.08;
                }
            }


            /* =================================================
               POP

               Particle continues its motion while shrinking.
               ================================================= */

            if (
                particle.age >=
                particle.lifeTime
            ) {

                const popAge =
                    particle.age -
                    particle.lifeTime;

                const progress =
                    Math.min(
                        1,
                        popAge /
                        particle.popTime
                    );


                const pop =
                    1 -
                    easeInOut(progress);


                /*
                   Shrink instead of abruptly disappearing.
                */

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
               No rotation.

               Stretch remains vertically aligned.
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
           Start creating particles while the red loader
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
