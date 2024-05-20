import { SECRET_ACCESS_TOKEN } from "../config/config.js";
import Blacklist from "../models/blacklist.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

export async function Verify(req, res, next) {
    try {
        const authHeader = req.headers["cookie"]; // get the session cookie from request header

        if (!authHeader) return res.sendStatus(401); // if there is no cookie from request header, send an unauthorized response.
        const cookie = authHeader.split("=")[1]; // If there is, split the cookie string to get the actual jwt
        const accessToken = cookie.split(";")[0];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted

        if (checkIfBlacklisted)
            return res
                .status(401)
                .json({ message: "This session has expired. Please login" });
        // if token has not been blacklisted, verify with jwt to see if it has been tampered with or not.
        // that's like checking the integrity of the accessToken

        // Verify using jwt to see if token has been tampered with or if it has expired.
        // that's like checking the integrity of the cookie
        jwt.verify(accessToken, SECRET_ACCESS_TOKEN, async (err, decoded) => {
            if (err) {
                // if token has been altered or has expired, return an unauthorized error
                return res
                    .status(401)
                    .json({ message: "This session has expired. Please login" });
            }

            const { id } = decoded; // get user id from the decoded token
            const user = await User.findById(id); // find user by that `id`
            res.status(200).json({name: user.name});
            next();
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}

