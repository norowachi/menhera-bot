import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { CommandInteraction, GuildMember } from "discord.js";
import { getAllUser } from "../../database/functions/userexpFunction";
import { sortUserXP } from "../../utils/modules/expSystem";
import { Rank } from "../../utils/modules/rankAttachment";
import { join } from "path";

export default class RankCommand extends BaseCommand {
	constructor() {
		super("rank", "leveling");
	}
	async run(client: DiscordClient, interaction: CommandInteraction) {
		await interaction.deferReply();

		let member = interaction.options.data[0]
			? (interaction.options.data[0].member as GuildMember)
			: (interaction.member as GuildMember);

		const allUser = await getAllUser();
		const sortedUser = sortUserXP(allUser);
		const rank = sortedUser.findIndex((e) => e.userId === member.id) + 1;
		if (!rank) {
			interaction.followUp({
				content: "User doesn't exist in the database",
			});
			return;
		}
		const data = {
			xp: sortedUser[rank - 1].xp,
			level: Math.floor(Math.sqrt(sortedUser[rank - 1].xp || 0) * 0.1),
			requiredXP:
				((Math.floor(Math.sqrt(sortedUser[rank - 1].xp || 0) * 0.1) + 1) *
					(Math.floor(Math.sqrt(sortedUser[rank - 1].xp || 0) * 0.1) + 1)) /
				0.01,
			previousXP:
				(Math.floor(Math.sqrt(sortedUser[rank - 1].xp || 0) * 0.1) *
					Math.floor(Math.sqrt(sortedUser[rank - 1].xp || 0) * 0.1)) /
				0.01,
		};
		const rankCard = new Rank()
			.setAvatar(member.user.displayAvatarURL({ extension: "png" }))
			.setBackground(
				"IMAGE",
				join(process.cwd(), "images/small_background.png")
			)
			.setCurrentXP(data.xp || 0, "#000000")
			.setRequiredXP(data.requiredXP, "#000000")
			.setPreviousXP(data.previousXP, "#000000")
			.setLevel(data.level)
			.setRank(rank)
			.setUsername(member.user.username, member.displayHexColor)
			.setDiscriminator(member.user.discriminator, member.displayHexColor)
			.setProgressBar(member.displayHexColor, "COLOR")
			.setOverlay("#FFFFFF", 0, false)
			.setLevelColor(member.displayHexColor, member.displayHexColor)
			.setRankColor(member.displayHexColor, member.displayHexColor);
		const rankCardAttachment = await rankCard.build();
		await interaction.followUp({
			files: [rankCardAttachment],
		});
	}
}
