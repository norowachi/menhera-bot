import { Schema, model } from "mongoose";

const userExpSchema = new Schema({
    userId: {
        type: String,
        unique: true,
    },
    xp: Number,
});

export const userExp = model("userExp", userExpSchema);
