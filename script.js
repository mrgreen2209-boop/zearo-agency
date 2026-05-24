document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("scratch-canvas");
    const ctx = canvas.getContext("2d");
    const frame = document.getElementById("scratch-card-frame");
    const rewardOutput = document.getElementById("reward-output");
    const txIdDisplay = document.getElementById("tx-id-display");
    const usedScreen = document.getElementById("already-used-screen");
    const savedTxIdEl = document.getElementById("saved-tx-id");
    const toast = document.getElementById("nudge-toast");

    let isDrawing = false;
    let isScratchedCompletely = false;
    let scratchCount = 0;

    function generateTransactionID() {
        const now = new Date();
        const micro = Math.floor((performance.now() % 1) * 1000).toString().padStart(3, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
        const currentMonthStr = months[now.getMonth()];
        const monthCode = currentMonthStr.charAt(0) + currentMonthStr.charAt(2);
        const dateSegment = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
        return `${micro}${seconds}${minutes}${hours}${monthCode}${dateSegment}`;
    }

    const uniqueTxID = generateTransactionID();
    if (localStorage.getItem("zearo_scratched") === "true") {
        usedScreen.classList.remove("hidden");
        frame.classList.add("hidden");
        savedTxIdEl.textContent = localStorage.getItem("zearo_tx") || "N/A";
        return;
    }

    // 5% chance win logic
    const isWin = Math.random() < 0.05; 
    if (isWin) {
        const amt = Math.floor(Math.random() * 10) + 1;
        rewardOutput.innerHTML = `<div class="reward-text-win"><h3>You Won</h3><div class="amount">₹${amt}</div><p>Cashback added!</p></div>`;
    } else {
        rewardOutput.innerHTML = `<div class="reward-text-sad">😔 Better Luck Next Time</div>`;
    }
    txIdDisplay.textContent = uniqueTxID;

    function resizeCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        drawLayer();
    }

    function drawLayer() {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#cfd8dc'); grad.addColorStop(0.5, '#b0bec5'); grad.addColorStop(1, '#78909c');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        for (let i = 0; i < canvas.width; i += 20) { ctx.fillRect(i, 0, 1, canvas.height); }
        ctx.font = "bold 16px 'Poppins'"; ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.textAlign = "center";
        ctx.fillText("ZEARO AGENCY", canvas.width / 2, canvas.height / 2 - 5);
        ctx.font = "11px 'Poppins'"; ctx.fillText("⭐ SCRATCH HERE ⭐", canvas.width / 2, canvas.height / 2 + 15);
    }

    function scratch(e) {
        if (!isDrawing || isScratchedCompletely) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left; const y = clientY - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.arc(x, y, 25, 0, Math.PI * 2); ctx.fill();

        scratchCount++;
        if (scratchCount > 0 && scratchCount % 80 === 0 && !isScratchedCompletely) {
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 2000);
        }
    }

    canvas.addEventListener("mousedown", () => isDrawing = true);
    canvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", () => { isDrawing = false; checkPercent(); });
    canvas.addEventListener("touchstart", () => isDrawing = true);
    canvas.addEventListener("touchmove", scratch);
    window.addEventListener("touchend", () => { isDrawing = false; checkPercent(); });

    function checkPercent() {
        if (isScratchedCompletely) return;
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let clear = 0;
        for (let i = 3; i < pixels.length; i += 4) { if (pixels[i] === 0) clear++; }
        if ((clear / (pixels.length / 4)) * 100 > 45) {
            isScratchedCompletely = true;
            canvas.style.transition = "opacity 0.4s"; canvas.style.opacity = 0;
            setTimeout(() => canvas.remove(), 400);
            localStorage.setItem("zearo_scratched", "true");
            localStorage.setItem("zearo_tx", uniqueTxID);
            if (isWin) runConfetti();
        }
    }

    function runConfetti() {
        const conf = document.getElementById("confetti-canvas");
        const cCtx = conf.getContext("2d");
        conf.width = window.innerWidth; conf.height = window.innerHeight;
        let pts = [];
        for (let i = 0; i < 100; i++) {
            pts.push({ x: Math.random() * conf.width, y: Math.random() * conf.height - conf.height, r: Math.random() * 6 + 3, d: Math.random() * conf.height, color: ["#ffb300", "#ffd54f", "#ffffff"][Math.floor(Math.random() * 3)] });
        }
        function draw() {
            cCtx.clearRect(0, 0, conf.width, conf.height);
            pts.forEach(p => {
                p.y += 4; cCtx.beginPath(); cCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                cCtx.fillStyle = p.color; cCtx.fill();
            });
            if (pts.some(p => p.y < conf.height)) requestAnimationFrame(draw);
        }
        draw();
    }

    resizeCanvas();
});