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

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticle() {
        const rect = loader.getBoundingClientRect();

        particles.push({
            x: Math.random() * window.innerWidth,
            y: rect.bottom,
            size: Math.random() * 2.5 + 1,
            speedX: (Math.random() - 0.5) * 1.2,
            speedY: Math.random() * 1.5 + 0.5,
            life: 1,
            decay: Math.random() * 0.025 + 0.02
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rect = loader.getBoundingClientRect();

        // Create particles only while the red panel is sliding away
        if (
            rect.bottom > 0 &&
            rect.bottom < window.innerHeight
        ) {
            for (let i = 0; i < 2; i++) {
                createParticle();
            }
        }

        particles = particles.filter(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life -= particle.decay;

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

            ctx.fillStyle = `rgba(255, 255, 255, ${particle.life})`;
            ctx.fill();

            return true;
        });

        requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);

    animate();
}
