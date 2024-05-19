import User from "../models/user.js";
import bcrypt from "bcrypt";
import Blacklist from '../models/blacklist.js';
import jwt from "jsonwebtoken";
import { SECRET_ACCESS_TOKEN } from '../config/config.js';
import sqlite3 from 'sqlite3';
import Newsletter from "../models/newsletter.js";



/**
 * @route POST /register
 * @desc Registers a user
 */
export async function Register(req, res) {
    // get required variables from request body
    // using es6 object destructing
    const { name, email, password, newsletter } = req.body;
    try {
        // create an instance of a user
        const newUser = new User({
            name,
            email,
            password,
            newsletter
        });
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "It seems you already have an account, please log in instead.",
            });
        await newUser.save(); // save new user into the database
        res.status(200).json({
            status: 'success',
            data: [],
            message:
                'Thank you for registering with us. Your account has been successfully created.',
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: 'Internal Server Error',
        });
    }
    res.end();
}


/**
 * @route POST /login
 * @desc logs in a user
 */
export async function Login(req, res) {
    // Get variables for the login process
    const { email } = req.body;
    try {
        // Check if user exists
        const user = await User.findOne({ email }).select("+password");
        if (!user)
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Account does not exist",
            });

        // if user exists
        // validate password
        const isPasswordValid = await bcrypt.compare(
            `${req.body.password}`,
            user.password
        );

        // if not valid, return unathorized response
        if (!isPasswordValid)
            return res.status(401).json({
                status: "failed",
                data: [],
                message:
                    "Invalid email or password. Please try again with the correct credentials.",
            });

        let options = {
            maxAge: 20 * 60 * 1000, // would expire in 20minutes
            httpOnly: true, // The cookie is only accessible by the web server
            secure: false,
            sameSite: 'lax'
        };
        console.log(isPasswordValid);
        const token = user.generateAccessJWT(); // generate session token for user
        res.cookie("SessionID", token, options); // set the token to response header, so that the client sends it back on each subsequent request
        res.status(200).json({
            status: "success",
            data: user.name,
            message: "You have successfully logged in.",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
    res.end();
}



/**
 * @route GET /logout
 * @desc Logout user
 */
export async function Logout(req, res) {
    try {
        const Header = req.headers['cookie']; // get the session cookie from request header
        if (!Header) return res.sendStatus(204); // No content
        const cookie = Header.split('=')[1]; // If there is, split the cookie string to get the actual jwt token
        const accessToken = cookie.split(';')[0];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
        // if true, send a no content response.
        if (checkIfBlacklisted) return res.sendStatus(204);
        // otherwise blacklist token
        const newBlacklist = new Blacklist({
            token: accessToken,
        });
        await newBlacklist.save();
        // Also clear request cookie on client
        res.setHeader('Clear-Site-Data', '"cookies"');
        res.status(200).json({ message: 'You are logged out!' });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
    res.end();
};

/**
 * @route POST /newpassword
 * @desc Change password
 */
export async function updatePassword(req, res) {
    try {
        const Header = req.headers['cookie'];// get the session cookie from request header
        let newPassword = String(req.body.password);

        if (!Header) return res.sendStatus(401); // No content
        const cookie = Header.split('=')[1]; // If there is, split the cookie string to get the actual jwt token
        const accessToken = cookie.split(';')[0];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
        // if true, send a no content response.
        if (checkIfBlacklisted) return res.sendStatus(401).json({ message: "This session has expired. Please login" });

        // Verify using jwt to see if token has been tampered with or if it has expired.
        // that's like checking the integrity of the cookie
        jwt.verify(cookie, SECRET_ACCESS_TOKEN, async (err, decoded) => {
            if (err) {
                // if token has been altered or has expired, return an unauthorized error
                return res
                    .status(401)
                    .json({ message: "This session has expired. Please login" });
            }

            const { id } = decoded; // get user id from the decoded token
            const user = await User.findById(id); // find user by that `id`
            const result = await User.updateOne({ email: user.email }, { $set: { password: newPassword } });
            console.log(result);

            if (result.modifiedCount === 1) {
                res.status(200).json({
                    status: 'success',
                    message: 'Password changed.'
                })
            }
            else {
                res.status(204).json({
                    status: "failed",
                    message: "New password and old password are same."
                })
            }
        });
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
};


/**
 * @route POST /getcomment
 * @desc Get comments
 */
export async function GetComments(req, res) {
    const mealId = req.body.mealId;
    const Header = req.headers['cookie'];// get the session cookie from request header
    const sqlite = sqlite3.verbose();
    let comments;

    let db = new sqlite.Database('../db/comment.db', (err) => {
        if (err) {
            console.error(err.message);
        };
        console.log('Connected to the database.');
    });

    db.serialize(() => {
        db.all(`SELECT * FROM COMMENTS WHERE mealId = ?`, [req.body.mealId], (err, row) => {
            if (err) console.log(err.message);
            comments = row;
        })
    })

    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });

    if (!Header) return res.sendStatus(201); // No content
    const cookie = Header.split('=')[1]; // If there is, split the cookie string to get the actual jwt token
    const accessToken = cookie.split(';')[0];
    const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
    // if true, send a no content response.
    if (checkIfBlacklisted) return res.sendStatus(401).json({ message: "This session has expired. Please login" });

    // Verify using jwt to see if token has been tampered with or if it has expired.
    // that's like checking the integrity of the cookie
    jwt.verify(cookie, SECRET_ACCESS_TOKEN, async (err, decoded) => {
        if (err) {
            // if token has been altered or has expired, return an unauthorized error
            return res
                .status(401)
                .json({ message: "This session has expired. Please login" });
        }

        const { id } = decoded; // get user id from the decoded token
        const user = await User.findById(id); // find user by that `id`
        for (let i = 0; i < comments.length; i++) {
            if (comments[i].email === user.email) comments[i].canChange = 'true';
        }

        res.send(comments);
    });
};


/**
 * @route POST /sendcomment
 * @desc Sedn comment
 */
export async function SendComment(req, res) {
    const mealId = req.body.mealId;
    const Header = req.headers['cookie'];// get the session cookie from request header
    const sqlite = sqlite3.verbose();
    let comments;

    let db = new sqlite.Database('../db/comment.db', (err) => {
        if (err) {
            console.error(err.message);
        };
        console.log('Connected to the database.');
    });



    if (!Header) return res.sendStatus(201); // No content
    const cookie = Header.split('=')[1]; // If there is, split the cookie string to get the actual jwt token
    const accessToken = cookie.split(';')[0];
    const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
    // if true, send a no content response.
    if (checkIfBlacklisted) return res.sendStatus(401).json({ message: "This session has expired. Please login" });

    // Verify using jwt to see if token has been tampered with or if it has expired.
    // that's like checking the integrity of the cookie
    jwt.verify(cookie, SECRET_ACCESS_TOKEN, async (err, decoded) => {
        if (err) {
            // if token has been altered or has expired, return an unauthorized error
            return res
                .status(401)
                .json({ message: "This session has expired. Please login" });
        }

        const { id } = decoded; // get user id from the decoded token
        const user = await User.findById(id); // find user by that `id`

        db.serialize(() => {
            db.run(`ISERT INTO COMMENTS (
                comment TEXT,
                mealId INT,
                email TEXT,
                canChange TEXT,
            ) VALUE (?, ?, ?, ?)`, [req.body.comment, req.body.mealId, user.email, 'false'], (err) => {
                if (err) console.log(err.message);
            })
        })

        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });

    });
};


/**
 * @route POST /newsletter
 * @desc Subsribe newsletter
 */
export async function Subscribe(req, res) {
    // get required variables from request body
    // using es6 object destructing
    const { name, email, meat, vegetable, dessert, pasta, seafood, side } = req.body;
    try {
        // create an instance of a user
        const newUser = new Newsletter({
            name,
            email,
            meat,
            vegetable,
            dessert,
            pasta,
            seafood,
            side
        });
        // Check if user already exists
        const existingNewsletter = await Newsletter.findOne({ email });
        if (existingNewsletter)
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "It seems you already have a subscription.",
            });
        if (newUser.meat === 'false' && newUser.vegetable === 'false' && newUser.dessert === 'false' &&
            newUser.pasta === 'false' && newUser.seafood === 'false' && newUser.side === 'false')
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "Please select min one option.",
            });

        await newUser.save(); // save new user into the database
        res.status(200).json({
            status: 'success',
            data: [],
            message:
                'Thank you for your subscription.',
        });
    } catch (err) {
        console.log(err.message)
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: 'Internal Server Error',
        });
    }
    res.end();
}
