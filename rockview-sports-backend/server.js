const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getDB, initDatabase } = require('./db');

const app = express();
// Serve frontend files (public portal and admin portal)
app.use(express.static(path.join(__dirname, '..')));
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
                `UPDATE matches SET sport = ?, teamA = ?, teamB = ?, date = ?, time = ?, venue = ?, category = ? WHERE id = ?`,
                [matchData.sport, matchData.teamA, matchData.teamB, matchData.date, matchData.time, matchData.venue, matchData.category, matchData.id]
            );
        } else {
            // Create
            matchData.id = 'm_' + Date.now();
            await db.run(
                `INSERT INTO matches (id, sport, teamA, teamB, date, time, venue, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [matchData.id, matchData.sport, matchData.teamA, matchData.teamB, matchData.date, matchData.time, matchData.venue, matchData.category]
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
                `UPDATE results SET sport = ?, teamA = ?, teamB = ?, scoreA = ?, scoreB = ?, date = ?, venue = ?, notes = ? WHERE id = ?`,
                [resultData.sport, resultData.teamA, resultData.teamB, resultData.scoreA, resultData.scoreB, resultData.date, resultData.venue, resultData.notes, resultData.id]
            );
        } else {
            // Create
            resultData.id = 'r_' + Date.now();
            await db.run(
                `INSERT INTO results (id, sport, teamA, teamB, scoreA, scoreB, date, venue, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [resultData.id, resultData.sport, resultData.teamA, resultData.teamB, resultData.scoreA, resultData.scoreB, resultData.date, resultData.venue, resultData.notes]
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
                `UPDATE news SET title = ?, summary = ?, content = ?, date = ?, category = ?, author = ?, imageUrl = ? WHERE id = ?`,
                [newsData.title, newsData.summary, newsData.content, newsData.date, newsData.category, newsData.author, newsData.imageUrl, newsData.id]
            );
        } else {
            // Create
            newsData.id = 'n_' + Date.now();
            if (!newsData.imageUrl) {
                newsData.imageUrl = 'assets/news_default.png';
            }
            await db.run(
                `INSERT INTO news (id, title, summary, content, date, category, author, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [newsData.id, newsData.title, newsData.summary, newsData.content, newsData.date, newsData.category, newsData.author, newsData.imageUrl]
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
    }
}

startServer();
