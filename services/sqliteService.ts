import initSqlJs from 'sql.js';
import { HOSTELS, NEWS_ITEMS, EVENTS, JOBS, ROOMMATE_PROFILES } from '../constants';

let dbInstance = null;
let dbPromise = null;

// Helper to save the current state of dbInstance to localStorage
const saveDatabase = () => {
    if (dbInstance) {
        const data = dbInstance.export();
        // A robust Uint8Array to Base64 conversion
        const base64 = btoa(new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        localStorage.setItem('unistay_sqlite_db', base64);
    }
};

// Helper to convert Base64 string back to Uint8Array
const base64ToUint8Array = (base64) => {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
};


const createSchema = (db) => {
    db.run(`
        CREATE TABLE hostels (
            id TEXT PRIMARY KEY,
            name TEXT,
            location TEXT,
            priceRange TEXT,
            imageUrl TEXT,
            rating REAL,
            universityId TEXT,
            description TEXT,
            amenities TEXT,
            isRecommended BOOLEAN
        );
        CREATE TABLE news (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            imageUrl TEXT,
            source TEXT
        );
        CREATE TABLE events (
            id TEXT PRIMARY KEY,
            title TEXT,
            date TEXT,
            day TEXT,
            month TEXT,
            location TEXT,
            imageUrl TEXT
        );
        CREATE TABLE jobs (
            id TEXT PRIMARY KEY,
            title TEXT,
            deadline TEXT,
            company TEXT,
            imageUrl TEXT,
            location TEXT,
            type TEXT,
            description TEXT,
            responsibilities TEXT,
            qualifications TEXT,
            howToApply TEXT
        );
        CREATE TABLE roommate_profiles (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            contactNumber TEXT,
            studentNumber TEXT,
            imageUrl TEXT,
            age INTEGER,
            gender TEXT,
            universityId TEXT,
            course TEXT,
            yearOfStudy INTEGER,
            budget REAL,
            moveInDate TEXT,
            leaseDuration TEXT,
            bio TEXT,
            isSmoker BOOLEAN,
            drinksAlcohol TEXT,
            studySchedule TEXT,
            cleanliness TEXT,
            guestFrequency TEXT,
            hobbies TEXT,
            seekingGender TEXT
        );
    `);
};

const seedDatabase = (db) => {
    // Seed Hostels
    const hostelStmt = db.prepare("INSERT INTO hostels VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    HOSTELS.forEach(h => hostelStmt.run([h.id, h.name, h.location, h.priceRange, h.imageUrl, h.rating, h.universityId, h.description, JSON.stringify(h.amenities), h.isRecommended]));
    hostelStmt.free();

    // Seed News
    const newsStmt = db.prepare("INSERT INTO news VALUES (?, ?, ?, ?, ?)");
    NEWS_ITEMS.forEach(n => newsStmt.run([n.id, n.title, n.description, n.imageUrl, n.source]));
    newsStmt.free();

    // Seed Events
    const eventStmt = db.prepare("INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?)");
    EVENTS.forEach(e => eventStmt.run([e.id, e.title, e.date, e.day, e.month, e.location, e.imageUrl]));
    eventStmt.free();

    // Seed Jobs
    const jobStmt = db.prepare("INSERT INTO jobs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    JOBS.forEach(j => jobStmt.run([j.id, j.title, j.deadline, j.company, j.imageUrl, j.location, j.type, j.description, JSON.stringify(j.responsibilities), JSON.stringify(j.qualifications), j.howToApply]));
    jobStmt.free();

    // Seed Roommate Profiles
    const profileStmt = db.prepare("INSERT INTO roommate_profiles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    ROOMMATE_PROFILES.forEach(p => profileStmt.run([
        p.id, p.name, p.email, p.contactNumber, p.studentNumber, p.imageUrl, p.age, p.gender,
        p.universityId, p.course, p.yearOfStudy, p.budget, p.moveInDate, p.leaseDuration,
        p.bio, p.isSmoker, p.drinksAlcohol, p.studySchedule, p.cleanliness, p.guestFrequency,
        p.hobbies, p.seekingGender
    ]));
    profileStmt.free();
};


export const getDb = () => {
    if (!dbPromise) {
        dbPromise = (async () => {
            try {
                // Explicitly fetch the wasm file to avoid fs errors in certain environments.
                const wasmUrl = 'https://esm.sh/sql.js@^1.11.0/dist/sql-wasm.wasm';
                const wasmBinary = await fetch(wasmUrl).then(res => res.arrayBuffer());

                const SQL = await initSqlJs({ wasmBinary });
                
                const savedDb_b64 = localStorage.getItem('unistay_sqlite_db');
                if (savedDb_b64) {
                    const bytes = base64ToUint8Array(savedDb_b64);
                    dbInstance = new SQL.Database(bytes);
                } else {
                    dbInstance = new SQL.Database();
                    createSchema(dbInstance);
                    seedDatabase(dbInstance);
                    saveDatabase(); // Initial save
                }

                return dbInstance;
            } catch (err) {
                console.error("Database initialization failed:", err);
                throw err;
            }
        })();
    }
    return dbPromise;
};

// Expose a function to trigger a save from the dbService
export const triggerDbSave = () => {
    saveDatabase();
};