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

    /*
     * Above the red loader AND page content.
     */
    canvas.style.zIndex = "10000";

    document.body.appendChild(canvas);


    /* =====================================================
       SETTINGS
       ===================================================== */

    const DURATION = 2000;

    /*
     * Red loader begins moving down at 65%.
     *
     * 2000 × 0.65 = 1300ms
     */
    const TRAIL_START = 1300;

    /*
     * Number of particles generated per frame.
     */
    const PARTICLES_PER_FRAME = 10;

    /*
     * Maximum number of particles alive.
     */
    const MAX_PARTICLES = 700;


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

        /*
         * Don't create particles outside
         * the visible viewport.
         */
        if (
            edgeY < -20 ||
            edgeY > window.innerHeight + 20
        ) {
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
             * Start at the moving TOP edge
             * of the red loader.
             */
            y:
                edgeY,

            /*
             * Slightly larger particles
             * so the effect is easy to see.
             */
            size:
                Math.random() * 2.5 + 1.5,

            /*
             * Slight horizontal drift.
             */
            velocityX:
                (Math.random() - 0.5) * 1.8,

            /*
             * Drift DOWNWARD after being
             * left behind by the red panel.
             */
            velocityY:
                Math.random() * 1.5 + 0.5,

            /*
             * Fully visible initially.
             */
            opacity: 1,

            /*
             * Fade speed.
             */
            fade:
                Math.random() * 0.018 + 0.012
        });
    }


    /* =====================================================
       GET MOVING RED EDGE
       ===================================================== */

    function getLoaderEdge() {

        const rect =
            loader.getBoundingClientRect();

        /*
         * IMPORTANT:
         *
         * The red loader moves DOWNWARD.
         *
         * Therefore its TOP edge is the
         * visible moving boundary.
         */
        return rect.top;
    }


    /* =====================================================
       UPDATE + DRAW PARTICLES
       ===================================================== */

    function updateParticles() {

        particles = particles.filter(
            particle => {

                /*
                 * Move.
                 */
                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;


                /*
                 * Fade.
                 */
                particle.opacity -=
                    particle.fade;


                /*
                 * Remove dead particles.
                 */
                if (
                    particle.opacity <= 0 ||
                    particle.y >
                        window.innerHeight + 20
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
           CREATE PARTICLE TRAIL
           --------------------------------------------- */

        if (
            elapsed >= TRAIL_START &&
            elapsed <= DURATION
        ) {

            const edgeY =
                getLoaderEdge();


            /*
             * Emit particles directly from
             * the moving red edge.
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
