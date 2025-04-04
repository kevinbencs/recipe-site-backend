import User from "../models/user.js";
import bcrypt from "bcrypt";
import Blacklist from '../models/blacklist.js';
import jwt from "jsonwebtoken";
import { SECRET_ACCESS_TOKEN } from '../config/config.js';
import Newsletter from "../models/newsletter.js";
import Comment from "../models/comment.js";
import { myCache } from "../db/db.js";
import { db } from "../db/db.js";



async function queryDB(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) { console.log(err); reject(err); }
            else resolve(rows);
        });
    });
}



/**
 * @route POST /register
 * @desc Registers a user
 */
export async function Register(req, res) {
    // get required variables from request body
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
        console.log(existingUser);
        if (existingUser)
            return res.status(400).json({
                error: "It seems you already have an account, please log in instead.",
            });

        await newUser.save(); // save new user into the database
        if (newsletter === true) {
            const existingNewsletter = await Newsletter.findOne({ email });

            if (!existingNewsletter) {
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
        return res.status(200).json({
            success: 'Thank you for registering with us. Your account has been successfully created.',
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            error: 'Server Error',
        });
    }
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
                error: "Account does not exist",
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
                error: "Invalid email or password. Please try again with the correct credentials.",
            });

        let options = {
            httpOnly: true, // The cookie is only accessible by the web server
            secure: true,
            sameSite: 'lax'
        };

        const token = user.generateAccessJWT(); // generate session token for user
        res.cookie("SessionID", token, options); // set the token to response header, so that the client sends it back on each subsequent request
        return res.status(200).json({
            success: user.name
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            error: 'Server error'
        });
    }
}



/**
 * @route GET /logout
 * @desc Logout user
 */
export async function Logout(req, res) {
    try {
        const Header = req.headers['cookie']; // get the session cookie from request header
        if (!Header) return res.status(200).json({ success: 'You are logged out!' });
        const cookie = Header.split(";").filter(item => item.indexOf('SessionID') > -1)[0]; // If there is, split the cookie string to get the actual jwt
        if(!cookie) return res.status(200).json({ success: 'You are logged out!' });
        const accessToken = cookie.split("=")[1];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
        // if true, send a no content response.
        if (checkIfBlacklisted) return res.status(200).json({ success: 'You are logged out!' });
        // otherwise blacklist token
        const newBlacklist = new Blacklist({
            token: accessToken,
        });
        await newBlacklist.save();
        // Also clear request cookie on client
        res.clearCookie("SessionID", {
            httpOnly: true, 
            secure: true,
            sameSite: 'lax'
        })
        return res.status(200).json({ success: 'You are logged out!' });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            error: 'Server Error',
        });
    }
};


/**
 * @route POST /api/forgotpassword
 * @desc Change password
 */

export async function ForgotPassword(req, res) {
    try {
        const email = req.body.email;

        return res.status(200).json({success: 'Sorry, we cannot send email.'})
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: 'Server Error',
        });
    }
}

/**
 * @route POST /newpassword
 * @desc Change password
 */
export async function updatePassword(req, res) {
    try {
        const Header = req.headers['cookie'];// get the session cookie from request header
        let newPassword = String(req.body.password);

        if (!Header) return res.status(401).json({error: 'Please log in.'}); // No content
        const cookie = Header.split(";").filter(item => item.indexOf('SessionID') > -1)[0]; // If there is, split the cookie string to get the actual jwt
        if(!cookie) return res.status(401).json({error: 'Please log in.'});
        const accessToken = cookie.split("=")[1];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
        // if true, send a no content response.
        if (checkIfBlacklisted) return res.status(401).json({ error: "This session has expired. Please login" });

        const decoded = jwt.verify(accessToken, SECRET_ACCESS_TOKEN)

        const { id } = decoded; // get user id from the decoded token
        const user = await User.findById(id); // find user by that `id`
        const result = await User.updateOne({ email: user.email }, { $set: { password: newPassword } });

        if (result.modifiedCount === 1) {
            return res.status(200).json({
                success: 'Password changed.'
            })
        }
        else {
            return res.status(200).json({
                error: "New password and old password are same."
            })
        }

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: 'Server Error',
        });
    }
};


/**
 * @route POST /getcomment
 * @desc Get comments
 */
