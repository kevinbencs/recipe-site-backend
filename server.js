import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { PORT, URI } from "./src/config/config.js";
import App from "./src/routes/index.js";
import {db} from "./src/db/db.js";

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
    })
    .then(console.log("Connected to database"))
    .catch((err) => console.log(err));


server.listen(PORT, () => {
    console.log(`server is running in http://localhost:${PORT}`);
})

server.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
});

process.on('SIGINT', async() => {
    await mongoose.disconnect();
    db.close((err) => {
        if (err) {
            console.log('DB Close Error:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
