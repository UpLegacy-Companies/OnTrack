const express = require("express");
const noblox = require("noblox.js");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Replace with your group's ID and bot credentials
const GROUP_ID = GROUP_ID; // Replace with your group ID
const COOKIE = "YOUR_TOKEN";

app.use(bodyParser.json());

// Initialize Noblox.js
async function start() {
    await noblox.setCookie(COOKIE);
    console.log("Logged in to Roblox!");
}
start();

// Root endpoint to confirm server is running
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Endpoint to handle rank updates
app.post("/promote", async (req, res) => {
    const { userId, points } = req.body;

    if (!userId || points === undefined) {
        return res.status(400).send("Invalid request data.");
    }

    try {
        const currentRank = await noblox.getRankInGroup(GROUP_ID, userId);
        let newRank;

        if (points >= 500 && currentRank !== 221) {
            newRank = 222; // Example: Top Rank
        } else if (points >= 250 && points < 500 && currentRank !== 220) {
            newRank = 221; // Example: Middle Rank
        } else if (points >= 100 && currentRank !== 218) {
            newRank = 220; // Example: Lowest Rank
        }
        if (newRank) {
            await noblox.setRank(GROUP_ID, userId, newRank);
            return res.send(`User ${userId} promoted to rank ${newRank}.`);
        } else {
            return res.send("No rank update required.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating rank.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
