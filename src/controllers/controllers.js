import User from "../models/user.js";
import bcrypt from "bcrypt";
import Blacklist from '../models/blacklist.js';
import jwt from "jsonwebtoken";
import { SECRET_ACCESS_TOKEN } from '../config/config.js';
import sqlite3 from 'sqlite3';
import Newsletter from "../models/newsletter.js";
import path from 'path';
import { fileURLToPath } from "url";

const sqlite = sqlite3.verbose();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbData = path.resolve(__dirname, '../db/data.db');
const dbComment = path.resolve(__dirname, '../db/comment.db');

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
            password
        });
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({
                status: "failed",
                message: "It seems you already have an account, please log in instead.",
            });
        await newUser.save(); // save new user into the database
        if (newsletter === true){
            const existingNewsletter = await Newsletter.findOne({email});
            
            if(!existingNewsletter) {
                const newNewsletter = new Newsletter({
                    email,
                    name,
                    vegetarian: "true",
                    pasta: "true",
                    seafood: "true",
                    side: "true",
                    dessert: "true",
                    meat: "true"
                })
                await newNewsletter.save();
            }
        }
        res.status(200).json({
            status: 'success',
            message:
                'Thank you for registering with us. Your account has been successfully created.',
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
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
                message:
                    "Invalid email or password. Please try again with the correct credentials.",
            });

        let options = {
            httpOnly: true, // The cookie is only accessible by the web server
            secure: false,
            sameSite: 'lax'
        };

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
 * @route PATCH /newpassword
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

        jwt.verify(accessToken, SECRET_ACCESS_TOKEN, async (err, decoded) => {
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
 * @route GET /getcomment/:recipeId
 * @desc Get comments
 */
export async function GetComments(req, res) {
    try {
        const mealId = req.param.recipeId;
        const Header = req.headers['cookie'];// get the session cookie from request header
        const sqlite = sqlite3.verbose();

        let db = new sqlite.Database(dbComment, sqlite.OPEN_READONLY, (err) => {
            if (err) {
                console.error(err.message);

            };
        });

        if (!Header) {
            db.serialize(() => {
                db.all(`SELECT * FROM COMMENTS WHERE mealId = ?`, [Number(mealId)], (err, row) => {
                    if (err) console.log(err.message);
                    res.status(200).json(row);
                })
            })

            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
            });
            return
        }
        else {
            const cookie = Header.split('=')[1]; // If there is, split the cookie string to get the actual jwt token
            const accessToken = cookie.split(';')[0];
            const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted

            jwt.verify(accessToken, SECRET_ACCESS_TOKEN, async (err, decoded) => {
                if (err) {
                    // if token has been altered or has expired, return an unauthorized error
                    db.close((err) => {
                        if (err) {
                            console.error(err.message);
                        }
                    });
                    return res
                        .status(401)
                        .json({ message: "This session has expired. Please login" });

                }
                const { id } = decoded; // get user id from the decoded token
                const user = await User.findById(id); // find user by that `id`

                db.serialize(() => {
                    db.all(`SELECT * FROM COMMENTS WHERE mealId = ?`, [mealId], (err, row) => {
                        if (err) console.log(err.message);
                        for (let i = 0; i < row.length; i++) {
                            if (row[i].email === user.email) row[i].canChange = 'true';
                        }
                        res.status(200).json(row);
                    })
                })

                db.close((err) => {
                    if (err) {
                        console.error(err.message);
                    }
                });

            });
        }

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
 * @route POST /sendcomment/:recipeId
 * @desc Send comment
 */
export async function SendComment(req, res) {
    try {
        const mealId = req.param.recipeId;
        const comment = req.body.comment;
        const Header = req.headers['cookie'];// get the session cookie from request header

        if (!Header) return res.status(400); // No content
        const cookie = Header.split('=')[1]; // If there is, split the cookie string to get the actual jwt token
        const accessToken = cookie.split(';')[0];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
        // if true, send a no content response.
        if (checkIfBlacklisted) return res.sendStatus(401).json({ message: "This session has expired. Please login" });

        jwt.verify(accessToken, SECRET_ACCESS_TOKEN, async (err, decoded) => {
            if (err) {
                // if token has been altered or has expired, return an unauthorized error
                return res
                    .status(401)
                    .json({ message: "This session has expired. Please login" });
            }

            const { id } = decoded; // get user id from the decoded token
            const user = await User.findById(id); // find user by that `id`

            let db = new sqlite.Database(dbComment, sqlite.OPEN_READWRITE, (err) => {
                if (err) {
                    console.error(err.message);
                    res.status(400).json({ status: "failed" });
                };
            });

            db.serialize(() => {
                db.run(`INSERT INTO COMMENTS (
                comment,
                mealId,
                email,
                name,
                canChange
            ) VALUES ( ? , ? , ? , ? , ?)`, [comment, Number(mealId), user.email, user.name, 'false'], (err) => {
                    if (err) {
                        console.log(err.message);
                        res.status(400).json({ status: "failed" });
                    }
                })
            })

            db.close((err) => {
                if (err) {
                    console.error(err.message);
                    res.status(400).json({ status: "failed" });
                }
                res.status(200).json({ status: "succes" });
            });

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
 * @route POST /newsletter
 * @desc Subsribe for newsletter
 */
export async function Subscribe(req, res) {
    // get required variables from request body
    // using es6 object destructing
    const { name, email, meat, vegetarian, dessert, pasta, seafood, side } = req.body;
    try {
        // create an instance of a user
        const newUser = new Newsletter({
            name,
            email,
            meat,
            vegetarian,
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
                message: "Please select min one option.",
            });

        await newUser.save(); // save new user into the database
        res.status(200).json({
            status: 'success',
            message:
                'Thank you for your subscription.',
        });
    } catch (err) {
        console.log(err.message)
        res.status(500).json({
            status: "error",
            code: 500,
            message: 'Internal Server Error',
        });
    }
    res.end();
};


/**
 * @route POST /
 * @desc Get recipe for home page
 */
export function GetHomePageRecipes(req, res) {
    const name = req.body.name;
    if (typeof name === "string") {
        const db = new sqlite.Database(dbData, sqlite.OPEN_READONLY, (err) => {
            if (err) {
                console.log(err.message);
            }
        })

        db.serialize(() => {
            db.all(`SELECT strMeal, strCategory, strInstructions, strMealThumb, id FROM DATA WHERE strMeal LIKE ? `, ['%' + name + '%'], (err, meals) => {
                if (err) {
                    console.log(err.message);
                }
                res.send(meals);

            })
        });

        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
        })
    }
    else {
        res.send({ error: "error" });
    }

}


/**
 * @route PATCH /updatecomment/:recipeId
 * @desc Update a comment
 */
export async function UpdateComment(req, res) {
    const id = req.param.recipeId
    const { comment } = req.body;
    if (typeof comment === 'string') {
        try {
            const db = new sqlite.Database(dbComment, sqlite.OPEN_READWRITE, (err) => {
                if (err) {
                    console.log(err.message);
                }
            })
            db.serialize(() => {
                db.run(`UPDATE COMMENTS SET comment = ? WHERE id = ? `, [comment, Number(id)], (err) => {
                    if (err) {
                        console.log(err.message);
                    }
                })
            });

            db.close((err) => {
                if (err) {
                    console.log(err.message);
                }
                res.status(200).json({ code: 200 });
            })
        }
        catch (err) {
            res.status(500).json({
                status: "error",
                code: 500,
                message: 'Internal Server Error',
            });
        }
    }
    else {
        res.status(400).json({
            status: "error"
        });
    }
};

/**
 * @route DELETE /deletecomment/:recipeId
 * @desc Delete a comment
 */
export async function DeleteComment(req, res) {
    try {
        const id = req.param.recipeId;
        const db = new sqlite.Database(dbComment, sqlite.OPEN_READWRITE, (err) => {
            if (err) {
                console.log(err.message);
            }
        })
        db.serialize(() => {
            db.run(`DELETE FROM COMMENTS  WHERE id = ? `, [Number(id)], (err) => {
                if (err) {
                    console.log(err.message);
                }
            })
        });

        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
            res.status(200).json({ code: 200 });
        })
    }
    catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            message: 'Internal Server Error',
        });
    }
};


