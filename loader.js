/* =========================================================
   PAGE LOADER + DRIPPING PARTICLE TRAIL
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

    const TRAIL_START = 1300;

    /*
     * Fewer, more substantial particles.
     */
    const PARTICLES_PER_FRAME = 3;

    const MAX_PARTICLES = 180;


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
            edgeY < -30 ||
            edgeY > window.innerHeight + 30
        ) {
            return;
        }


        /* ---------------------------------------------
           SIZE
           --------------------------------------------- */

        /*
         * Mostly medium/large particles,
         * with occasional large chunks.
         */
        let size;

        const randomSize =
            Math.random();

        if (randomSize < 0.65) {

            size =
                Math.random() * 4 + 3;

        } else if (randomSize < 0.9) {

            size =
                Math.random() * 6 + 5;

        } else {

            size =
                Math.random() * 9 + 8;
        }


        /* ---------------------------------------------
           PARTICLE
           --------------------------------------------- */

        particles.push({

            /*
             * Start directly on the red edge.
             */
            x:
                Math.random() *
                window.innerWidth,

            y:
                edgeY,

            /*
             * Base size.
             */
            size:
                size,

            originalSize:
                size,

            /*
             * Small sideways movement.
             */
            velocityX:
                (Math.random() - 0.5) * 2,

            /*
             * Strong downward impulse.
             */
            velocityY:
                Math.random() * 3.5 + 4,

            /*
             * Gradual loss of momentum.
             */
            gravity:
                Math.random() * 0.04 + 0.015,

            /*
             * How quickly the particle
             * contracts.
             */
            shrink:
                Math.random() * 0.16 + 0.10,

            /*
             * Short lifetime.
             */
            life:
                Math.random() * 12 + 12,

            /*
             * Start completely solid.
             */
            opacity: 1
        });
    }


    /* =====================================================
       GET MOVING EDGE
       ===================================================== */

    function getLoaderEdge() {

        const rect =
            loader.getBoundingClientRect();

        /*
         * TOP edge is the edge moving
         * downward across the page.
         */
        return rect.top;
    }


    /* =====================================================
       UPDATE + DRAW
       ===================================================== */

    function updateParticles() {

        particles = particles.filter(
            particle => {

                /* -----------------------------------------
                   MOVEMENT
                   ----------------------------------------- */

                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;


                /*
                 * Gravity / momentum.
                 */
                particle.velocityY +=
                    particle.gravity;


                /*
                 * Slight horizontal drag.
                 */
                particle.velocityX *=
                    0.99;


                /* -----------------------------------------
                   SHRINK
                   ----------------------------------------- */

                particle.size -=
                    particle.shrink;


                /* -----------------------------------------
                   FINAL FADE
                   ----------------------------------------- */

                particle.life -= 1;

                if (
                    particle.life < 3
                ) {

                    particle.opacity =
                        particle.life / 3;
                }


                /* -----------------------------------------
                   REMOVE
                   ----------------------------------------- */

                if (
                    particle.size <= 0 ||
                    particle.life <= 0
                ) {
                    return false;
                }


                /* -----------------------------------------
                   DRAW
                   ----------------------------------------- */

                ctx.beginPath();

                /*
                 * Slight vertical stretching while
                 * the particle is moving quickly.
                 */
                const stretch =
                    Math.min(
                        1.8,
                        1 +
                        particle.velocityY * 0.08
                    );

                ctx.ellipse(
                    particle.x,
                    particle.y,
                    particle.size,
                    particle.size * stretch,
                    0,
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

                return true;
            }
        );
    }


    /* =====================================================
       ANIMATION
       ===================================================== */

    function animate(timestamp) {

        if (startTime === null) {
            startTime = timestamp;
        }

        const elapsed =
            timestamp - startTime;


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


            for (
                let i = 0;
                i < PARTICLES_PER_FRAME;
                i++
            ) {

                if (
                    particles.length <
                    MAX_PARTICLES
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

        requestAnimationFrame(animate);
    }


    /* =====================================================
       START
       ===================================================== */

    resizeCanvas();

    window.addEventListener(
        "resize",
        resizeCanvas
    );

    requestAnimationFrame(animate);
}
