import { Schema, model } from "mongoose";

const RolesSchema = new Schema({
	messageId: String,
	roles: [{ name: String, id: String, position: String }],
	allow: [String],
});

export const roles = model("roles", RolesSchema);
