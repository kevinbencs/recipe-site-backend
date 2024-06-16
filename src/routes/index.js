import express from "express";
import Auth from './auth.js';
import { Verify } from "../middleware/verify.js";

const app = express();

app.use(Auth);

app.disable("x-powered-by");

app.get('/getaccount', Verify);

export default app;