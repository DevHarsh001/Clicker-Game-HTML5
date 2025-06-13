const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const PORT = 3000;

let db = JSON.parse(fs.readFileSync('db.json'));

app.use(express.static('public'));
app.use(express.json());

function saveDB() {
    fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
}

// Signup Route
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    if (db[email]) return res.status(400).send("Email already exists");

    const hash = await bcrypt.hash(password, 10);
    db[email] = { password: hash, coins: 0 };
    saveDB();
    res.send("Signed up successfully");
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db[email];
    if (!user) return res.status(404).send("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).send("Wrong password");

    res.json({ message: "Login successful", email });
});

// Coin Click Route
app.post('/api/click', (req, res) => {
    const { email } = req.body;
    if (!db[email]) return res.status(404).send("User not found");

    db[email].coins = +(db[email].coins + 0.01).toFixed(2);
    saveDB();
    res.json({ coins: db[email].coins });
});

// Get Balance
app.post('/api/balance', (req, res) => {
    const { email } = req.body;
    if (!db[email]) return res.status(404).send("User not found");

    res.json({ coins: db[email].coins });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
