import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { editGuildSettings } from "../../database/functions/guildSettingsFunctions";

export default class ModifiersCommand extends BaseCommand {
	constructor() {
		super("modifiers", "leveling");
	}
	async run(client: DiscordClient, interaction: CommandInteraction<"cached">) {
		const mod = interaction.options.data[0].name;
		const value = interaction.options.get("set", true).value as number;
		if (value <= 0) {
			interaction.reply({
				content: `You can't set the value to a number less than one`,
			});
			return;
		}
		const returnValue = await editGuildSettings({
			id: interaction.guild.id,
			xp: mod == "exp" ? value : undefined,
			cooldown: mod == "cooldown" ? value : undefined,
		});
		if (!returnValue) {
			interaction.reply({
				content: "*Error*\nPlease try again later ^-^",
			});
			return;
		}
		const embed = new EmbedBuilder()
			.setAuthor({
				name: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setDescription(
				`**${mod.toUpperCase()}** is now set to \`${
					value + (mod == "exp" ? "` per message" : "s`")
				}`
			);
		switch (mod) {
			case "exp": {
				interaction.reply({ embeds: [embed] });
				return;
			}
			case "cooldown": {
				interaction.reply({ embeds: [embed] });
				return;
			}
			default:
				interaction.reply({
					content: "*Error*\nPlease try again later ^-^",
				});
				return;
		}
	}
}
