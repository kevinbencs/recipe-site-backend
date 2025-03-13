import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import NodeCache from "node-cache";

const sqlite = sqlite3.verbose();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbData = path.resolve(__dirname, '../db/data.db');

export const db = new sqlite.Database(dbData, sqlite.OPEN_READONLY, (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('connect sqlite')
});

export async function queryDB(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) { console.log(err); reject(err); }
            else resolve(rows);
        });
    });
}

export const myCache = new NodeCache();

export const cacheFunction = async () => {
    const result = await queryDB(`SELECT strMeal, strCategory, strInstructions, strMealThumb, id FROM DATA LIMIT 10 `);

    const success1 = myCache.set("mainPage", result);

    const recipes = await queryDB(`SELECT * FROM DATA `);

    const cat = await queryDB('SELECT strCategory FROM DATA GROUP BY strCategory')


    for (let i = 0; i < recipes.length; i++) {
        
        const result2 = await queryDB(`SELECT COUNT(*) as length FROM DATA WHERE strCategory = ?  `, [recipes[i].strCategory]);
        
        const success2 = myCache.set(`name-${recipes[i].strMeal}`, { rec: recipes[i], num: result2[0].length - 1 });
    }

    for (let i = 0; i < cat.length; i++) {
        
        const result1 = await queryDB(`SELECT strMeal, strCategory, strInstructions, strMealThumb, id FROM DATA WHERE strCategory = ?  LIMIT 10 `, [cat[i].strCategory]);
        const result3 = await queryDB(`SELECT COUNT(id) as length FROM DATA WHERE strCategory = ?  `, [cat[i].strCategory]);

        const success3 = myCache.set(`recipes-${cat[i].strCategory}`, { rec: result1, num: result3[0].length - 1 });
    }

}