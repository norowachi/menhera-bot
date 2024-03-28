import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import ms from "ms";
import { addModeration } from "../../database/functions/moderationFunction";

export default class MuteCommand extends BaseCommand {
	constructor() {
		super("mute", "moderation");
	}

	async run(client: DiscordClient, interaction: CommandInteraction) {
		const options = interaction.options.data;
		const member = options[0].member as GuildMember;
		const time = ms(options[1].value as string);
		const reason = options[2]?.value as string || "No Reason Provided";

		if (!time) {
			const embed = new EmbedBuilder()
				.setDescription("❌ Please provide a valid duration for the mute")
				.setColor("RED");
			await interaction.followUp({ embeds: [embed] });
			return;
		}

		if (!client.muteRole.editable) {
			const embed = new EmbedBuilder()
				.setDescription("❌ I cannot assign the mute role. Make sure I have a higher role position than the mute role.")
				.setColor("RED");
			await interaction.followUp({ embeds: [embed] });
			return;
		}

		if (member.permissions.has("MANAGE_MESSAGES")) {
			const embed = new EmbedBuilder()
				.setDescription("❌ I cannot mute a member of the staff team")
				.setColor("RED");
			await interaction.followUp({ embeds: [embed] });
			return;
		}

		await member.timeout(time, reason);

		const memberEmbed = new EmbedBuilder()
			.setColor("RED")
			.setDescription("You have been muted on Menhera Chan Discord Server")
			.addFields(
				{
					name: "Ends In",
					value: `<t:${Math.round((Date.now() + time) / 1000)}:R> (<t:${Math.round((Date.now() + time) / 1000)}:f>)`,
					inline: true
				},
				{ name: "Reason", value: reason, inline: true }
			);
		member.send({ embeds: [memberEmbed] }).catch(() => {
			interaction.followUp({ content: "Cannot send messages to this user" });
		});

		const channelEmbed = new EmbedBuilder()
			.setColor("GREEN")
			.setDescription(`✅ **${member.user.tag} muted**`);
		await interaction.followUp({ embeds: [channelEmbed] });

		const logEmbed = new EmbedBuilder()
			.setAuthor({
				name: `Moderation | Mute | ${member.user.tag}`,
				iconURL: member.user.displayAvatarURL()
			})
			.addFields(
				{ name: "User", value: `<@${member.user.id}>`, inline: true },
				{ name: "Moderator", value: `<@${interaction.member?.user.id}>`, inline: true },
				{
					name: "Ends in",
					value: `<t:${Math.round((Date.now() + time) / 1000)}:R> (<t:${Math.round((Date.now() + time) / 1000)}:f>)`,
					inline: true
				},
				{ name: "Reason", value: reason, inline: true }
			)
			.setFooter({ text: member.user.id })
			.setTimestamp()
			.setColor("#7289da");
		await client.logChannel.send({ embeds: [logEmbed] });

		const timeout = setTimeout(async () => {
			const unmuteLogEmbed = new EmbedBuilder()
				.setAuthor({
					name: `Moderation | Unmute | ${member.user.tag}`,
					iconURL: member.user.displayAvatarURL()
				})
				.addFields(
					{ name: "User", value: `<@${member.user.id}>`, inline: true },
					{ name: "Moderator", value: "Auto (discord)", inline: true },
					{ name: "Mute Reason", value: reason, inline: true }
				)
				.setFooter({ text: member.user.id })
				.setTimestamp()
				.setColor("#7289da");
			await client.logChannel.send({ embeds: [unmuteLogEmbed] });
		}, time);

		const muteId = await addModeration({
			userId: member.id,
			userTag: member.user.tag,
			moderationType: "mute",
			moderationTime: time
		});

		client.mutes.set(member.id, { timeout: timeout, id: muteId });
	}
}
