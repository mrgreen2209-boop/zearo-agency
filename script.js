document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("scratch-canvas");
    const ctx = canvas.getContext("2d");
    const rewardDisplay = document.getElementById("reward-display");
    const txIdString = document.getElementById("tx-id-string");
    const badgeAlert = document.getElementById("already-scratched-badge");
    const toastPopup = document.getElementById("scratch-toast");

    let isDrawing = false;
    let isScratchedCompletely = false;
    let scratchCount = 0;

    // 1. Transaction Generation String
    function getSystemTxID() {
        const d = new Date();
        const micro = Math.floor((performance.now() % 1) * 1000).toString().padStart(3, '0');
        const sec = d.getSeconds().toString().padStart(2, '0');
        const min = d.getMinutes().toString().padStart(2, '0');
        const hr = d.getHours().toString().padStart(2, '0');
        const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
        const mStr = months[d.getMonth()];
        const mCode = mStr.charAt(0) + mStr.charAt(2);
        const dateStr = `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}`;
        return `${micro}${sec}${min}${hr}${mCode}${dateStr}`;
    }

    const liveTxID = getSystemTxID();
    const lockKey = "ze_scratched_flag_2026";
    const txKey = "ze_tx_val_2026";

    // 2. Persistent Single Device State Check
    if (localStorage.getItem(lockKey) === "true") {
        badgeAlert.classList.remove("hidden");
        txIdString.textContent = localStorage.getItem(txKey) || "582341451214MR20260524";
        isScratchedCompletely = true;
        canvas.style.display = 'none';
        
        // Show the same static reward they generated last time so refresh never changes it
        const fallbackAmt = localStorage.getItem("ze_reward_amt") || "1";
        rewardDisplay.innerHTML = `
            <div class="win-text-container">
                <h2>You Won</h2>
                <div class="cash-amt">₹${fallbackAmt}</div>
                <p>Cashback Credit Secured!</p>
            </div>`;
        return;
    }

    // 3. 100% Weighted Reward Distribution Logic (Hidden System)
    // 70% -> ₹1 | 10% -> ₹3 | 10% -> ₹4 | 9% -> ₹5 | 1% -> ₹25
    let winAmount = 1; 
    const rollPercent = Math.random() * 100;

    if (rollPercent <= 70) {
        winAmount = 1;
    } else if (rollPercent <= 80) {
        winAmount = 3;
    } else if (rollPercent <= 90) {
        winAmount = 4;
    } else if (rollPercent <= 99) {
        winAmount = 5;
    } else {
        winAmount = 25;
    }

    // Embed content onto hidden surface structure
    rewardDisplay.innerHTML = `
        <div class="win-text-container">
            <h2>You Won</h2>
            <div class="cash-amt">₹${winAmount}</div>
            <p>Cashback Credit Secured!</p>
        </div>
    `;
    txIdString.textContent = liveTxID;

    // 4. Set Canvas Sizes to Scale properly
    function setupCanvasDimensions() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        renderSilverCover();
    }

    // 5. Build Silver Matte Finished Surface Texture (Identical to Sample)
    function renderSilverCover() {
        // Concrete/Silver Matte base
        ctx.fillStyle = '#b0bec5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add detailed scratch grain texture noise streaks
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        for (let i = 0; i < 500; i++) {
            let px = Math.random() * canvas.width;
            let py = Math.random() * canvas.height;
            let pW = Math.random() * 80 + 20;
            ctx.fillRect(px, py, pW, 1.2);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        for (let i = 0; i < 200; i++) {
            let px = Math.random() * canvas.width;
            let py = Math.random() * canvas.height;
            let pW = Math.random() * 40 + 10;
            ctx.fillRect(px, py, pW, 1);
        }

        // Apply Card Text Structure overlay
        ctx.font = "900 22px 'Poppins'";
        ctx.fillStyle = "#455a64";
        ctx.textAlign = "center";
        ctx.fillText("MORE RECHARGE", canvas.width / 2, canvas.height / 2 - 5);
        ctx.fillText("MORE WIN", canvas.width / 2, canvas.height / 2 + 25);
    }

    // 6. Physics Tracking Mechanics
    function getCursorCoordinates(e) {
        const bound = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - bound.left,
            y: clientY - bound.top
        };
    }

    function processScratch(e) {
        if (!isDrawing || isScratchedCompletely) return;
        e.preventDefault();

        const coord = getCursorCoordinates(e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 24, 0, Math.PI * 2); // Perfectly engineered fluid size radius
        ctx.fill();

        scratchCount++;
        if (scratchCount > 0 && scratchCount % 75 === 0 && !isScratchedCompletely) {
            toastPopup.classList.add("show");
            setTimeout(() => toastPopup.classList.remove("show"), 1800);
        }
    }

    // Events Setup Matrix
    canvas.addEventListener("mousedown", () => isDrawing = true);
    canvas.addEventListener("mousemove", processScratch);
    window.addEventListener("mouseup", () => { isDrawing = false; checkAreaCleared(); });

    canvas.addEventListener("touchstart", () => isDrawing = true);
    canvas.addEventListener("touchmove", processScratch);
    window.addEventListener("touchend", () => { isDrawing = false; checkAreaCleared(); });

    // 7. Area Calculator & Lock State Execution
    function checkAreaCleared() {
        if (isScratchedCompletely) return;
        const matrix = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let emptyTrack = 0;

        for (let i = 3; i < matrix.length; i += 4) {
            if (matrix[i] === 0) emptyTrack++;
        }

        // Auto transition discard cover once 40% threshold of transparency is met
        if ((emptyTrack / (matrix.length / 4)) * 100 > 40) {
            isScratchedCompletely = true;
            canvas.style.transition = "opacity 0.3s ease-out";
            canvas.style.opacity = 0;
            setTimeout(() => canvas.remove(), 300);

            // Commit variables securely to local client storage memory space
            localStorage.setItem(lockKey, "true");
            localStorage.setItem(txKey, liveTxID);
            localStorage.setItem("ze_reward_amt", winAmount);

            triggerConfettiExplosion();
        }
    }

    // 8. Visual Celebration Particle Script Vector Array
    function triggerConfettiExplosion() {
        const conf = document.getElementById("confetti-canvas");
        const cCtx = conf.getContext("2d");
        conf.width = window.innerWidth;
        conf.height = window.innerHeight;

        let particles = [];
        const tones = ["#ff5722", "#ffc107", "#4caf50", "#00bcd4", "#ffffff"];
        for(let i=0; i<130; i++){
            particles.push({
                x: Math.random() * conf.width,
                y: Math.random() * conf.height - conf.height,
                r: Math.random() * 5 + 4,
                vel: Math.random() * 3 + 3,
                col: tones[Math.floor(Math.random() * tones.length)]
            });
        }
        function animationFrame(){
            cCtx.clearRect(0, 0, conf.width, conf.height);
            particles.forEach(p => {
                p.y += p.vel;
                cCtx.beginPath();
                cCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                cCtx.fillStyle = p.col;
                cCtx.fill();
            });
            if(particles.some(p => p.y < conf.height)) requestAnimationFrame(animationFrame);
        }
        animationFrame();
    }

    setupCanvasDimensions();
    window.addEventListener("resize", setupCanvasDimensions);
});
