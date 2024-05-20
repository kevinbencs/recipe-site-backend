import mongoose from "mongoose";
const NewsLetterSchema = new mongoose.Schema(
    {   
        name: {
            type: String,
            required: "Your firstname is required",
            max: 25,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        vegetarian: {
            type: String,
            lowercase: true
        },
        pasta: {
            type: String,
            lowercase: true
        },
        seafood: {
            type: String,
            lowercase: true
        },
        side: {
            type: String,
            lowercase: true
        },
        dessert: {
            type: String,
            lowercase: true
        },
        meat: {
            type: String,
            lowercase: true
        }
    },
    { timestamps: true }
);
export default mongoose.model("newsletter", NewsLetterSchema);