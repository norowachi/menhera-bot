import { guildData } from "../../utils/GlobalTypes";
import { Types } from "mongoose";
import { guilds } from "../schemas/guildSettings";

export const initGuildSettings = async (guildId: string): Promise<any> => {
	const id = new Types.ObjectId();
	const newGuild = new guilds({
		_id: id,
		guildId: guildId,
		exp: { xp: 1, cooldown: 8 },
	});
	await newGuild.save();
	return newGuild;
};

export const getGuildSettings = async (guildId: string) => {
	const guildsett: guildData | null = await guilds.findOne({
		guildId: guildId,
	});
	if (!guildsett) {
		return (await initGuildSettings(guildId)) as unknown as guildData;
	}
	return guildsett;
};

export const editGuildSettings = async (guildData: {
	id: string;
	xp?: number;
	cooldown?: number;
}) => {
	const guildsett: guildData | null = await getGuildSettings(guildData.id);
	return guilds.findOneAndUpdate(
		{ guildId: guildData.id },
		{
			exp: {
				xp: guildData.xp || guildsett.exp.xp,
				cooldown: guildData.cooldown || guildsett.exp.cooldown,
			},
		}
	);
};

export const ModifyMulti = async (
	guildId: string,
	type: "add" | "edit" | "remove",
	id: string,
	xp?: number
) => {
	const guildData = await guilds.findOne({ guildId });
	if (!guildData) return false;
	switch (type) {
		case "add": {
			if (
				(guildData.multi as Array<{ id: string; xp: number }>).some(
					(d) => d.id == id
				)
			)
				return false;
			guildData.multi.push({ id: id, xp: xp });
			guildData.save();
			return true;
		}
		case "edit": {
			if (
				!(guildData.multi as Array<{ id: string; xp: number }>).some(
					(d) => d.id == id
				)
			)
				return false;
			if (!xp) return false;
			await guilds.updateOne(
				{ guildId: guildId, "multi.id": id },
				{ $set: { "multi.$.xp": xp } }
			);
			return true;
		}
		case "remove": {
			if (
				!(guildData.multi as Array<{ id: string; xp: number }>).some(
					(d) => d.id == id
				)
			)
				return false;
			guildData.multi = (
				guildData.multi as Array<{ id: string; xp: number }>
			).filter((d) => d.id !== id);
			guildData.save();
			return true;
		}
		default:
			return false;
	}
};
