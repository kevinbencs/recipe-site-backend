import express from "express";
import { Register, Login, Logout, updatePassword, GetComments, SendComment, Subscribe, GetHomePageRecipes, UpdateComment, DeleteComment } from "../controllers/controllers.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import { Verify } from "../middleware/verify.js";

const router = express.Router();

// Register route -- POST request
router.post(
    "/signup",
    check("name")
        .notEmpty()
        .withMessage("You name is required.")
        .trim()
        .escape(),
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address.")
        .normalizeEmail(),
    check("password")
        .notEmpty()
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1
        })
        .withMessage("Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number."),
    check("password2")
        .custom((value, { req }) => {
            return value === req.body.password;
        })
        .withMessage("Passwords must be equals."),
    check("term")
        .equals("true")
        .withMessage("By creating an account, you agree to privacy notice."),
    Validate,
    Register
);

// Login route == POST request
router.post(
    "/signin",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail(),
    check("password")
        .notEmpty()
        .withMessage("Enter valid password"),
    Validate,
    Login
);

// Logout route == GET request
router.get('/logout', Logout);

//New password route == POST request
router.post(
    "/newpassword",
    check("password")
        .notEmpty()
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1
        })
        .withMessage("Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number."),
    check("password2")
        .custom((value, { req }) => {
            return value === req.body.password;
        })
        .withMessage("Passwords must be equals."),
    Validate,
    updatePassword
);

//GET comments route == POST requestS
router.post('/getcomment', GetComments);

//Send comments route == POST requestS
router.post('/sendcomment', 
    check("comment")
        .notEmpty()
        .withMessage('Comment is empty.'),
    Validate,
    SendComment
);

//Subcribe for newsletter route == POST request
router.post('/newsletter',
    check("name")
        .notEmpty()
        .withMessage("Your name is required.")
        .trim()
        .escape(),
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address.")
        .normalizeEmail(),
    Validate,
    Subscribe
);

//Edit a comment router == POST request
router.post('/updatecomment',
    check("comment")
        .notEmpty()
        .withMessage("Comment is empty. Please change the comment or delete"),
    Validate,
    UpdateComment
);


//Delete a comment router == POST request
router.post('/deletecomment', DeleteComment);


router.get('/getaccount', Verify);

router.post('/', GetHomePageRecipes);

export default router;