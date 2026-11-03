const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const output = document.getElementById("ascii");

const W = 240;
const H = 100;

const chars = " .,:;!*+%@#";

function drawEye(open) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    ctx.save();

    ctx.beginPath();

    const center = 50;
    const height = 34 * open;

    ctx.moveTo(12, center);

    ctx.bezierCurveTo(
        65, center - height,
        175, center - height,
        228, center
    );

    ctx.bezierCurveTo(
        175, center + height,
        65, center + height,
        12, center
    );

    ctx.closePath();
    ctx.clip();

    // Eye white
    const white = ctx.createRadialGradient(
        120, 50, 5, 120, 50, 110
    );

    white.addColorStop(0, "#ffffff");
    white.addColorStop(0.7, "#8d9eaf");
    white.addColorStop(1, "#101c2a");

    ctx.fillStyle = white;
    ctx.fillRect(0, 0, W, H);

    // Iris
    const iris = ctx.createRadialGradient(
        120, 50, 5, 120, 50, 36
    );

    iris.addColorStop(0, "#000");
    iris.addColorStop(0.35, "#0750a0");
    iris.addColorStop(0.7, "#16aaff");
    iris.addColorStop(1, "#061a45");

    ctx.fillStyle = iris;
    ctx.beginPath();
    ctx.arc(120, 50, 37, 0, Math.PI * 2);
    ctx.fill();

    // Iris details
    for (let i = 0; i < 100; i++) {
        let angle = Math.PI * 2 * i / 100;

        ctx.strokeStyle = i % 2
            ? "#40baff"
            : "#124477";

        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(
            120 + Math.cos(angle) * 13,
            50 + Math.sin(angle) * 13
        );

        ctx.lineTo(
            120 + Math.cos(angle) * 35,
            50 + Math.sin(angle) * 35
        );

        ctx.stroke();
    }

    // Pupil
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(120, 50, 15, 0, Math.PI * 2);
    ctx.fill();

    // Light reflection
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(109, 39, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Eyelashes
    if (open > 0.1) {
        ctx.strokeStyle = "#a9c9ed";
        ctx.lineWidth = 1;

        for (let i = 0; i < 35; i++) {
            let x = 15 + i * 6.1;
            let y = 50 - height *
                Math.sqrt(Math.max(0, 1 - ((x - 120) / 108) ** 2));

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 3, y - 7);
            ctx.stroke();
        }
    }
}

function convertToASCII() {
    const image = ctx.getImageData(0, 0, W, H);
    let result = "";

    for (let y = 0; y < H; y += 2) {
        for (let x = 0; x < W; x += 1) {
            const index = (y * W + x) * 4;

            const r = image.data[index];
            const g = image.data[index + 1];
            const b = image.data[index + 2];

            const brightness =
                (r * 0.299 + g * 0.587 + b * 0.114);

            const charIndex = Math.floor(
                brightness / 256 * chars.length
            );

            result += chars[
                Math.min(charIndex, chars.length - 1)
            ];
        }

        result += "\n";
    }

    output.textContent = result;
}

const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

async function blink() {
    while (true) {
        drawEye(1);
        convertToASCII();

        await sleep(1800);

        // First blink
        for (let i = 10; i >= 0; i--) {
            drawEye(i / 10);
            convertToASCII();
            await sleep(35);
        }

        for (let i = 0; i <= 10; i++) {
            drawEye(i / 10);
            convertToASCII();
            await sleep(35);
        }

        await sleep(250);

        // Second blink
        for (let i = 10; i >= 0; i--) {
            drawEye(i / 10);
            convertToASCII();
            await sleep(35);
        }

        for (let i = 0; i <= 10; i++) {
            drawEye(i / 10);
            convertToASCII();
            await sleep(35);
        }

        await sleep(1200);
    }
}

blink();