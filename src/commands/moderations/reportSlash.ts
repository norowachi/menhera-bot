import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	TextChannel,
} from "discord.js";

export default class CustomCommand extends BaseCommand {
	constructor() {
		super("report", "moderation");
	}
	async run(client: DiscordClient, data: ChatInputCommandInteraction) {
		const targetUser = data.options.getUser("user", true);
		const targetMessageId = data.options.get("message", false)?.value;
		const reason = data.options.get("reason", true).value;

		(client.channels.cache.get("1122654657915912307") as TextChannel).send({
			//content: "<@&880737692864888843>", //ping mods
			embeds: [
				new EmbedBuilder()
					.setTitle("New Report!")
					.setDescription(
						`**Reported Message ID(s):**\n${
							targetMessageId || "No Messages Attached"
						}\n\n**Reason:**\n${reason}`
					)
					.setFields([
						{
							name: "Report By",
							value: `<@${data.user.id}> (${data.user.username}, ${data.user.id})`,
						},
						{
							name: "Report On",
							value: `<@${targetUser.id}> (${targetUser.username}, ${targetUser.id})`,
						},
					]),
			],
		});
		data.reply({
			ephemeral: true,
			content: "Your report has been submitted",
		});
	}
}
