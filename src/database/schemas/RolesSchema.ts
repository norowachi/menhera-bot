import { Schema, model } from "mongoose";

const RolesSchema = new Schema({
	messageId: String,
	roles: Array<{ name: String; id: String; position: String }>(),
	allow: Array<String>(),
});

export const roles = model("roles", RolesSchema);
