import express from "express";
import Auth from './auth.js';
import { Verify, VerifyRole } from "../middleware/verify.js";



const app = express();

app.use('/app/auth', Auth);

app.disable("x-powered-by");

app.get("/app", (req, res) => {
    try {
        res.status(200).json({
            status: "success",
            data: [],
            message: "Welcome to our API homepage!",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
});

app.get("/app/user", Verify, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to the your Dashboard!",
    });
});

app.get("/app/admin", Verify, VerifyRole, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to the Admin portal!",
    });
});

export default app;