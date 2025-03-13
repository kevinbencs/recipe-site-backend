import { SECRET_ACCESS_TOKEN } from "../config/config.js";
import Blacklist from "../models/blacklist.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

export async function Verify(req, res, next) {
    try {
        const authHeader = req.headers["cookie"]; // get the session cookie from request header
        if (!authHeader) return res.status(201).json({ name: '' }); // if there is no cookie from request header, send an unauthorized response.
        const cookie = authHeader.split(";").filter(item => item.indexOf('SessionID') > -1)[0]; // If there is, split the cookie string to get the actual jwt

        if(!cookie) return res
        .status(201)
        .json({ message: "This session has expired. Please login", name: '' });
        const accessToken = cookie.split("=")[1];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted

        if (checkIfBlacklisted)
            return res
                .status(201)
                .json({ message: "This session has expired. Please login", name: '' });

        const decoded = jwt.verify(accessToken, SECRET_ACCESS_TOKEN)

        const { id } = decoded; // get user id from the decoded token
        const user = await User.findById(id); // find user by that `id`
        return res.status(200).json({ name: user.name });
        

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            error: 'Server error'
        });
    }
}

