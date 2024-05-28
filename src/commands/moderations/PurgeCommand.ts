import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { CommandInteraction, TextChannel } from "discord.js";

export default class PurgeCommand extends BaseCommand {
	constructor() {
		super("purge", "moderation");
	}

	async run(client: DiscordClient, interaction: CommandInteraction) {
		await interaction.reply({
			content: "Deleting Messages...",
			ephemeral: true,
		});
		const amount = interaction.options.data[0].value as number;
		const channel = interaction.channel as TextChannel;
		await channel.bulkDelete(amount + 1, true);
	}
}
