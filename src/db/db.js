import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const sqlite = sqlite3.verbose();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbData = path.resolve(__dirname, '../db/data.db');

export const db = new sqlite.Database(dbData, sqlite.OPEN_READONLY, (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('connect sqlite')
});
