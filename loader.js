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
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";

    /*
     * Above the red loader so the particles
     * can be seen as they leave its edge.
     */
    canvas.style.zIndex = "10000";

    document.body.appendChild(canvas);


    /* =====================================================
       SETTINGS
       ===================================================== */

    const DURATION = 2000;

    /*
     * Red starts sliding away at 65% of
     * the 2 second animation.
     *
     * 2000 × 0.65 = 1300ms
     */
    const TRAIL_START = 1300;

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

        particles.push({

            /*
             * Random horizontal position
             * across the moving red edge.
             */
            x:
                Math.random() *
                window.innerWidth,

            /*
             * Start exactly at the
             * bottom of the red panel.
             */
            y: edgeY,

            /*
             * Small particles.
             */
            size:
                Math.random() * 3 + 1,

            /*
             * Slight horizontal drift.
             */
            velocityX:
                (Math.random() - 0.5) * 1.8,

            /*
             * Particles fall away
             * from the red edge.
             */
            velocityY:
                Math.random() * 2 + 0.5,

            /*
             * Fully visible initially.
             */
            opacity: 1,

            /*
             * Random fade speed.
             */
            fade:
                Math.random() * 0.025 + 0.015
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
           PARTICLE TRAIL
           --------------------------------------------- */

        if (
            elapsed >= TRAIL_START &&
            elapsed <= DURATION
        ) {

            /*
             * Progress through the slide-out.
             *
             * 0 = starts sliding
             * 1 = completely off screen
             */
            const progress =
                (elapsed - TRAIL_START) /
                (DURATION - TRAIL_START);


            /*
             * This is the bottom edge of
             * the red panel.
             *
             * At the beginning of the slide
             * it is at the bottom of the screen.
             *
             * It then travels downward.
             */
            const edgeY =
                window.innerHeight +
                (
                    progress *
                    window.innerHeight
                );


            /*
             * Emit several particles
             * every frame.
             */
            for (let i = 0; i < 6; i++) {

                createParticle(edgeY);
            }
        }


        /* ---------------------------------------------
           UPDATE + DRAW PARTICLES
           --------------------------------------------- */

        particles = particles.filter(
            particle => {

                particle.x +=
                    particle.velocityX;

                particle.y +=
                    particle.velocityY;

                particle.opacity -=
                    particle.fade;


                /*
                 * Remove dead particles.
                 */
                if (particle.opacity <= 0) {
                    return false;
                }


                /* -------------------------------------
                   DRAW PARTICLE
                   ------------------------------------- */

                ctx.beginPath();

                ctx.arc(
                    particle.x,
                    particle.y,
                    particle.size,
                    0,
                    Math.PI * 2
                );

                /*
                 * White particles against
                 * the red loader.
                 */
                ctx.fillStyle =
                    `rgba(
                        255,
                        255,
                        255,
                        ${particle.opacity}
                    )`;

                ctx.fill();

                return true;
            }
        );


        /* ---------------------------------------------
           CONTINUE ANIMATION
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