export async function GetComments(req, res) {
    try {
        const mealId = String(req.params.recipeId);
        const Header = req.headers['cookie'];// get the session cookie from request header

        if (!Header) {
            const rows = await Comment.find({ mealId: mealId });
            if (rows.length !== 0) {
                return res.status(200).json(rows);
            }
            else {
                return res.status(200).json([]);
            }
        }
        else {

            
            const cookie = Header.split(";").filter(item => item.indexOf('SessionID') > -1)[0]; // If there is, split the cookie string to get the actual jwt
            if(!cookie) {
                const rows = await Comment.find({ mealId: mealId });
            if (rows.length !== 0) {
                return res.status(200).json(rows);
            }
            else {
                return res.status(200).json([]);
            }
            }
            const accessToken = cookie.split("=")[1];
            const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted

            if (checkIfBlacklisted) {
                const rows = await Comment.find({ mealId: mealId });

                if (rows.length !== 0) {

                    return res.status(200).json(rows);
                }
                else {

                    return res.status(200).json([]);
                }

            }

            const decoded = jwt.verify(accessToken, SECRET_ACCESS_TOKEN)

            const { id } = decoded; // get user id from the decoded token
            const user = await User.findById(id); // find user by that `id`

            const rows = await Comment.find({ mealId: mealId });

            if (rows.length !== 0) {
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].email === user.email) rows[i].canChange = 'true';
                }
                return res.status(200).json(rows);
            }
            else {

                return res.status(200).json([]);
            }


        }

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: 'Server Error',
        });
    }
};


/**
 * @route POST /sendcomment
 * @desc Send comment
 */
export async function SendComment(req, res) {
    try {
        const mealId = String(req.params.recipeId);
        const comment = req.body.comment;
        const Header = req.headers['cookie'];// get the session cookie from request header
        
        if (!Header) return res.status(401).json({ error: "Please login" }); // No content
        const cookie = Header.split(";").filter(item => item.indexOf('SessionID') > -1)[0]; // If there is, split the cookie string to get the actual jwt
        if(!cookie) return res.status(204).json({ error: "Please login" }); // No content
        const accessToken = cookie.split("=")[1];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
        // if true, send a no content response.
        if (checkIfBlacklisted) return res.status(401).json({ error: "This session has expired. Please login" });

        const decoded = jwt.verify(accessToken, SECRET_ACCESS_TOKEN)

        const { id } = decoded; // get user id from the decoded token
        const user = await User.findById(id); // find user by that `id`


        const newComment = new Comment({
            comment,
            mealId,
            email: user.email,
            name: user.name,
            canChange: 'false'
        })

        await newComment.save();

        return res.status(200).json({ success: 'Comment saved' });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: 'Server Error',
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
        if (existingNewsletter) {
            return res.status(400).json({
                error: "It seems you already have a subscription."
            });
        }

        if (newUser.meat === 'false' && newUser.vegetarian === 'false' && newUser.dessert === 'false' &&
            newUser.pasta === 'false' && newUser.seafood === 'false' && newUser.side === 'false')
            return res.status(400).json({
                error: "Please select min one option."
            });

        await newUser.save(); // save new user into the database
        return res.status(200).json({
            success:
                'Thank you for your subscription.',
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            error: 'Server Error',
        });
    }
};




/**
 * @route POST /updatecomment
 * @desc Update a comment
 */
export async function UpdateComment(req, res) {
    const comment = req.body.comment;
    const _id = req.params.Id;

    try {

        const Header = req.headers['cookie'];// get the session cookie from request header

        if (!Header) return res.status(401).json({ error: " Please login" });
        
        const cookie = Header.split(";").filter(item => item.indexOf('SessionID') > -1)[0]; // If there is, split the cookie string to get the actual jwt
        const accessToken = cookie.split("=")[1];
        if(!cookie) return res.status(401).json({ error: "Please login" });; // No content
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
        // if true, send a no content response.
        if (checkIfBlacklisted) return res.status(401).json({ error: "This session has expired. Please login" });

        const decoded = jwt.verify(accessToken, SECRET_ACCESS_TOKEN)

        const { id } = decoded; // get user id from the decoded token
        const user = await User.findById(id); // find user by that `id`
        const commentResult = await Comment.findById(_id);

        if (user.email === commentResult.email) {
            const result = await Comment.findByIdAndUpdate(_id, { $set: { comment: comment } }) 
            if (result) {
                return res.status(204)
            }
            else {
                return res.status(500).json({ error: 'Server error' });
            }
        }
        else {
            return res.status(402).json({ error: 'You cannot change this comment' });
        }

    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            error: "Server error"
        });
    }

};

/**
 * @route POST /deletecomment
 * @desc Delete a comment
 */
export async function DeleteComment(req, res) {
    const _id = req.params.id;
    try {

        const Header = req.headers['cookie'];// get the session cookie from request header

        if (!Header) return res.status(401).json({ error: 'Please login' }); // No content
        const cookie = Header.split(";").filter(item => item.indexOf('SessionID') > -1)[0]; // If there is, split the cookie string to get the actual jwt
        if(!cookie) return res.status(401).json({ error: "Please login" });; // No content
        const accessToken = cookie.split("=")[1];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
        // if true, send a no content response.
        if (checkIfBlacklisted) return res.status(401).json({ error: "This session has expired. Please login" });

        const decoded = jwt.verify(accessToken, SECRET_ACCESS_TOKEN)

        const { id } = decoded; // get user id from the decoded token
        const user = await User.findById(id); // find user by that `id`
        const comment = await Comment.findById(_id);
        if (user.email === comment.email) {
            const result = await Comment.findByIdAndDelete(_id);

            if (result) {

                return res.status(204);
            }
            else {
                return res.status(500).json({ error: 'Comment not deleted' });
            }
        }
        else {
            return res.status(401).json({ error: 'You cannot delete this comment' });
        }

    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            error: 'Server Error',
        });
    }
};



