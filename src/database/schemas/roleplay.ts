import { Schema, model } from "mongoose";
import { RpTypes } from "../../client/client";

enum intType {
	TOOK = 1,
	GAVE = 2,
}

const userData = new Schema({
	userId: {
		type: String,
		unique: true,
	},
	interactions: Array<{
		name: RpTypes;
		type: intType;
		with: { type: Schema.Types.ObjectId; ref: "roleplay" };
	}>(),
	partner: { type: Schema.Types.ObjectId, ref: "roleplay" },
});

export const rp = model("roleplay", userData);
