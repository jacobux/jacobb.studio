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

    /*
     * The red loader begins moving downward at 65%.
     *
     * 2000ms × 0.65 = 1300ms
     */
    const TRAIL_START = 1300;

    /*
     * Number of particles generated per frame.
     */
    const PARTICLES_PER_FRAME = 8;

    /*
     * Maximum number of particles
     * allowed to exist at once.
     */
    const MAX_PARTICLES = 500;


    let particles = [];
    let startTime = null;


    /* =====================================================
       CANVAS SIZE
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
       CREATE PARTICLE
       ===================================================== */

    function createParticle(edgeY) {

        /*
         * Only create particles while the red edge
         * is actually inside the viewport.
         */
        if (edgeY < 0 || edgeY > window.innerHeight) {
            return;
        }

        particles.push({

            /*
             * Random horizontal position.
             */
            x:
                Math.random() *
                window.innerWidth,

            /*
             * Start directly on the red edge.
             */
            y:
                edgeY,

            /*
             * Small random particle size.
             */
            size:
                Math.random() * 2.5 + 1,

            /*
             * Slight horizontal movement.
             */
            velocityX:
                (Math.random() - 0.5) * 1.5,

            /*
             * Particles drift downward
             * after being released.
             */
            velocityY:
                Math.random() * 1.5 + 0.5,

            /*
             * Initial opacity.
             */
            opacity: 1,

            /*
             * Random fade speed.
             */
            fade:
                Math.random() * 0.018 + 0.012
        });
    }


    /* =====================================================
       GET LOADER EDGE
       ===================================================== */

    function getLoaderEdge() {

        /*
         * Get the loader's actual position
         * on screen.
         */
        const rect = loader.getBoundingClientRect();

        /*
         * rect.bottom is the actual bottom edge
         * of the red loader.
         */
        return rect.bottom;
    }


    /* =====================================================
       DRAW PARTICLES
       ===================================================== */

    function drawParticles() {

        particles = particles.filter(
            particle => {

                /*
                 * Move particle.
                 */
                particle.x += particle.velocityX;
                particle.y += particle.velocityY;

                /*
                 * Fade particle.
                 */
                particle.opacity -= particle.fade;


                /*
                 * Remove particles that
                 * have completely faded.
                 */
                if (
                    particle.opacity <= 0 ||
                    particle.y > window.innerHeight + 20
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
                    `rgba(255, 255, 255, ${particle.opacity})`;

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
           CLEAR CANVAS
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

            /*
             * Get the ACTUAL current bottom edge
             * of the red loader.
             */
            const edgeY =
                getLoaderEdge();


            /*
             * Create particles at the edge.
             */
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

        drawParticles();


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