/**
 * @route GET /homePage
 * @desc Get recipe for home page
 */
export async function GetHomePageRecipes(req, res) {
    try {
        const value = myCache.get("mainPage");

        if (value !== undefined) {
            return res.status(200).json({ res: value })
        }

        const result = await queryDB(`SELECT strMeal, strCategory, strInstructions, strMealThumb, id FROM DATA LIMIT 10 `);

        const success = myCache.set("mainPage", result);

        return res.status(200).json({ res: result })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Server error' })
    }

}



/**
 * @route GET /api/category/:category
 * @desc Get recipe for category page
 */
export async function GetCategoryPageRecipes(req, res) {

    try {
        const category = req.params.category;
        const value = myCache.get(`recipes-${category}`);

        if (value !== undefined) {
            return res.status(200).json({ res: value })
        }

        const result1 = await queryDB(`SELECT strMeal, strCategory, strInstructions, strMealThumb, id FROM DATA WHERE strCategory = ?  LIMIT 10 `, [category]);
        const result2 = await queryDB(`SELECT COUNT(id) as length FROM DATA WHERE strCategory = ?  `, [category]);

        const success = myCache.set(`recipes-${category}`, { rec: result1, num: result2[0].length - 1 });

        return res.status(200).json({ res: { rec: result1, num: result2[0].length - 1 } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Server error' })
    }

}


/**
 * @route GET /api/:category/:number
 * @desc Get recipes for category page 
 */
export async function GetCategoryPageRecipesMore(req, res) {

    try {
        const category = req.params.category;
        const numb = Number(req.params.number);

        const value = myCache.get(`recipes-${category}-${numb}`);

        if (value !== undefined) return res.status(200).json({ res: value })

        const result = await queryDB(`SELECT strMeal, strCategory, strInstructions, strMealThumb, id FROM DATA  WHERE strCategory = ?  LIMIT ?, 10 `, [category, numb]);

        const success = myCache.set(`recipes-${category}-${numb}`, result);

        return res.status(200).json({ res: result })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Server error' })
    }

}



/**
 * @route GET /api/title/:title
 * @desc Get recipe description for recipe page
 */
export async function GetRecipePageRecipes(req, res) {

    try {
        const name = req.params.title.replaceAll('-', ' ');
        
        const value = myCache.get(`name-${name}`)
        
        if (value !== undefined) {return res.status(200).json({ res: value })}

        const result = await queryDB(`SELECT * FROM DATA WHERE strMeal = ?`, [name])

        if (result.length === 0) return res.status(200).json({ failed: 'No recipe' })

        const result2 = await queryDB(`SELECT COUNT(*) as length FROM DATA WHERE strCategory = ?  `, [result[0].strCategory]);

        const success = myCache.set(`name-${name}`, { rec: result[0], num: result2[0].length - 1 });

        return res.status(200).json({ res: { rec: result[0], num: result2[0].length - 1 } })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }

}

export async function GetPageRecipesMore(req, res) {
    try {
        const name = req.params.title.replaceAll('-', ' ');
        const numb = Number(req.params.number);

        const value = myCache.get(`name-${name}-num-${numb}`)

        if (value !== undefined) return res.status(200).json({ res: value })

        const category = await queryDB(`SELECT strCategory FROM DATA WHERE strMeal = ?`, [name])

        const result = await queryDB(`SELECT strMeal, strCategory, strInstructions, strMealThumb, id FROM DATA  WHERE strCategory = ? AND strMeal != ? LIMIT ?, 10 `, [category[0].strCategory, name, numb]);

        const success = myCache.set(`name-${name}-num-${numb}`, result);

        return res.status(200).json({ res: result })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }
}

export async function GetSearch(req, res) {
    try {
        const text = '%' + req.params.text.replaceAll('-', ' ') + '%';

        const result = await queryDB(`SELECT strMeal, strCategory, strInstructions, strMealThumb, id FROM DATA WHERE  strMeal LIKE ? OR  strCategory LIKE ?  OR strInstructions LIKE ? LIMIT 10`, [text, text, text])
        const result2 = await queryDB(`SELECT COUNT(id) as length FROM DATA WHERE  strMeal LIKE ? OR  strCategory LIKE ?  OR strInstructions LIKE ?`, [text, text, text])

        return res.status(200).json({ res: { rec: result, num: result2[0].length } })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }

}

export async function GetSearchMore(req, res) {
    try {
        const text = '%' + req.params.text.replaceAll('-', ' ') + '%';
        const numb = Number(req.params.number)

        const result = await queryDB(`SELECT strMeal, strCategory, strInstructions, strMealThumb, id FROM DATA WHERE  strMeal LIKE ? OR  strCategory LIKE ?  OR strInstructions LIKE ? LIMIT ?, 10`, [text, text, text, numb + 10])

        return res.status(200).json({ res: result, })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }

}