/**
 * @route GET /category/:name
 * @desc Get recipe for category page
 */
export function GetCategoryPageRecipes(req, res) {
    const category = req.param.name;
    if (typeof category === "string") {
        const db = new sqlite.Database(dbData, sqlite.OPEN_READONLY, (err) => {
            if (err) {
                console.log(err.message);
            }
        })

        db.serialize(() => {
            db.all(`SELECT strMeal, strCategory, strInstructions, strMealThumb, id FROM DATA WHERE strCategory = ? `, [category], (err, meals) => {
                if (err) {
                    console.log(err.message);
                }
                res.send(meals);
            });
        });

        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
        })
    }
    else {
        res.status(500).json({
            status: "error",
            code: 500,
            message: 'Internal Server Error',
        });
    }
}


/**
 * @route GET /recipe/:name
 * @desc Get recipe for recipe page
 */
export function GetRecipePageRecipes(req, res) {
    const name = req.param.name;
    if (typeof name === "string") {
        const db = new sqlite.Database(dbData, sqlite.OPEN_READONLY, (err) => {
            if (err) {
                console.log(err.message);
            }
        })

        db.serialize(() => {
            db.all(`SELECT * FROM DATA WHERE strMeal = ? `, [name], (err, meal) => {
                if (err) {
                    console.log(err.message);
                }
                res.status(200).json(meal);

            })
        });

        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
        })
    }
    else {
        res.status(500).json({
            status: "error",
            code: 500,
            message: 'Internal Server Error',
        });
    }

}