import BaseEvent from "../../utils/structures/BaseEvent";
import DiscordClient from "../../client/client";
import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import { IsMenheraServer } from "../../utils/functions";

// server ids
const miniID = "1071581732807122956";
const hubID = "551888982905192459";

// cross booster roles
const miniRoleID = "1095073071339155466";
const hubRoleID = "1095072789343522816";

export default class GuildMemberUpdateEvent extends BaseEvent {
	constructor() {
		super("guildMemberUpdate");
	}
	async run(
		client: DiscordClient,
		oldMember: GuildMember,
		newMember: GuildMember
	) {
		if (!IsMenheraServer(oldMember.guild.id)) return;
		await BoosterRoleManagement(oldMember, newMember);
		await BoosterLevelChange(oldMember, newMember);
		return;
	}
}

async function BoosterRoleManagement(
	oldMember: GuildMember,
	newMember: GuildMember
) {
	const client = newMember.client;
	// member in both servers
	const miniMember = await client.guilds.cache
		.get(miniID)
		?.members.fetch(newMember.id)
		.catch(() => {});
	const hubMember = await client.guilds.cache
		.get(hubID)
		?.members.fetch(newMember.id)
		.catch(() => {});
	// is a booster or not? boolean from both servers
	const isBooster = !!(
		miniMember?.premiumSinceTimestamp || hubMember?.premiumSinceTimestamp
	);

	// is a booster
	if (isBooster) {
		if (oldMember.premiumSinceTimestamp !== newMember.premiumSinceTimestamp) {
			const general = (await client.channels.fetch(
				"880776818527981598"
			)) as TextChannel;
			if (general) {
				const embed = new EmbedBuilder()
					.setAuthor({
						name: newMember.user.tag,
						iconURL: newMember.user.displayAvatarURL(),
					})
					.setDescription(
						`Thank you <@${newMember.id}> for boosting ${newMember.guild.name}!\n${newMember.guild.name} now has ${newMember.guild.premiumSubscriptionCount} boosts and it's at tier ${newMember.guild.premiumTier}!`
					)
					.setColor("#FF9299")
					.setThumbnail(newMember.guild.iconURL());
				await general.send({ embeds: [embed] });
			}
		}

		// has roles, ignore
		if (
			miniMember?.roles.cache.has(miniRoleID) &&
			hubMember?.roles.cache.has(hubRoleID)
		)
			return;
		// add roles
		miniMember?.roles.add(miniRoleID).catch(() => {});
		hubMember?.roles.add(hubRoleID).catch(() => {});
	} // is not a booster
	else {
		// doesnt have roles, ignore
		if (
			!miniMember?.roles.cache.has(miniRoleID) &&
			!hubMember?.roles.cache.has(hubRoleID)
		)
			return;
		// remove roles
		miniMember?.roles.remove(miniRoleID).catch(() => {});
		hubMember?.roles.remove(hubRoleID).catch(() => {});
	}
}

async function BoosterLevelChange(
	oldMember: GuildMember,
	newMember: GuildMember
) {
	const oldTier = oldMember.guild.premiumTier;
	const newTier = newMember.guild.premiumTier;
	if (oldTier == newTier) return;
	const modNews = (await newMember.client.channels.fetch(
		"880738096767963198"
	)) as TextChannel;
	modNews.send({
		embeds: [
			new EmbedBuilder()
				.setTitle(`Boost Tier Changed In [${newMember.guild.name}]`)
				.setDescription(
					`Boost Level went from **${oldTier}** to **${newTier}**`
				)
				.addFields([
					{
						name:
							"Last Boost(s)" +
							(oldTier > newTier ? " Removal" : "") +
							" Is From",
						value: `<@${newMember.id}> | \`${newMember.id}\` | ${newMember.user.tag}`,
					},
				])
				.setFooter({
					text: `And now we have ${newMember.guild.premiumSubscriptionCount} boost(s)`,
				}),
		],
	});
}
