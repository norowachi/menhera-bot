import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { CommandInteraction } from "discord.js";

export default class PingCommand extends BaseCommand {
	constructor() {
		super("ping", "general");
	}
	async run(client: DiscordClient, data: CommandInteraction) {
		await data.reply({
			target: data.user,
			content: "Pong",
			fetchReply: true,
		});
	}
}
