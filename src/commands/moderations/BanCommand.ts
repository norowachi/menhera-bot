import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { CommandInteraction, User, MessageEmbed } from "discord.js";

export default class BanCommand extends BaseCommand {
	constructor() {
		super("ban", "moderation");
	}

	async run(client: DiscordClient, interaction: CommandInteraction) {
		const user = interaction.options.getUser("user", true);
		const reason = interaction.options.getString("reason") || "No Reason Provided";

		const member = interaction.guild?.members.cache.get(user.id);
		if (!member?.bannable) {
			await interaction.followUp({
				embeds: [
					new MessageEmbed()
						.setDescription("❌ Can't ban this user")
						.setColor("RED"),
				],
			});
			return;
		}

		const memberEmbed = new MessageEmbed()
			.setAuthor(user.tag, user.displayAvatarURL())
			.setDescription("You have been Banned from Menhera Chan Discord Server")
			.addField("Reason", reason)
			.setColor("RED");

		user.send({ embeds: [memberEmbed] }).catch(() => {
			interaction.followUp({ content: "Cannot send messages to this user" });
		});

		const channelEmbed = new MessageEmbed()
			.setDescription(`✅ **${user.tag} has been Banned**`)
			.setColor("GREEN");

		await interaction.followUp({ embeds: [channelEmbed] });

		const logEmbed = new MessageEmbed()
			.setAuthor(`Moderation | Ban | ${user.tag}`, user.displayAvatarURL())
			.addFields([
				{ name: "User", value: member.toString(), inline: true },
				{
					name: "Moderator",
					value: interaction.member?.toString() || "Unknown",
					inline: true,
				},
				{ name: "Reason", value: reason, inline: true },
			])
			.setFooter(user.id)
			.setTimestamp()
			.setColor("#7289da");

		await client.logChannel.send({ embeds: [logEmbed] });

		await interaction.guild?.bans.create(user.id, { reason: reason });
	}
}
