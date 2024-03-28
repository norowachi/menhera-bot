import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";

export default class KickCommand extends BaseCommand {
	constructor() {
		super("kick", "moderation");
	}
	async run(client: DiscordClient, interaction: CommandInteraction) {
		const member = interaction.options.getMember("user") as GuildMember;
		const reason = interaction.options.getString("reason") || "No Reason Provided";

		if (!member.kickable) {
			await interaction.followUp({
				embeds: [
					new MessageEmbed()
						.setDescription("❌ Can't kick this user")
						.setColor("RED"),
				],
			});
			return;
		}

		const memberEmbed = new MessageEmbed()
			.setColor("RED")
			.setDescription("You have been kicked from Menhera Discord Server")
			.addField("Reason", reason);

		member.send({ embeds: [memberEmbed] }).catch(() => {
			interaction.followUp({ content: "Cannot send messages to this user" });
		});

		const channelEmbed = new MessageEmbed()
			.setColor("GREEN")
			.setDescription(`✅ **${member.user.tag} kicked**`);

		await interaction.followUp({ embeds: [channelEmbed] });

		const logEmbed = new MessageEmbed()
			.setAuthor({
				name: `Moderation | Kick | ${member.user.tag}`,
				iconURL: member.user.displayAvatarURL(),
			})
			.addFields([
				{ name: "User", value: member.toString(), inline: true },
				{
					name: "Moderator",
					value: interaction.member?.toString() || "Unknown",
					inline: true,
				},
				{ name: "Reason", value: reason, inline: true },
			])
			.setFooter(member.id)
			.setTimestamp()
			.setColor("#7289da");

		await client.logChannel.send({ embeds: [logEmbed] });
		await member.kick(reason);
	}
}
