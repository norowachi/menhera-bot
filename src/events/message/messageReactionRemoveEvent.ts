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
import { updateStars } from "../../utils/functions";

export default class messageReactionRemoveEvent extends BaseEvent {
	constructor() {
		super("messageReactionRemove");
	}
	async run(client: DiscordClient, reaction: MessageReaction, user: User) {
		if (reaction.emoji.name !== "⭐") return;
		if (user.bot) return;
		await reaction.fetch().catch(() => {});
		const message = await reaction.message.fetch();
		// if not hub ignore
		if (message.guild?.id !== "551888982905192459") return; //guild id
		const channel = "930612571076186142"; //#starboard
		const minCount = 5;
		if (message.channel.type !== ChannelType.GuildText) return;

		if (
			message.author.id === user.id ||
			message.channelId === channel ||
			message.author.id === client.user?.id
		)
			return;
		//message is not sent within the last 7 days (too old)
		if (
			Date.now() / 1000 - reaction.message.createdTimestamp >
			1000 * 60 * 60 * 24 * 7
		)
			return;

		// client's permission in the channel
		const myPerms = message.channel.permissionsFor(client.user!.id);
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
		return await updateStars(starboardMessage, reaction.count, minCount);
	}
}
