const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDB, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'rvs_jwt_secret_key_12345';

app.use(cors());
app.use(express.json());

// Middleware to verify JWT Token for secure routes
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired session token.' });
        }
        req.user = user;
        next();
    });
}

// --- AUTHENTICATION ENDPOINT ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required.' });
    }
    
    try {
        const db = await getDB();
        const admin = await db.get('SELECT * FROM admins WHERE LOWER(username) = ?', [username.toLowerCase()]);
        if (!admin) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }
        
        const validPass = await bcrypt.compare(password, admin.password);
        if (!validPass) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }
        
        // Generate Token valid for 2 hours
        const token = jwt.sign({ username: admin.username, name: admin.name }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, user: { username: admin.username, name: admin.name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- MATCHES API ---
app.get('/api/matches', async (req, res) => {
    try {
        const db = await getDB();
        const matches = await db.all('SELECT * FROM matches');
        res.json(matches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/matches', authenticateToken, async (req, res) => {
    const matchData = req.body;
    try {
        const db = await getDB();
        if (matchData.id) {
            // Update
            await db.run(
                `UPDATE matches SET sport = ?, teamA = ?, teamB = ?, date = ?, time = ?, venue = ?, category = ?, updated_at = ? WHERE id = ?`,
                [matchData.sport, matchData.teamA, matchData.teamB, matchData.date, matchData.time, matchData.venue, matchData.category, Date.now(), matchData.id]
            );
        } else {
            // Create
            matchData.id = 'm_' + Date.now();
            await db.run(
                `INSERT INTO matches (id, sport, teamA, teamB, date, time, venue, category, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [matchData.id, matchData.sport, matchData.teamA, matchData.teamB, matchData.date, matchData.time, matchData.venue, matchData.category, Date.now()]
            );
        }
        res.json(matchData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/matches/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const db = await getDB();
        await db.run('DELETE FROM matches WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- RESULTS API ---
app.get('/api/results', async (req, res) => {
    try {
        const db = await getDB();
        const results = await db.all('SELECT * FROM results');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/results', authenticateToken, async (req, res) => {
    const resultData = req.body;
    try {
        const db = await getDB();
        if (resultData.id) {
            // Update
            await db.run(
                `UPDATE results SET sport = ?, teamA = ?, teamB = ?, scoreA = ?, scoreB = ?, date = ?, venue = ?, notes = ?, updated_at = ? WHERE id = ?`,
                [resultData.sport, resultData.teamA, resultData.teamB, resultData.scoreA, resultData.scoreB, resultData.date, resultData.venue, resultData.notes, Date.now(), resultData.id]
            );
        } else {
            // Create
            resultData.id = 'r_' + Date.now();
            await db.run(
                `INSERT INTO results (id, sport, teamA, teamB, scoreA, scoreB, date, venue, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [resultData.id, resultData.sport, resultData.teamA, resultData.teamB, resultData.scoreA, resultData.scoreB, resultData.date, resultData.venue, resultData.notes, Date.now()]
            );
        }
        res.json(resultData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/results/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const db = await getDB();
        await db.run('DELETE FROM results WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- NEWS API ---
app.get('/api/news', async (req, res) => {
    try {
        const db = await getDB();
        const news = await db.all('SELECT * FROM news');
        res.json(news);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/news', authenticateToken, async (req, res) => {
    const newsData = req.body;
    try {
        const db = await getDB();
        if (newsData.id) {
            // Update
            await db.run(
                `UPDATE news SET title = ?, summary = ?, content = ?, date = ?, category = ?, author = ?, imageUrl = ?, updated_at = ? WHERE id = ?`,
                [newsData.title, newsData.summary, newsData.content, newsData.date, newsData.category, newsData.author, newsData.imageUrl, Date.now(), newsData.id]
            );
        } else {
            // Create
            newsData.id = 'n_' + Date.now();
            if (!newsData.imageUrl) {
                newsData.imageUrl = 'assets/news_default.png';
            }
            await db.run(
                `INSERT INTO news (id, title, summary, content, date, category, author, imageUrl, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [newsData.id, newsData.title, newsData.summary, newsData.content, newsData.date, newsData.category, newsData.author, newsData.imageUrl, Date.now()]
            );
        }
        res.json(newsData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/news/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const db = await getDB();
        await db.run('DELETE FROM news WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMINS API ---
app.get('/api/admins', authenticateToken, async (req, res) => {
    try {
        const db = await getDB();
        const admins = await db.all('SELECT username, name FROM admins');
        res.json(admins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admins', authenticateToken, async (req, res) => {
    const adminData = req.body;
    if (!adminData.username || !adminData.password || !adminData.name) {
        return res.status(400).json({ error: 'Username, password, and name are required.' });
    }
    
    try {
        const db = await getDB();
        const exists = await db.get('SELECT username FROM admins WHERE LOWER(username) = ?', [adminData.username.toLowerCase()]);
        if (exists) {
            return res.status(400).json({ error: 'Admin username already exists.' });
        }
        
        const hashedPassword = bcrypt.hashSync(adminData.password, 10);
        await db.run(
            'INSERT INTO admins (username, password, name) VALUES (?, ?, ?)',
            [adminData.username, hashedPassword, adminData.name]
        );
        res.json({ username: adminData.username, name: adminData.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admins/:username', authenticateToken, async (req, res) => {
    const { username } = req.params;
    if (username.toLowerCase() === 'admin') {
        return res.status(400).json({ error: 'Cannot delete default system administrator account.' });
    }
    
    try {
        const db = await getDB();
        await db.run('DELETE FROM admins WHERE LOWER(username) = ?', [username.toLowerCase()]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- HEALTH CHECK ---
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// --- TIMESTAMP-BASED UPDATES ENDPOINT ---
app.get('/api/updates', async (req, res) => {
    const since = parseInt(req.query.since) || 0;
    try {
        const db = await getDB();
        const [matches, results, news] = await Promise.all([
            db.all('SELECT * FROM matches WHERE updated_at > ?', [since]),
            db.all('SELECT * FROM results WHERE updated_at > ?', [since]),
            db.all('SELECT * FROM news WHERE updated_at > ?', [since])
        ]);
        res.json({ matches, results, news });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- POLLS API ---
// Get all polls
app.get('/api/polls', async (req, res) => {
    try {
        const db = await getDB();
        const polls = await db.all('SELECT * FROM polls');
        res.json(polls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Create a poll (protected)
app.post('/api/polls', authenticateToken, async (req, res) => {
    const poll = req.body;
    try {
        const db = await getDB();
        poll.id = 'p_' + Date.now();
        poll.created_at = Date.now();
        await db.run(`INSERT INTO polls (id, question, created_at) VALUES (?, ?, ?)`, [poll.id, poll.question, poll.created_at]);
        res.json(poll);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Delete a poll (protected)
app.delete('/api/polls/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const db = await getDB();
        await db.run('DELETE FROM polls WHERE id = ?', [id]);
        await db.run('DELETE FROM votes WHERE poll_id = ?', [id]); // cascade cleanup
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Vote on a poll (protected)
app.post('/api/polls/:id/vote', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { choice } = req.body;
    const userId = req.user.username; // using username as identifier
    try {
        const db = await getDB();
        const voteId = 'v_' + Date.now();
        await db.run(`INSERT INTO votes (id, poll_id, user_id, choice, created_at) VALUES (?, ?, ?, ?, ?)`, [voteId, id, userId, choice, Date.now()]);
        res.json({ success: true });
    } catch (err) {
        if (err && err.code === 'SQLITE_CONSTRAINT') {
            res.status(400).json({ error: 'You have already voted on this poll.' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// --- PROCESSES API ---
// List processes
app.get('/api/processes', async (req, res) => {
    try {
        const db = await getDB();
        const processes = await db.all('SELECT * FROM processes');
        res.json(processes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Create a process (protected)
app.post('/api/processes', authenticateToken, async (req, res) => {
    const proc = req.body;
    try {
        const db = await getDB();
        proc.id = 'proc_' + Date.now();
        proc.status = proc.status || 'running';
        proc.started_at = Date.now();
        await db.run(`INSERT INTO processes (id, name, status, started_at) VALUES (?, ?, ?, ?)`, [proc.id, proc.name, proc.status, proc.started_at]);
        res.json(proc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Update process status (protected)
app.patch('/api/processes/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const db = await getDB();
        await db.run('UPDATE processes SET status = ?, completed_at = ? WHERE id = ?', [status, status === 'completed' ? Date.now() : null, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SERVER INITIALIZATION ---
async function startServer() {
    try {
        await initDatabase();
        console.log('Database initialized successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to initialize database and start server:', err);
        process.exit(1);
    }
}

startServer();
