import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { getAllUser } from "../../database/functions/userexpFunction";
import { sortUserXP } from "../../utils/modules/expSystem";
import { PageButtonInteraction } from "../../utils/functions";

export default class LeaderboardCommand extends BaseCommand {
	constructor() {
		super("leaderboard", "leveling");
	}
	async run(client: DiscordClient, interaction: CommandInteraction) {
		const sortedUsers = sortUserXP(await getAllUser());
		const embeds = generateRankEmbed(
			interaction,
			sortedUsers.slice(0, 10 * 15)
		);

		if (embeds.length == 1) {
			interaction.editReply({ embeds: [embeds[0]] }).catch(() => {});
			return;
		} else {
			await PageButtonInteraction(embeds, interaction);
			return;
		}
	}
}

function UserIndex(array: Array<{ userId?: string; xp?: number }>, id: string) {
	return array.findIndex((e) => e.userId === id);
}

function generateRankEmbed(
	interaction: CommandInteraction,
	array: Array<{ userId?: string; xp?: number }>
) {
	const embeds = [];
	const msgMemberData = array.filter((f) => f.userId == interaction.user.id)[0];
	let k = 10;
	let p = 1;
	for (let i = 0; i < array.length; i += 10) {
		const currentQueue = array.slice(i, k);
		k += 10;
		const info = currentQueue
			.map(
				(d) =>
					`**#${UserIndex(array, d.userId!) + 1}** <@!${
						d.userId
					}>\n> **Level: \`${Math.floor(
						Math.sqrt(d.xp!) * 0.1
					)}\`**\n> **Xp: \`${d.xp}\`**`
			)
			.join("\n\n");

		const embed = new EmbedBuilder()
			.setTitle(
				`${interaction.guild!.name}${
					interaction.guild!.name.endsWith("s") ? "'" : "'s"
				} Leaderboard`
			)
			.setThumbnail(interaction.guild!.iconURL()!)
			.setDescription(info ? info : "No data")
			.setFooter({
				text:
					(msgMemberData
						? `You: #${UserIndex(array, interaction.user.id) + 1}`
						: "You don't have any exp") +
					`\nPage: ${p}/${Math.ceil(array.length / 10)}`,
				iconURL: interaction.user.displayAvatarURL(),
			});
		embeds.push(embed);
		p++;
	}
	return embeds;
}
