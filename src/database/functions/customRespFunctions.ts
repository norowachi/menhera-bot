import { Document } from "mongoose";
import { CustomResp, CustomRespData } from "../../utils/GlobalTypes";
import { custom } from "../schemas/custom";

export const initCustomResp = async (guildId: string, data: CustomResp) => {
	const newData = new custom({
		guildId: guildId,
		responses: [
			{
				id: data.id,
				keyword: data.keyword,
				reaction: data.reaction || "",
				messages: data.messages || [],
				createdBy: data.createdBy,
			},
		],
	});
	await newData.save();
	return newData;
};

export const addResponse = async (guildId: string, data: CustomResp) => {
	try {
		const CData = await custom.findOne({ guildId });
		if (!CData) {
			await initCustomResp(guildId, data);
			return true;
		}
		CData.responses.push({
			id: data.id,
			keyword: data.keyword,
			reaction: data.reaction || "",
			messages: data.messages || [],
			createdBy: data.createdBy,
		});
		await CData.save();
		return true;
	} catch (err) {
		return false;
	}
};

export const EditResponse = async (guildId: string, data: CustomResp) => {
	try {
		const CData = await custom.findOne<CustomRespData & Document>({ guildId });
		if (!CData) {
			await initCustomResp(guildId, data);
			return true;
		}
		const index = CData.responses?.findIndex((r) => r.id === data.id);
		if (!index) return false;
		CData.responses![index] = {
			id: data.id,
			keyword: data.keyword,
			reaction: data.reaction || "",
			messages: data.messages || [],
			createdBy: data.createdBy,
		};
		await CData.save();
		return true;
	} catch (err) {
		return false;
	}
};

export const removeResponse = async (guildId: string, ID: string) => {
	try {
		await custom.findOneAndUpdate(
			{ guildId },
			{
				$pull: {
					responses: {
						id: ID,
					},
				},
			}
		);
		return true;
	} catch (err) {
		return false;
	}
};

export const getResponses = async (guildId: string) => {
	const data = await custom.findOne({ guildId });
	if (!data) return [];
	return data.responses as CustomResp[];
};

export const addMessageToKeyword = async (
	guildId: string,
	keywordId: string,
	message: string
) => {
	try {
		await custom.findOneAndUpdate(
			{ guildId: guildId, "responses.id": keywordId },
			{ $push: { "responses.$.messages": message } }
		);
		return true;
	} catch (err) {
		return false;
	}
};
