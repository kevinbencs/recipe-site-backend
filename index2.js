import sqlite3 from 'sqlite3';

const sqlite = sqlite3.verbose();


let commentDB = new sqlite.Database('./src/db/comment.db', (err) => {
    if (err) {
        console.error(err.message);
    };
    console.log('Connected to the database.');
});

commentDB.serialize(() => {
    commentDB.run(
        `CREATE TABLE IF NOT EXISTS COMMENTS(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            comment TEXT,
            mealId INT,
            email TEXT,
            name TEXT,
            canChange TEXT
        )`
    )
});


commentDB.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});
