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
     * FEWER PARTICLES
     */
    const PARTICLES_PER_FRAME = 2;

    const MAX_PARTICLES = 120;


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
         * Mostly medium particles.
         *
         * Occasionally create a VERY large
         * chunk to make the effect irregular.
         */

        let size;

        const randomSize =
            Math.random();

        if (randomSize < 0.55) {

            /*
             * Small/medium
             */
            size =
                Math.random() * 4 + 3;

        } else if (randomSize < 0.85) {

            /*
             * Medium/large
             */
            size =
                Math.random() * 7 + 6;

        } else {

            /*
             * BIG CHUNK
             */
            size =
                Math.random() * 12 + 10;
        }


        /* ---------------------------------------------
           CREATE
           --------------------------------------------- */

        particles.push({

            /*
             * Start directly against
             * the moving red edge.
             */
            x:
                Math.random() *
                window.innerWidth,

            y:
                edgeY,


            /* -----------------------------------------
               SIZE
               ----------------------------------------- */

            size:
                size,

            originalSize:
                size,


            /* -----------------------------------------
               INITIAL MOMENTUM
               ----------------------------------------- */

            /*
             * Strong downward velocity inherited
             * from the moving red loader.
             */
            velocityY:
                Math.random() * 4 + 5,

            /*
             * Very small horizontal movement.
             */
            velocityX:
                (Math.random() - 0.5) * 2,


            /* -----------------------------------------
               PHYSICS
               ----------------------------------------- */

            /*
             * Strong drag means the particle
             * rapidly loses its initial velocity.
             */
            drag:
                0.84,


            /*
             * Tiny amount of gravity after
             * the initial momentum is gone.
             */
            gravity:
                Math.random() * 0.025 + 0.01,


            /* -----------------------------------------
               LIFETIME
               ----------------------------------------- */

            /*
             * Longer linger time.
             */
            life:
                Math.random() * 18 + 22,

            maxLife:
                1,


            /* -----------------------------------------
               APPEARANCE
               ----------------------------------------- */

            /*
             * Completely solid at birth.
             */
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
       UPDATE + DRAW
       ===================================================== */

    function updateParticles() {

        particles = particles.filter(
            particle => {


                /* -----------------------------------------
                   INITIAL MOMENTUM
                   ----------------------------------------- */

                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;


                /*
                 * Strong drag.
                 *
                 * This makes the particle move quickly
                 * at first, then slow dramatically.
                 */
                particle.velocityY *=
                    particle.drag;


                /*
                 * Horizontal movement also slows.
                 */
                particle.velocityX *=
                    0.96;


                /*
                 * Tiny gravitational pull.
                 */
                particle.velocityY +=
                    particle.gravity;


                /* -----------------------------------------
                   LIFE
                   ----------------------------------------- */

                particle.life -= 1;


                /* -----------------------------------------
                   POP / SHRINK
                   ----------------------------------------- */

                /*
                 * For most of its life the particle
                 * remains full-sized and solid.
                 *
                 * Near the end it rapidly shrinks.
                 */

                const lifeRatio =
                    particle.life /
                    (particle.maxLife + 39);


                if (
                    particle.life < 7
                ) {

                    /*
                     * Very fast final shrink.
                     */
                    particle.size *=
                        0.72;


                    /*
                     * Almost instant final fade.
                     */
                    particle.opacity =
                        particle.life / 7;
                }


                /* -----------------------------------------
                   REMOVE
                   ----------------------------------------- */

                if (
                    particle.size <= 0.5 ||
                    particle.life <= 0 ||
                    particle.opacity <= 0
                ) {
                    return false;
                }


                /* -----------------------------------------
                   DRAW
                   ----------------------------------------- */

                ctx.beginPath();


                /*
                 * Stretch particles when they're
                 * moving quickly.
                 *
                 * As they slow down they become
                 * round again.
                 */

                const speed =
                    Math.abs(
                        particle.velocityY
                    );

                const stretch =
                    Math.min(
                        2.2,
                        1 +
                        speed * 0.12
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


                /*
                 * Solid #FF1609.
                 */
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
           EMIT PARTICLES
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
