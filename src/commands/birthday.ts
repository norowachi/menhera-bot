import BaseCommand from "../utils/structures/BaseCommand";
import DiscordClient from "../client/client";
import { CommandInteraction, TextChannel } from "discord.js";
import { setBday } from "../database/functions/birthday";

export default class CustomCommand extends BaseCommand {
	constructor() {
		super("birthday", "utils");
	}
	async run(client: DiscordClient, data: CommandInteraction) {
		const subCMD = data.options.data[0].name;
		switch (subCMD) {
			case "set": {
				await setBdayCmd(data);
				return;
			}
			// nothing
			default: {
				return;
			}
		}
	}
}

async function setBdayCmd(interaction: CommandInteraction) {
	const bdayDate = interaction.options.get("date", true).value as string;

	if (!/\d{1,2}-\d{1,2}/.test(bdayDate)) {
		interaction.followUp({
			content:
				"Please enter a correct date in the mm-dd-yyyy format.\nexample: 1-2-2003 or 01-02-2003",
		});
		return;
	}

	const [month, day] = bdayDate.split("-").map((s) => parseInt(s));

	if (month > 12) {
		interaction.followUp({
			content: "Are you on Mars? Cuz iirc Earth only has 12 months",
		});
		return;
	}
	if (day > 31) {
		interaction.followUp({
			content: `Really? And which month has ${day} days then?`,
		});
		return;
	}

	// save to db
	const resp = await setBday(interaction.user.id, bdayDate);

	return interaction.followUp({
		content: resp
			? "Bday saved successfully"
			: "Either you tried setting *another* bday or **There was an Error!**",
	});
}
