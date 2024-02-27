import { Schema, model } from "mongoose";
const WarningSchema = new Schema({
    userId: String,
    warning: String,
    moderator: String,
    date: Number,
});

export const warning = model("GuildWarnings", WarningSchema);
