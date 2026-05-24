document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("scratch-canvas");
    const ctx = canvas.getContext("2d");
    const rewardDisplay = document.getElementById("reward-display");
    const txIdString = document.getElementById("tx-id-string");
    const badgeAlert = document.getElementById("already-scratched-badge");
    const toastPopup = document.getElementById("scratch-toast");

    // Google Apps Script API URL Connection Link
    const API_URL = "https://script.google.com/macros/s/AKfycbw5cNH3G7ulT1kboCSQihVJsQl1GDgNaZei0D1B_HXwUK7Hy2iaYJWcGnNSQ6hqjyTD/exec";

    const urlParams = new URLSearchParams(window.location.search);
    const linkID = urlParams.get('id');

    let isDrawing = false;
    let isScratchedCompletely = false;
    let scratchCount = 0;
    let winAmount = 1;

    if (!linkID) {
        showLockoutScreen("INVALID LINK ❌", "Kripya ek valid unique secure link open karein.");
        return;
    }

    // 1. Google Sheet Validation Check
    fetch(`${API_URL}?id=${linkID}`, {
        method: "GET",
        mode: "cors", 
        headers: { "Content-Type": "text/plain" }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "ALREADY_USED") {
            showLockoutScreen("LINK ALREADY USED ❌", "Yeh unique reward link pehle hi use kiya ja chuka hai aur ab expire ho gaya hai.");
        } else if (data.status === "NOT_FOUND") {
            showLockoutScreen("ID NOT FOUND ❌", "Yeh Link ID hamare reward database me active nahi hai.");
        } else if (data.status === "VALID") {
            startScratchGame();
        }
    })
    .catch(err => {
        console.error("Fetch Error:", err);
        showLockoutScreen("CONNECTION ERROR ⚠️", "Database se sahi sampark nahi mila. Kripya ek baar page refresh karein.");
    });

    function showLockoutScreen(title, msg) {
        badgeAlert.classList.remove("hidden");
        canvas.style.display = 'none';
        rewardDisplay.innerHTML = `
            <div class="lockout-text">
                <h2>${title}</h2>
                <p>${msg}</p>
            </div>`;
        txIdString.textContent = linkID || "ERROR";
    }

    function startScratchGame() {
        // 2. Hidden Probability Distribution Logic Engine
        const roll = Math.random() * 100;
        if (roll <= 70) winAmount = 1;
        else if (roll <= 80) winAmount = 3;
        else if (roll <= 90) winAmount = 4;
        else if (roll <= 99) winAmount = 5;
        else winAmount = 25;

        rewardDisplay.innerHTML = `
            <div class="win-text-container">
                <h2>You Won</h2>
                <div class="cash-amt">₹${winAmount}</div>
                <p>Cashback Credit Secured!</p>
            </div>`;
        
        txIdString.textContent = linkID;
        setupCanvas();
    }

    function setupCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        
        // Render Premium Matte Silver Background Cover
        ctx.fillStyle = '#b0bec5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Micro Grain Texture Filter Lines
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        for (let i = 0; i < 400; i++) {
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 70 + 20, 1.2);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for (let i = 0; i < 150; i++) {
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 40 + 10, 1);
        }

        // Texture Overlay Content Structure
        ctx.font = "900 21px 'Poppins'";
        ctx.fillStyle = "#455a64";
        ctx.textAlign = "center";
        ctx.fillText("MORE RECHARGE", canvas.width / 2, canvas.height / 2 - 5);
        ctx.fillText("MORE WIN", canvas.width / 2, canvas.height / 2 + 25);

        canvas.addEventListener("mousedown", () => isDrawing = true);
        canvas.addEventListener("mousemove", processScratch);
        window.addEventListener("mouseup", () => { isDrawing = false; checkClearProgress(); });

        canvas.addEventListener("touchstart", () => isDrawing = true);
        canvas.addEventListener("touchmove", processScratch);
        window.addEventListener("touchend", () => { isDrawing = false; checkClearProgress(); });
    }

    function processScratch(e) {
        if (!isDrawing || isScratchedCompletely) return;
        e.preventDefault();

        const bound = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - bound.left;
        const y = clientY - bound.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.fill();

        scratchCount++;
        if (scratchCount > 0 && scratchCount % 75 === 0 && !isScratchedCompletely) {
            toastPopup.classList.add("show");
            setTimeout(() => toastPopup.classList.remove("show"), 1800);
        }
    }

    function checkClearProgress() {
        if (isScratchedCompletely) return;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let clearedPixels = 0;

        for (let i = 3; i < imgData.length; i += 4) {
            if (imgData[i] === 0) clearedPixels++;
        }

        if ((clearedPixels / (imgData.length / 4)) * 100 > 40) {
            isScratchedCompletely = true;
            canvas.style.transition = "opacity 0.3s ease-out";
            canvas.style.opacity = 0;
            setTimeout(() => canvas.remove(), 300);

            // Burn link parameter inside database sheet
            fetch(`${API_URL}?id=${linkID}&action=burn`, { method: "GET", mode: "no-cors" })
                .then(() => console.log("Link burned securely."))
                .catch(e => console.error("Error burning ID:", e));

            triggerConfetti();
        }
    }

    function triggerConfetti() {
        const conf = document.getElementById("confetti-canvas");
        const cCtx = conf.getContext("2d");
        conf.width = window.innerWidth; conf.height = window.innerHeight;
        let pts = [];
        const colors = ["#ff5722", "#ffc107", "#4caf50", "#ffffff"];
        for(let i=0; i<120; i++){
            pts.push({ x: Math.random() * conf.width, y: Math.random() * conf.height - conf.height, r: Math.random() * 5 + 4, vel: Math.random() * 3 + 3, col: colors[Math.floor(Math.random() * colors.length)] });
        }
        function anim(){
            cCtx.clearRect(0, 0, conf.width, conf.height);
            pts.forEach(p => { p.y += p.vel; cCtx.beginPath(); cCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2); cCtx.fillStyle = p.col; cCtx.fill(); });
            if(pts.some(p => p.y < conf.height)) requestAnimationFrame(anim);
        }
        anim();
    }
});
