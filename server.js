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
