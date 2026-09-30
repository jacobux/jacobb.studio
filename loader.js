const loader = document.querySelector(".page-loader");

if (!loader) {
    console.warn("Page loader not found.");
} else {

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "10000";

    document.body.appendChild(canvas);

    let particles = [];

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;

        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;

        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function addParticle(x, y) {
        particles.push({
            x: x,
            y: y,

            size: Math.random() * 3 + 1,

            velocityX: (Math.random() - 0.5) * 2,
            velocityY: Math.random() * 2 + 0.5,

            life: 1,

            fade: Math.random() * 0.025 + 0.02
        });
    }

    function animate() {

        ctx.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );

        const rect = loader.getBoundingClientRect();

        /*
         * The particles are created along the
         * bottom edge of the red panel.
         */
        if (
            rect.bottom > 0 &&
            rect.bottom < window.innerHeight + 50
        ) {

            for (let i = 0; i < 5; i++) {

                addParticle(
                    Math.random() * window.innerWidth,
                    rect.bottom
                );

            }
        }

        particles = particles.filter(particle => {

            particle.x += particle.velocityX;
            particle.y += particle.velocityY;

            particle.life -= particle.fade;

            if (particle.life <= 0) {
                return false;
            }

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(255,255,255,${particle.life})`;

            ctx.fill();

            return true;
        });

        requestAnimationFrame(animate);
    }

    resizeCanvas();

    window.addEventListener(
        "resize",
        resizeCanvas
    );

    animate();
}
