/* =========================================================
   PAGE LOADER + PARTICLE TRAIL
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
     * Fewer particles.
     */
    const PARTICLES_PER_FRAME = 4;

    /*
     * Maximum particles alive.
     */
    const MAX_PARTICLES = 250;


    let particles = [];
    let startTime = null;


    /* =====================================================
       CANVAS SIZE
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
       CREATE PARTICLE
       ===================================================== */

    function createParticle(edgeY) {

        if (
            edgeY < -20 ||
            edgeY > window.innerHeight + 20
        ) {
            return;
        }


        /* ---------------------------------------------
           RANDOM SIZE
           --------------------------------------------- */

        /*
         * Much wider size variation.
         *
         * Most particles will still be small,
         * but occasionally a larger piece appears.
         */
        const size =
            Math.random() < 0.75
                ? Math.random() * 2.5 + 1
                : Math.random() * 6 + 3;


        /* ---------------------------------------------
           RANDOM MOVEMENT
           --------------------------------------------- */

        /*
         * Strong downward inertia.
         *
         * This represents the momentum inherited
         * from the red loader moving downward.
         */
        const velocityY =
            Math.random() * 4 + 3;


        particles.push({

            x:
                Math.random() *
                window.innerWidth,

            y:
                edgeY,

            size:
                size,

            originalSize:
                size,

            velocityX:
                (Math.random() - 0.5) * 2.5,

            velocityY:
                velocityY,

            /*
             * How quickly the particle shrinks.
             */
            shrink:
                Math.random() * 0.12 + 0.08,

            /*
             * Lifetime.
             *
             * Smaller number = faster disappearance.
             */
            life:
                Math.random() * 12 + 10,

            maxLife:
                1,

            /*
             * Fully solid when created.
             */
            opacity: 1
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
       UPDATE + DRAW PARTICLES
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
                 * Slightly reduce downward velocity
                 * over time.
                 *
                 * This creates a subtle sense of
                 * momentum rather than constant speed.
                 */
                particle.velocityY *= 0.97;


                /* -----------------------------------------
                   SHRINK
                   ----------------------------------------- */

                particle.size -=
                    particle.shrink;


                /* -----------------------------------------
                   LIFE
                   ----------------------------------------- */

                particle.life -= 1;


                /*
                 * Keep particles completely solid
                 * for most of their life.
                 *
                 * Only fade during the final moments.
                 */
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
                    particle.life <= 0 ||
                    particle.opacity <= 0
                ) {
                    return false;
                }


                /* -----------------------------------------
                   DRAW
                   ----------------------------------------- */

                ctx.beginPath();

                ctx.arc(
                    particle.x,
                    particle.y,
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
           PARTICLE EMISSION
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
           UPDATE + DRAW
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
