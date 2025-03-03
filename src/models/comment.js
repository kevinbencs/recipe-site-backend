import mongoose from "mongoose";

const CommentSchame = new mongoose.Schema (
    {
        comment:{
            type: String,
            required: true
        },
        mealId:{
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true
        },
        name:{
            type: String,
            required: true
        },
        canChange:{
            type: String,
            required: true
        }
    }
);


export default mongoose.model("comment", CommentSchame);