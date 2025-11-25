const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const balls = [];
const g = 9.8 * 40;
const dt = 0.016;

let collisionCount = 0;  // <--- Kollisionen


// BALL SPAWN
function spawnBall() {
    balls.push({
        x: Math.random() * 300,
        y: Math.random() * 50,
        r: Math.random() * 30 + 10,
        vx: (Math.random() - 0.5) * 200,
        vy: 0,
        handled: new Set()
    });
}



// ===============================
//      ARROW DRAWING
// ===============================

function drawArrow(x, y, vx, vy) {
    const speed = Math.hypot(vx, vy);
    if (speed < 20) return;

    const len = speed * 0.05;

    const nx = vx / speed;
    const ny = vy / speed;

    const endX = x + nx * len;
    const endY = y + ny * len;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    const head = 6;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - nx * head - ny * head * 0.5,
        endY - ny * head + nx * head * 0.5
    );
    ctx.lineTo(
        endX - nx * head + ny * head * 0.5,
        endY - ny * head - nx * head * 0.5
    );
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
}



// ===============================
//           MAIN LOOP
// ===============================

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Anzeige der Kollisionen
    ctx.fillStyle = "black";
    ctx.font = "20px system-ui";
    ctx.fillText("Collisions: " + collisionCount, 10, 30);

    // 1. Bewegung
    for (let b of balls) {
        b.vy += g * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        if (b.x - b.r < 0) {
            b.x = b.r;
            b.vx *= -0.8;
        }
        if (b.x + b.r > canvas.width) {
            b.x = canvas.width - b.r;
            b.vx *= -0.8;
        }

        if (b.y + b.r > canvas.height) {
            b.y = canvas.height - b.r;
            b.vy *= -0.5;
            b.vx *= 0.99;
        }

        if (b.y - b.r < 0) {
            b.y = b.r;
            b.vy *= -0.8;
        }
    }

    // 2. Kollisionen
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            resolveBallCollision(balls[i], balls[j]);
        }
    }

    // 3. Zeichnen
    for (let b of balls) {

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();

        drawArrow(b.x, b.y, b.vx, b.vy);

        b.handled.clear();
    }

    requestAnimationFrame(update);
}

update();



// ===============================
//      BALL-KOLLISIONEN
// ===============================

function resolveBallCollision(a, b) {

    if (a.handled.has(b)) return;
    if (b.handled.has(a)) return;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const minDist = a.r + b.r;

    if (dist >= minDist) return;

    // Markieren
    a.handled.add(b);
    b.handled.add(a);

    // ZÄHLER +1
    collisionCount++;

    const nx = dx / dist;
    const ny = dy / dist;

    const tx = -ny;
    const ty = nx;

    const overlap = (minDist - dist) * 1.02;

    a.x -= nx * overlap * 0.5;
    a.y -= ny * overlap * 0.5;
    b.x += nx * overlap * 0.5;
    b.y += ny * overlap * 0.5;

    const dvx = b.vx - a.vx;
    const dvy = b.vy - a.vy;

    const vn = dvx * nx + dvy * ny;
    if (vn > 0) return;

    const vt = dvx * tx + dvy * ty;

    const e = 0.8;
    const massFactor = 0.5;

    const jn = -(1 + e) * vn * massFactor;

    const friction = 0.2;
    const jt = -vt * friction * massFactor;

    a.vx -= nx * jn + tx * jt;
    a.vy -= ny * jn + ty * jt;

    b.vx += nx * jn + tx * jt;
    b.vy += ny * jn + ty * jt;
}



// ===============================
//            RESET
// ===============================

function resetAll() {
    balls.length = 0;
    collisionCount = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
