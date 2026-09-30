const loader = document.querySelector(".page-loader");

let particles = [];
let lastTime = 0;

function createParticle() {
    const rect = loader.getBoundingClientRect();

    particles.push({
        x: Math.random() * window.innerWidth,
        y: rect.bottom,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: Math.random() * 1.5 + 0.5,
        life: 1,
        decay: Math.random() * 0.025 + 0.015
    });
}

function animate(time) {
    const delta = time - lastTime;
    lastTime = time;

    // Only create particles while the red panel is moving
    const rect = loader.getBoundingClientRect();

    if (rect.bottom > 0 && rect.bottom < window.innerHeight) {
        for (let i = 0; i < 3; i++) {
            createParticle();
        }
    }

    particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= particle.decay;

        if (particle.life <= 0) {
            particles.splice(index, 1);
            return;
        }

        const element = document.createElement("div");

        element.className = "loader-particle";

        element.style.left = `${particle.x}px`;
        element.style.top = `${particle.y}px`;
        element.style.width = `${particle.size}px`;
        element.style.height = `${particle.size}px`;
        element.style.opacity = particle.life;

        document.body.appendChild(element);

        setTimeout(() => {
            element.remove();
        }, 50);
    });

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
