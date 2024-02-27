import BaseEvent from "../utils/structures/BaseEvent";
import DiscordClient from "../client/client";
import {
	ChannelType,
	AttachmentBuilder,
	Guild,
	TextChannel,
	CategoryChannel,
	EmbedBuilder,
} from "discord.js";

const constants = {
	enclaved: "878173412529414174", //enclaved server
	eventLogsCategory: "1082439774968742009", //logs parent category
	eventLogsCategory2: "1082448348369395712", //logs parent category   2
};
let events: {
	name: string;
	data: { dateAdded: number; files: AttachmentBuilder }[];
}[] = [];

export default class RawEvent extends BaseEvent {
	constructor() {
		super("raw");
	}
	async run(
		client: DiscordClient,
		data: { op: number; t: string; s: number; d?: any }
	) {
		if (!data || data.op != 0 || !data.t) return;
		if (data.t == "READY") return;
		if (
			data.d?.guild_id == "878173412529414174" ||
			data.d?.guild?.id == "878173412529414174"
		)
			return;
		const guild = client.guilds.cache.get(constants.enclaved);
		if (!guild) return;
		const eventChannel = await channel_check(guild, data);
		const eventData = events.find((e) => e.name === data.t);
		if (!eventData) {
			events.push({ name: data.t, data: [] });
		}
		let embedData = data.d;
		if (embedData.guild)
			embedData.guild = { name: embedData.guild?.name, id: embedData.guild?.id };
		if (embedData.member)
			embedData.member = {
				name: embedData.member?.user?.username,
				nickname: embedData.member?.display_name,
				id: embedData.member?.user?.id,
			};
		if (embedData.user)
			embedData.user = { name: embedData.user?.username, id: embedData.user?.id };
		if (embedData.members) embedData.members = embedData.members.length;
		if (embedData.channels) embedData.channels = embedData.channels.length;
		if (embedData.roles) embedData.roles = embedData.roles.length;
		if (embedData.emojis) embedData.emojis = embedData.emojis.length;
		if (embedData.stickers) embedData.stickers = embedData.stickers.length;
		if (embedData.threads) embedData.threads = embedData.threads.length;
		if (embedData.voice_states)
			embedData.voice_states = embedData.voice_states.length;
		if (embedData.stage_instances)
			embedData.stage_instances = embedData.stage_instances.length;
		if (embedData.guild_scheduled_events)
			embedData.guild_scheduled_events =
				embedData.guild_scheduled_events.length;
		embedData = stringify(embedData || "No Data");

		// if (eventData?.embeds && eventData?.embeds.length >= 10) {
		return eventChannel.send({
			files: [
				new AttachmentBuilder(
					Buffer.from(stringify(data.d || "No Data"))
				).setName(data.t + ".json"),
			],
			embeds: [
				new EmbedBuilder()
					.setTitle(data.t)
					.setDescription(
						["```json", embedData > 4000 ? embedData.slice(0,4000) + "..." : embedData, "```"].join("\n")
					)
					.setFooter({ text: "VIEW THE FILE FOR MORE DATA" }),
			],
		});
		// }
		// setInterval(async () => {
		// 	const eventData_int = events.find((e) => e.name === data.t);
		// 	const newLength = events
		// 		.find((e) => e.name === data.t)
		// 		?.embeds.push({
		// 			dateAdded: Date.now(),
		// 			embed: new EmbedBuilder()
		// 				.setTitle(data.t)
		// 				.setDescription(
		// 					[
		// 						"```json",
		// 						JSON.stringify(data.d, null, "\t").slice(0, 4000),
		// 						"```",
		// 					].join("\nF")
		// 				),
		// 		});
		// 	if (newLength && newLength >= 10) {
		// 		return eventChannel.send({
		// 			embeds: eventData_int?.embeds.map((e) => e.embed),
		// 		});
		// 	}
		// 	const oldies = eventData_int?.embeds.filter(
		// 		(e) => e.dateAdded + 10 * 1000 < Date.now()
		// 	);
		// 	if (!oldies || !oldies.length) return;
		// 	(await channel_check(guild, data)).send({
		// 		embeds: oldies.map((o) => o.embed),
		// 	});
		// }, 10 * 1000);
	}
}

async function channel_check(
	guild: Guild,
	data: { op: number; t: string; s: number; d?: any }
) {
	let eventChannel = (await guild?.channels.fetch()).find(
		(c) => c?.name === data.t.toLowerCase() && c.type === ChannelType.GuildText
	);
	if (!eventChannel) {
		let parent = guild.channels.cache.get(
			constants.eventLogsCategory
		) as CategoryChannel;
		if (
			!parent ||
			(parent.id === constants.eventLogsCategory &&
				parent.children.cache.size >= 50)
		) {
			parent = guild.channels.cache.get(
				constants.eventLogsCategory2
			) as CategoryChannel;
		}
		eventChannel = await guild.channels.create({
			name: data.t,
			parent: parent.id,
			type: ChannelType.GuildText,
		});
	}
	return eventChannel as TextChannel;
}

function stringify(obj: any) {
	let cache: any = [];
	let str = JSON.stringify(
		obj,
		function (_key, value) {
			if (typeof value === "object" && value !== null) {
				if (cache.indexOf(value) !== -1) {
					// Circular reference found, discard key
					return;
				}
				// Store value in our collection
				cache.push(value);
			}
			return value;
		},
		" "
	);
	cache = null; // reset the cache
	return str;
}

