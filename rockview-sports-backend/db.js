const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

let dbPromise = null;

async function getDB() {
    if (!dbPromise) {
        try {
            const dbPath = path.join(__dirname, 'sports.db');
            console.log(`Opening database at: ${dbPath}`);
            dbPromise = open({
                filename: dbPath,
                driver: sqlite3.Database
            });
        } catch (err) {
            console.error('Error opening database:', err);
            throw err;
        }
    }
    return dbPromise;
}

const DEFAULT_ADMINS = [
    { username: 'admin', password: 'password123', name: 'System Administrator' },
    { username: 'coach_john', password: 'coachpassword', name: 'Coach John' }
];

const DEFAULT_MATCHES = [
    {
        id: 'm1',
        sport: 'Football',
        teamA: 'Rockview Hawks',
        teamB: 'Apex University Lions',
        date: '2026-06-05',
        time: '15:30',
        venue: 'Rockview Main Stadium',
        category: "Men's Varsity"
    },
    {
        id: 'm2',
        sport: 'Basketball',
        teamA: 'Rockview Hawks',
        teamB: 'Summit College Knights',
        date: '2026-06-08',
        time: '18:00',
        venue: 'Rockview Sports Complex (Indoor)',
        category: "Men's Varsity"
    },
    {
        id: 'm3',
        sport: 'Volleyball',
        teamA: 'Rockview Lady Hawks',
        teamB: 'Valley Tech Warriors',
        date: '2026-06-12',
        time: '14:00',
        venue: 'Campus West Gym',
        category: "Women's Varsity"
    },
    {
        id: 'm4',
        sport: 'Netball',
        teamA: 'Rockview Lady Hawks',
        teamB: 'Elite Academy Owls',
        date: '2026-06-15',
        time: '11:00',
        venue: 'Campus Netball Courts',
        category: "Women's Varsity"
    }
];

const DEFAULT_RESULTS = [
    {
        id: 'r1',
        sport: 'Football',
        teamA: 'Rockview Hawks',
        teamB: 'Coastal University Dolphins',
        scoreA: 3,
        scoreB: 1,
        date: '2026-05-20',
        venue: 'Coastal Main Stadium',
        notes: 'Phenomenal hat-trick by striker David Mumba led the Hawks to a decisive victory.'
    },
    {
        id: 'r2',
        sport: 'Basketball',
        teamA: 'Rockview Hawks',
        teamB: 'Metro Elite Giants',
        scoreA: 88,
        scoreB: 92,
        date: '2026-05-18',
        venue: 'Metro Arena',
        notes: 'A tight game that went into overtime. Rockview displayed great tenacity.'
    },
    {
        id: 'r3',
        sport: 'Tennis',
        teamA: 'Rockview Singles (Sarah Phiri)',
        teamB: 'Beacon College (Mary Tembo)',
        scoreA: 2,
        scoreB: 0,
        date: '2026-05-15',
        venue: 'Rockview Tennis Courts',
        notes: 'Straight sets victory (6-2, 6-4) for Sarah. Secures her spot in the regionals.'
    },
    {
        id: 'r4',
        sport: 'Netball',
        teamA: 'Rockview Lady Hawks',
        teamB: 'Apex University Lions',
        scoreA: 42,
        scoreB: 35,
        date: '2026-05-22',
        venue: 'Campus Netball Courts',
        notes: 'A spectacular performance from the Hawks, leading from the first quarter.'
    }
];

const DEFAULT_NEWS = [
    {
        id: 'n1',
        title: 'Rockview Hawks Football Team Enters Regional Semifinals',
        summary: 'With their recent 3-1 victory, the Hawks are gearing up to face the Apex Lions in the upcoming semifinals this June.',
        content: 'Following a stellar performance in the group stages, the Rockview University Men\'s Football team has officially qualified for the Regional Semifinals. Coach John expressed immense pride in the team\'s defense and physical conditioning. "The boys have put in the hours, and it\'s showing on the pitch," he remarked. The match is scheduled for June 5th, and free transportation will be provided for student supporters. Tickets are available at the sports office.',
        date: '2026-05-22',
        category: 'Football',
        author: 'Coach John',
        imageUrl: 'assets/hero_soccer.png'
    },
    {
        id: 'n2',
        title: 'Annual Sports Trials Open for Freshman Intake',
        summary: 'Rockview Sports Department announces trials for Basketball, Volleyball, Tennis, and Athletics. Find out how to participate.',
        content: 'Are you a new student looking to represent the Rockview Hawks? The Sports Department is hosting the annual freshman recruitment trials starting next Monday. Trials will be conducted across multiple sports, including Football, Basketball, Volleyball, Netball, and Tennis. All prospective student-athletes must bring a physical fitness clearance form. For full schedules and registration, visit the sports desk at the Student Center.',
        date: '2026-05-21',
        category: 'General',
        author: 'Sports Department',
        imageUrl: 'assets/sports_trials.png'
    },
    {
        id: 'n3',
        title: 'Sarah Phiri Secures Spot in National Tennis Championship',
        summary: 'Rockview\'s top tennis seed Sarah Phiri makes history after dominant performance at the Inter-University Singles.',
        content: 'Rockview Tennis star Sarah Phiri has qualified for the National Tennis Championship after winning the Inter-University Singles Finals in straight sets. Sarah did not drop a single match throughout the tournament. The university management has congratulated Sarah and pledged full sponsorship for her travel and equipment. "I\'m honored to represent Rockview, and I\'m aiming for gold," Sarah told Rockview Sports News.',
        date: '2026-05-16',
        category: 'Tennis',
        author: 'Athletics Coordinator',
        imageUrl: 'assets/tennis_player.png'
    }
];

