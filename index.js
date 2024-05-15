import fetch from 'node-fetch';
import sqlite3 from 'sqlite3';
import { setTimeout } from 'node:timers/promises';

const sqlite = sqlite3.verbose();
let recipeArray = [];
let recipeIdArray = [];




const kell = async () => {
    const responseCategory = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
    const dataCategory = await responseCategory.json();
    const categories = dataCategory.categories.map(r => r.strCategory);

    for (let j = 0; j < categories.length; j++) {
        const responseCategoryId = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${categories[j]}`);
        const dataCategoryId = await responseCategoryId.json();
        const categoriesId = await dataCategoryId.meals.map(r => r.idMeal);
        recipeIdArray.push(categoriesId);

    }
    let b = 0;
    let i = 0;

    while (i < recipeIdArray.length) {


        for (let j = 0; j < recipeIdArray[i].length; j++) {
            b++
            const responseRecipe = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeIdArray[i][j]}`);
            const dataRecipe = await responseRecipe.json();
            recipeArray.push(dataRecipe.meals[0]);
            if (b === 60) {
                await setTimeout(5000, 'Time out').then((res) => { console.log(res) }); 
                b = 0;
            }
        }
        i++;

    }
}

await kell();


let db = new sqlite.Database('./db/data.db', (err) => {
    if (err) {
        console.error(err.message);
    };
    console.log('Connected to the database.');
});


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS DATA(
        id INT AUTO_INCREMENT PRIMARY KEY,
        strMeal TEXT,
        strCategory TEXT,
        strInstructions TEXT,
        strMealThumb TEXT,
        strYoutube TEXT,
        strIngredient1 TEXT,
        strIngredient2 TEXT,
        strIngredient3 TEXT,
        strIngredient4 TEXT,
        strIngredient5 TEXT,
        strIngredient6 TEXT,
        strIngredient7 TEXT,
        strIngredient8 TEXT,
        strIngredient9 TEXT,
        strIngredient10 TEXT,
        strIngredient11 TEXT,
        strIngredient12 TEXT,
        strIngredient13 TEXT,
        strIngredient14 TEXT,
        strIngredient15 TEXT,
        strIngredient16 TEXT,
        strIngredient17 TEXT,
        strIngredient18 TEXT,
        strIngredient19 TEXT,
        strIngredient20 TEXT,
        strMeasure1 TEXT,
        strMeasure2 TEXT,
        strMeasure3 TEXT,
        strMeasure4 TEXT,
        strMeasure5 TEXT,
        strMeasure6 TEXT,
        strMeasure7 TEXT,
        strMeasure8 TEXT,
        strMeasure9 TEXT,
        strMeasure10 TEXT,
        strMeasure11 TEXT,
        strMeasure12 TEXT,
        strMeasure13 TEXT,
        strMeasure14 TEXT,
        strMeasure15 TEXT,
        strMeasure16 TEXT,
        strMeasure17 TEXT,
        strMeasure18 TEXT,
        strMeasure19 TEXT,
        strMeasure20 TEXT
    )`, (err, row) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Create database and table");
    });

    for (let i = 0; i < recipeArray.length; i++) {
        db.run(`INSERT INTO DATA (
        strMeal,
        strCategory,
        strInstructions,
        strMealThumb,
        strYoutube,
        strIngredient1,
        strIngredient2,
        strIngredient3,
        strIngredient4,
        strIngredient5,
        strIngredient6,
        strIngredient7,
        strIngredient8,
        strIngredient9,
        strIngredient10,
        strIngredient11,
        strIngredient12,
        strIngredient13,
        strIngredient14,
        strIngredient15,
        strIngredient16,
        strIngredient17,
        strIngredient18,
        strIngredient19,
        strIngredient20,
        strMeasure1,
        strMeasure2,
        strMeasure3,
        strMeasure4,
        strMeasure5,
        strMeasure6,
        strMeasure7,
        strMeasure8,
        strMeasure9,
        strMeasure10,
        strMeasure11,
        strMeasure12,
        strMeasure13,
        strMeasure14,
        strMeasure15,
        strMeasure16,
        strMeasure17,
        strMeasure18,
        strMeasure19,
        strMeasure20
        ) VALUES (
        '${recipeArray[i].strMeal.replaceAll('\'','\'\'').toLowerCase()}',
        '${recipeArray[i].strCategory.toLowerCase()}',
        '${recipeArray[i].strInstructions.replaceAll('\'','\'\'')}',
        '${recipeArray[i].strMealThumb}',
        '${recipeArray[i].strYoutube}',
        '${recipeArray[i].strIngredient1 === null ? "" : recipeArray[i].strIngredient1}',
        '${recipeArray[i].strIngredient2 === null ? "" : recipeArray[i].strIngredient2}',
        '${recipeArray[i].strIngredient3 === null ? "" : recipeArray[i].strIngredient3}',
        '${recipeArray[i].strIngredient4 === null ? "" : recipeArray[i].strIngredient4}',
        '${recipeArray[i].strIngredient5 === null ? "" : recipeArray[i].strIngredient5}',
        '${recipeArray[i].strIngredient6 === null ? "" : recipeArray[i].strIngredient6}',
        '${recipeArray[i].strIngredient7 === null ? "" : recipeArray[i].strIngredient7}',
        '${recipeArray[i].strIngredient8 === null ? "" : recipeArray[i].strIngredient8}',
        '${recipeArray[i].strIngredient9 === null ? "" : recipeArray[i].strIngredient9}',
        '${recipeArray[i].strIngredient10 === null ? "" : recipeArray[i].strIngredient10}',
        '${recipeArray[i].strIngredient11 === null ? "" : recipeArray[i].strIngredient11}',
        '${recipeArray[i].strIngredient12 === null ? "" : recipeArray[i].strIngredient12}',
        '${recipeArray[i].strIngredient13 === null ? "" : recipeArray[i].strIngredient13}',
        '${recipeArray[i].strIngredient14 === null ? "" : recipeArray[i].strIngredient14}',
        '${recipeArray[i].strIngredient15 === null ? "" : recipeArray[i].strIngredient15}',
        '${recipeArray[i].strIngredient16 === null ? "" : recipeArray[i].strIngredient16}',
        '${recipeArray[i].strIngredient17 === null ? "" : recipeArray[i].strIngredient17}',
        '${recipeArray[i].strIngredient18 === null ? "" : recipeArray[i].strIngredient18}',
        '${recipeArray[i].strIngredient19 === null ? "" : recipeArray[i].strIngredient19}',
        '${recipeArray[i].strIngredient20 === null ? "" : recipeArray[i].strIngredient20}',
        '${recipeArray[i].strMeasure1 === null ? "" : recipeArray[i].strMeasure1}',
        '${recipeArray[i].strMeasure2 === null ? "" : recipeArray[i].strMeasure2}',
        '${recipeArray[i].strMeasure3 === null ? "" : recipeArray[i].strMeasure3}',
        '${recipeArray[i].strMeasure4 === null ? "" : recipeArray[i].strMeasure4}',
        '${recipeArray[i].strMeasure5 === null ? "" : recipeArray[i].strMeasure5}',
        '${recipeArray[i].strMeasure6 === null ? "" : recipeArray[i].strMeasure6}',
        '${recipeArray[i].strMeasure7 === null ? "" : recipeArray[i].strMeasure7}',
        '${recipeArray[i].strMeasure8 === null ? "" : recipeArray[i].strMeasure8}',
        '${recipeArray[i].strMeasure9 === null ? "" : recipeArray[i].strMeasure9}',
        '${recipeArray[i].strMeasure10 === null ? "" : recipeArray[i].strMeasure10}',
        '${recipeArray[i].strMeasure11 === null ? "" : recipeArray[i].strMeasure11}',
        '${recipeArray[i].strMeasure12 === null ? "" : recipeArray[i].strMeasure12}',
        '${recipeArray[i].strMeasure13 === null ? "" : recipeArray[i].strMeasure13}',
        '${recipeArray[i].strMeasure14 === null ? "" : recipeArray[i].strMeasure14}',
        '${recipeArray[i].strMeasure15 === null ? "" : recipeArray[i].strMeasure15}',
        '${recipeArray[i].strMeasure16 === null ? "" : recipeArray[i].strMeasure16}',
        '${recipeArray[i].strMeasure17 === null ? "" : recipeArray[i].strMeasure17}',
        '${recipeArray[i].strMeasure18 === null ? "" : recipeArray[i].strMeasure18}',
        '${recipeArray[i].strMeasure19 === null ? "" : recipeArray[i].strMeasure19}',
        '${recipeArray[i].strMeasure20 === null ? "" : recipeArray[i].strMeasure20}'
        )`, (err, row) => {
            if (err) {
                console.error(err.message);
                console.log(recipeArray[i].strMeal)
            }
            console.log("Insert into data");
        })
    }

});




db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});

