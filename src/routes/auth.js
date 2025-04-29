import express from "express";
import { Register, Login, Logout, updatePassword, GetComments, SendComment, Subscribe, GetHomePageRecipes, UpdateComment, DeleteComment, GetCategoryPageRecipes, GetRecipePageRecipes, GetCategoryPageRecipesMore, GetPageRecipesMore, GetSearch, GetSearchMore, ForgotPassword } from "../controllers/controllers.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";

const router = express.Router();

// Register route -- POST request
router.post(
    "/signup",
    check("name")
        .notEmpty()
        .withMessage("Your name is required.")
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
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage("Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character."),
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
router.patch(
    "/newpassword",
    check("password")
        .notEmpty()
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage("Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character."),
    check("password2")
        .custom((value, { req }) => {
            return value === req.body.password;
        })
        .withMessage("Passwords must be equals."),
    Validate,
    updatePassword
);



//Send comments route == POST requestS
router.post('/sendcomment/:recipeId',
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

//Edit a comment router == PATCH request
router.patch('/updatecomment/:Id',
    check("comment")
        .notEmpty()
        .withMessage("Comment is empty. Please change the comment or delete"),
    Validate,
    UpdateComment
);


router.post('/api/forgotpassword',
    check("email")
    .isEmail()
        .withMessage("Enter a valid email address.")
        .normalizeEmail(),
    Validate,
    ForgotPassword
)


//Delete a comment router == POST request
router.delete('/deletecomment/:id', DeleteComment);

//GET search meal route == GET request
router.get('/api/search/:text',GetSearch);

//GET search meal route == GET request
router.get('/api/search/:text/:number',GetSearchMore);

//GET comments route == GET request
router.get('/api/comments/:recipeId',GetComments)

//Get recipes for recipe page router == GET request
router.get('/api/morerecipe/:title/:number', GetPageRecipesMore);

//Get recipe description for recipe page router == GET request
router.get('/api/title/:title', GetRecipePageRecipes);

//Get recipes for category page router == GET request
router.get('/api/category/:category', GetCategoryPageRecipes);

//Get recipes for category page router == GET request
router.get('/api/:category/:number', GetCategoryPageRecipesMore);

//Get recipes for home page router == GET request
router.get('/homePage', GetHomePageRecipes);





export default router;