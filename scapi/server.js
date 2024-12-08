const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());

// Connect to the SQLite database
const db = new sqlite3.Database('/home/admin/projects/scdb/activity.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the database.');
    }
});

// Create the table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS activity (
        username TEXT PRIMARY KEY,
        time INTEGER
    )
`);

// Endpoint to log activity
app.post('/log', (req, res) => {
    const { username, time } = req.body;

    if (!username || typeof time !== 'number') {
        return res.status(400).send('Invalid request. Username and time are required.');
    }

    // Check if the user exists, then update or insert
    db.run(
        `
        INSERT INTO activity (username, time)
        VALUES (?, ?)
        ON CONFLICT(username) DO UPDATE SET time = time + excluded.time
        `,
        [username, time],
        (err) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).send('Failed to log activity.');
            }
            res.send(`Activity for ${username} logged.`);
        }
    );
});

// Endpoint to get all activity
app.get('/activity', (req, res) => {
    db.all(`SELECT * FROM activity`, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Failed to fetch activity.');
        }
        res.json(rows);
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
