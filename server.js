import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { PORT, URI } from "./src/config/config.js";
import App from "./src/routes/index.js";


const sqlite = sqlite3.verbose();
const __dirname = path.dirname(fileURLToPath(import.meta.url))


const server = express();
server.use(cors());
server.use(cookieParser());
server.disable("x-powered-by"); //Reduce fingerprinting
server.use(express.static(path.join(__dirname, 'public')));
server.use(urlencoded({ extended: false }));
server.use(express.json({
    type: ['application/json', 'text/plain']
}));
server.use(App);


mongoose.promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose
    .connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log("Connected to database"))
    .catch((err) => console.log(err));


server.listen(PORT, () => {
    console.log(`server is running in http://localhost:${PORT}`);
})

server.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
});



server.post("/", (req, res) => {
    const name = req.body.name;
    if (typeof name === "string") {
        const db = new sqlite.Database("./src/db/data.db", sqlite.OPEN_READONLY, (err) => {
            if (err) {
                console.log(err.message);
            }
            console.log('Connected to the database.');
        })

        db.serialize(() => {
            db.all(`SELECT strMeal, strCategory, strInstructions, strMealThumb, id FROM DATA WHERE strMeal LIKE ? `, ['%' + name + '%'], (err, meals) => {
                if (err) {
                    console.log(err.message);
                }
                console.log('Select from database.');
                res.send(meals);

            })
        });

        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
            console.log('Close the database connection.');
        })
    }
    else{
        res.send({error: "error"});
    }

});




server.post("/category", (req, res) => {
    const category = req.body.category;
    if (typeof category === "string") {
        const db = new sqlite.Database("./src/db/data.db", sqlite.OPEN_READONLY, (err) => {
            if (err) {
                console.log(err.message);
            }
            console.log('Connected to the database.');
        })

        db.serialize(() => {
            db.all(`SELECT strMeal, strCategory, strInstructions, strMealThumb, id FROM DATA WHERE strCategory = ? `, [category], (err, meals) => {
                if (err) {
                    console.log(err.message);
                }
                console.log(category);
                res.send(meals);
            });
        });

        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
            console.log('Close the database connection.');
        })
    }
    else{
        res.send({error: "error"});
    }

});


server.post("/recipe", (req, res) => {
    const name = req.body.name;
    if (typeof name === "string") {
        const db = new sqlite.Database("./src/db/data.db", sqlite.OPEN_READONLY, (err) => {
            if (err) {
                console.log(err.message);
            }
            console.log('Connected to the database.');
        })

        db.serialize(() => {
            db.all(`SELECT * FROM DATA WHERE strMeal = ? `, [ name], (err, meal) => {
                if (err) {
                    console.log(err.message);
                }
                console.log('Select from database.');
                console.log(meal);
                res.send(meal);

            })
        });

        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
            console.log('Close the database connection.');
        })
    }
    else{
        res.send({error: "error"});
    }

});


