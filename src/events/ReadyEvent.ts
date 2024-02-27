import BaseEvent from "../utils/structures/BaseEvent";
import DiscordClient from "../client/client";
import { TextChannel } from "discord.js";
import {
	getWeeklyTimer,
	initWeeklyTimer,
	ResetWeekly,
} from "../database/functions/weeklyuserexpFunctions";

export default class ReadyEvent extends BaseEvent {
	constructor() {
		super("ready");
	}
	async run(client: DiscordClient) {
		console.log(`${client.user?.tag} has logged in.`);
		const channel = (await client.channels.fetch(
			"1055223508298379304"
		)) as TextChannel;
		client.logChannel = channel;

		const role = client.guilds.cache
			.get("878173412529414174")!
			.roles.cache.get("879764468907794533");
		client.muteRole = role!;

		client.guildXP.channel = [
			"881292562332258394", //spam
			"894044004927283261", //mudae
			"880777835323744296", //bot-channel
		];
		client.guildXP.logChannel = "880776818527981598";
		setInterval(async () => {
			const timer = await getWeeklyTimer();
			if (!timer) return await initWeeklyTimer();
			if (Date.now() >= timer) await ResetWeekly(client);
		}, 60 * 60 * 1000); //1 hour
	}
}
