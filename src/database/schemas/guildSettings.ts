import { Schema, model } from "mongoose";

const guildsSchema = new Schema({
	guildId: String,
	exp: {
		xp: Number,
		cooldown: Number,
	},
	multi: [{ id: String, xp: Number }],
});

export const guilds = model("guildSettings", guildsSchema);
