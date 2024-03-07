import { birthdays } from "../schemas/birthday";

async function init(userId: string, bday: string) {
	try {
		const [month, day] = bday.split("-");
		const BDayDate = new Date(`${month}-${day}-${new Date().getFullYear()}`);

		if (BDayDate.getTime() < Date.now()) {
			BDayDate.setFullYear(BDayDate.getFullYear() + 1);
		}

		const newDoc = await birthdays.create({
			userId,
			birthday: bday,
			in: BDayDate.getTime(),
		});

		return await newDoc.save();
	} catch (e) {
		console.error(e);
		return false;
	}
}

export async function setBday(userId: string, bday: string) {
	if (await birthdays.findOne({ userId })) return false;

	return await init(userId, bday);
}

export async function getBdays() {
	return await birthdays.find({ in: { $lte: Date.now() } });
}
