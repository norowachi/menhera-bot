import { Schema, model } from "mongoose";

const birthdaySchema = new Schema({
	userId: { type: String, unique: true },
	// bday is in mm-dd format
	birthday: String,
	in: Number,
});

export const birthdays = model("Birthdays", birthdaySchema);
