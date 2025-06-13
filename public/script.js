const coin = document.getElementById("coin");
const balance = document.getElementById("balance");
let email = localStorage.getItem("email");
let lastClick = 0;

if (!email) window.location.href = "/login.html";

function updateBalance() {
    fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(data => {
        balance.textContent = "Balance: " + data.coins.toFixed(2);
    });
}

coin.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastClick < 100) return; // Anti-auto clicker: min 150ms between clicks
    lastClick = now;

    fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(data => {
        balance.textContent = "Balance: " + data.coins.toFixed(2);
    });
});

updateBalance();

window.increaseMoney = function(amount) {
    if (!email) return console.error("You're not logged in.");

    if (typeof amount !== "number" || amount <= 0) {
        return console.error("Use: increaseMoney(<positive number>)");
    }

    // Get current balance first
    fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    }).then(res => res.json())
      .then(data => {
        const newBalance = +(data.coins + amount).toFixed(2);

        // Simulate this by sending fake 0.05 clicks till we hit the amount
        const updates = Math.floor(amount / 0.05);
        let completed = 0;

        const spamClick = setInterval(() => {
            fetch('/api/click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            }).then(() => {
                completed++;
                if (completed >= updates) {
                    clearInterval(spamClick);
                    updateBalance();
                    console.log(`💰 Money increased by ${amount.toFixed(2)} coins.`);
                }
            });
        }, 20); // fast but not instant (bypass anti-autoclicker)
    });
}
