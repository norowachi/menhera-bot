import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { getAllWeeklyUser } from "../../database/functions/weeklyuserexpFunctions";
import { sortUserXP } from "../../utils/modules/expSystem";
import { PageButtonInteraction } from "../../utils/functions";

export default class WeeklyLBCommand extends BaseCommand {
	constructor() {
		super("weeklylb", "leveling");
	}
	async run(client: DiscordClient, interaction: CommandInteraction) {
		await interaction.deferReply();

		const sortedUsers = sortUserXP(await getAllWeeklyUser());
		const embeds = generateRankEmbed(interaction, sortedUsers);

		if (embeds.length == 1) {
			interaction.editReply({ embeds: [embeds[0]] }).catch(() => {});
			return;
		} else {
			await PageButtonInteraction(embeds, interaction);
			return;
		}
	}
}

function UserIndex(
	array: Array<{ userId?: string; xp?: number }>,
	id?: string
) {
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
		const currentQueue = array.filter((u) => u.userId != "000").slice(i, k);
		k += 10;
		const info = currentQueue
			.map(
				(d) =>
					`**${replaceByStars(UserIndex(array, d.userId))}** <@!${
						d.userId
					}>\n> **Weekly Xp: \`${d.xp}\`**`
			)
			.join("\n\n");

		const embed = new EmbedBuilder()
			.setTitle(
				`${interaction.guild!.name}${
					interaction.guild!.name.endsWith("s") ? "'" : "'s"
				} Weekly Leaderboard`
			)
			.setThumbnail(interaction.guild!.iconURL()!)
			.setDescription(info.length > 1 ? info : "No weekly data")
			.setFooter({
				text:
					(msgMemberData
						? `You: #${UserIndex(array, interaction.user.id)}`
						: "You didn't gain anything this week") +
					`\nPage: ${p}/${Math.ceil(array.length / 10)}`,
				iconURL: interaction.user.displayAvatarURL(),
			});
		embeds.push(embed);
		p++;
	}
	return embeds;
}

function replaceByStars(num: number): string {
	switch (num.toString()) {
		case "1":
			return "💫";
		case "2":
			return "🌟";
		case "3":
			return "⭐";
		default:
			return `#${num.toString()}`;
	}
}
