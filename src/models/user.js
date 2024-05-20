import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { SECRET_ACCESS_TOKEN } from '../config/config.js';

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: "Your firstname is required",
            max: 25,
        },
        email: {
            type: String,
            required: "Your email is required",
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: "Your password is required",
            select: false,
            max: 25,
        },
        role: {
            type: String,
            required: true,
            default: "0x01",
        },
    },
    { timestamps: true }
);

UserSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) return next();
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.pre("updateOne", function (next) {
    const update = this.getUpdate();

    if (update.$set && update.$set.password){
        bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(update.$set.password, salt, (err, hash) => {
            if (err) return next(err);

            this.getUpdate().$set.password = hash;
            next();
        });
    });
    }
    
});

UserSchema.methods.generateAccessJWT = function () {
    let payload = {
        id: this._id,
    };
    return jwt.sign(payload, SECRET_ACCESS_TOKEN, {
        expiresIn: '20m',
    });
};

export default mongoose.model("users", UserSchema);