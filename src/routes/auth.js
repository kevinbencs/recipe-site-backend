import express from "express";
import { Register, Login, Logout } from "../controllers/controllers.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";

const router = express.Router();

// Register route -- POST request
router.post(
    "/signup",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail(),
    check("password")
        .notEmpty()
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1
        })
        .withMessage("Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"),
    (req, res) => {
        check("password2")
                .equals(req.body.password)
                .withMessage("Passwords are not equals")
        },
    Validate,
    Register
);

// Login route == POST request
router.post(
    "/login",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail(),
    check("password").not().isEmpty(),
    Validate,
    Login
);


router.get('/logout', Logout);

export default router;