async function initDatabase() {
    const db = await getDB();
    
    // Create Admins table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS admins (
            username TEXT PRIMARY KEY,
            password TEXT,
            name TEXT,
            updated_at INTEGER
        )
    `);

    // Create Matches table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS matches (
            id TEXT PRIMARY KEY,
            sport TEXT,
            teamA TEXT,
            teamB TEXT,
            date TEXT,
            time TEXT,
            venue TEXT,
            category TEXT,
            updated_at INTEGER
        )
    `);

    // Create Results table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS results (
            id TEXT PRIMARY KEY,
            sport TEXT,
            teamA TEXT,
            teamB TEXT,
            scoreA INTEGER,
            scoreB INTEGER,
            date TEXT,
            venue TEXT,
            notes TEXT,
            updated_at INTEGER
        )
    `);

    // Create News table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS news (
            id TEXT PRIMARY KEY,
            title TEXT,
            summary TEXT,
            content TEXT,
            date TEXT,
            category TEXT,
            author TEXT,
            imageUrl TEXT,
            updated_at INTEGER
        )
    `);

    // Seed Admins if empty
    const adminCount = await db.get('SELECT COUNT(*) as count FROM admins');
    if (adminCount.count === 0) {
        for (const admin of DEFAULT_ADMINS) {
            const hashedPassword = bcrypt.hashSync(admin.password, 10);
            await db.run(
                'INSERT INTO admins (username, password, name, updated_at) VALUES (?, ?, ?, ?)',
                [admin.username, hashedPassword, admin.name, Date.now()]
            );
        }
        console.log('Seeded default admins.');
    }

    // Seed Matches if empty
    const matchCount = await db.get('SELECT COUNT(*) as count FROM matches');
    if (matchCount.count === 0) {
        for (const m of DEFAULT_MATCHES) {
            await db.run(
                'INSERT INTO matches (id, sport, teamA, teamB, date, time, venue, category, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [m.id, m.sport, m.teamA, m.teamB, m.date, m.time, m.venue, m.category, Date.now()]
            );
        }
        console.log('Seeded default matches.');
    }

    // Seed Results if empty
    const resultCount = await db.get('SELECT COUNT(*) as count FROM results');
    if (resultCount.count === 0) {
        for (const r of DEFAULT_RESULTS) {
            await db.run(
                'INSERT INTO results (id, sport, teamA, teamB, scoreA, scoreB, date, venue, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [r.id, r.sport, r.teamA, r.teamB, r.scoreA, r.scoreB, r.date, r.venue, r.notes, Date.now()]
            );
        }
        console.log('Seeded default results.');
    }

    // Seed News if empty
    const newsCount = await db.get('SELECT COUNT(*) as count FROM news');
    if (newsCount.count === 0) {
        for (const n of DEFAULT_NEWS) {
            await db.run(
                'INSERT INTO news (id, title, summary, content, date, category, author, imageUrl, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [n.id, n.title, n.summary, n.content, n.date, n.category, n.author, n.imageUrl, Date.now()]
            );
        }
        console.log('Seeded default news.');
    }
    // Create Polls table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS polls (
            id TEXT PRIMARY KEY,
            question TEXT,
            created_at INTEGER
        )
    `);

    // Create Votes table with unique constraint to prevent duplicate votes per user per poll
    await db.exec(`
        CREATE TABLE IF NOT EXISTS votes (
            id TEXT PRIMARY KEY,
            poll_id TEXT,
            user_id TEXT,
            choice TEXT,
            created_at INTEGER,
            UNIQUE(poll_id, user_id)
        )
    `);

    // Create Processes table to track background tasks
    await db.exec(`
        CREATE TABLE IF NOT EXISTS processes (
            id TEXT PRIMARY KEY,
            name TEXT,
            status TEXT,
            started_at INTEGER,
            completed_at INTEGER
        )
    `);

    // Cleanup function to handle unfinished duplicate processes
    async function cleanUpProcesses() {
        const unfinished = await db.all('SELECT * FROM processes WHERE status != ?', ['completed']);
        console.log(`Found ${unfinished.length} unfinished processes.`);
        const seen = new Set();
        for (const proc of unfinished) {
            const key = proc.name;
            if (seen.has(key)) {
                await db.run('UPDATE processes SET status = ? WHERE id = ?', ['ignored', proc.id]);
            } else {
                seen.add(key);
            }
        }
    }
    // Run cleanup after initializing tables
    await cleanUpProcesses();
}


module.exports = {
    getDB,
    initDatabase
};
