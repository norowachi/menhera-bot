import BaseEvent from "../../utils/structures/BaseEvent";
import DiscordClient from "../../client/client";
import {
	ChannelType,
	Message,
	MessageReaction,
	PermissionResolvable,
	TextChannel,
	User,
} from "discord.js";
import { SendStarMessage, getCardCodes } from "../../utils/functions";

export default class messageReactionAddEvent extends BaseEvent {
	constructor() {
		super("messageReactionAdd");
	}
	async run(client: DiscordClient, reaction: MessageReaction, user: User) {
		// no need for it after adding keqing
		/* if (reaction.emoji.name === "📝") {
			return getCardCodes(client, await reaction.message.fetch());
		} */
		if (reaction.emoji.name !== "⭐") return;
		if (user.bot) return;
		await reaction.fetch().catch(() => {});
		const message = await reaction.message.fetch();
		// if not hub ignore
		if (message.guild?.id !== "551888982905192459") return; //guild id
		const channel = "930612571076186142"; //#starboard
		if (message.channel.type !== ChannelType.GuildText) return;
		const myPerms = message.channel.permissionsFor(client.user!.id);
		const minCount = 5;
		const neededPerms: PermissionResolvable[] = [
			"ManageMessages",
			"AddReactions",
			"ReadMessageHistory",
			"EmbedLinks",
			"AttachFiles",
		];
		if (!myPerms?.has(neededPerms)) {
			if (myPerms?.has("SendMessages")) {
				message.channel.send({
					content: `Make sure i have **${neededPerms
						.slice(0, neededPerms.length - 2)
						.map((perm) => `\`${perm.toString()}\``)
						.join(", ")} and ${neededPerms[
						neededPerms.length - 1
					].toString()}**`,
				});
			}
		}
		if (
			Date.now() - 1000 * 60 * 60 * 24 * 7 >
			reaction.message.createdTimestamp
		)
			//message is not sent within the last 7 days (too old)
			return;
		if (message.author.id === user.id) {
			reaction.users.remove(user).catch(() => {});
			return;
		}
		if (message.channelId !== channel && reaction.count < minCount) return;
		let starChannel = await client.channels.fetch(channel);
		if (
			!starChannel ||
			![
				ChannelType.GuildText,
				ChannelType.PublicThread,
				ChannelType.PrivateThread,
				ChannelType.AnnouncementThread,
				ChannelType.GuildAnnouncement,
			].includes(starChannel.type)
		)
			return;
		starChannel = starChannel as TextChannel;
		const wannabeStarMsgId =
			message.channelId === starChannel.id &&
			message.author.id === client.user?.id
				? message.embeds[0].footer
					? message.embeds[0].footer.text.split(":")[1].replace(/ +/g, "")
					: message.id
				: message.id;
		//fetch last 50 messages
		const fetch = await starChannel.messages.fetch({
			limit: 50,
		});
		// the message in the starboard channel
		const starboardMessage = fetch.find(
			(m) =>
				m.author.id === client.user!.id &&
				m.embeds[0] &&
				(m.embeds[0].footer?.text?.includes(wannabeStarMsgId) || false)
		) as Message | null;
		// getting the channel id of the message if the message in starboard was starred
		if (
			message.channelId !== channel &&
			message.author.id !== client.user?.id
		) {
			return await SendStarMessage(
				starChannel,
				starboardMessage,
				reaction.count,
				message,
				minCount
			);
		}
		return;
	}
}
