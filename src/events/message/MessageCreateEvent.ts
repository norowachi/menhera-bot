import BaseEvent from "../../utils/structures/BaseEvent";
import { Message, TextChannel } from "discord.js";
import DiscordClient from "../../client/client";
import { expSystem } from "../../utils/modules/expSystem";
import { getResponses } from "../../database/functions/customRespFunctions";
import COMMANDS from "./commands/index";

let cdMap: Map<string, { respId: string; lastUsed: number }[]> = new Map();
// Map<ChannelId, [{respId, LastUsedDate}]>
let numberUsed = 0;
let lastUsed = 0; //time
// !START! THE LIMITS
const msgLimit = 10;
const RespLimit = 1 * 60 * 1000; //1 min in ms
const sameRespLimit = 6 * 60 * 1000; //6 min in ms
const MaxRespInX = 5; // i.e. 5 responses in 10 minutes
const theX = 10 * 60 * 1000; // time for max resps in ms
// !END! THE LIMITS
// reset used number every 10 mins
setInterval(() => {
	numberUsed = 0;
}, theX);

export { cdMap, numberUsed, lastUsed };

export default class MessageEvent extends BaseEvent {
	constructor() {
		super("messageCreate");
	}

	async run(client: DiscordClient, message: Message) {
		if (message.author.bot) return;
		if (!message.guild) return;
		await expSystem(client, message);

		// checking if the message contains a command
		if (await getCommand(client, message)) return;

		// if user has nomemehera role, ignore
		if (message.member?.roles.cache.has(client.nomemehera)) return;

		// get all responses
		const resps = await getResponses(message.guild.id);
		const ResponseObj = resps.find((elm) =>
			new RegExp(`( |^)${elm.keyword}($| )`, "i").test(
				message.content.replace(/\|\|[^|]*\|\|/g, "")
			)
		);
		await message.channel.messages.fetch({ limit: 10 });
		const OnCooldown = resp_cd(
			message.channel as TextChannel,
			ResponseObj?.id || ""
		);

		// if on cooldown & author is not noro or channel is not #bots, apply cooldown and ignore else run without minding the cooldown
		if (
			OnCooldown &&
			(message.author.id != "534783899331461123" ||
				message.channelId != "880777835323744296")
		)
			return;
		if (ResponseObj) {
			if (ResponseObj.reaction) {
				message
					.react(
						ResponseObj.reaction.includes("<:") ||
							ResponseObj.reaction.includes("<a:")
							? ResponseObj.reaction.split(/:/g)[2].replace(">", "")
							: ResponseObj.reaction
					)
					.catch(() => {});
			}
			let respMsgs = ResponseObj.messages;
			if (respMsgs && respMsgs.length > 0) {
				message
					.reply({
						content: respMsgs[Math.floor(Math.random() * respMsgs.length)],
					})
					.catch(() => {});
			}

			//author is noro (writtn by noro) or channel is #bots
			if (
				message.author.id == "534783899331461123" ||
				message.channelId == "880777835323744296"
			)
				return;

			// get cd map for the channel
			let themap = cdMap.get(message.channelId);
			// if no cd channel map create one
			if (!themap) {
				themap = [{ respId: ResponseObj.id, lastUsed: Date.now() }];
				cdMap.set(message.channelId, themap);
			}
			// get cd resps array
			const theresp = themap.find((r) => r.respId == ResponseObj.id);
			// if undefined push one & set lastUsed to current time
			if (!theresp) {
				themap.push({ respId: ResponseObj.id, lastUsed: Date.now() });
			} else {
				theresp.lastUsed = Date.now();
			}
			lastUsed = Date.now();
			numberUsed++;
		}
	}
}

//! mod logs became private
/*
async function MODLOGS_StickyMessage(client: DiscordClient, message: Message) {
	const stickymsg = `All warnings and bans are at the discretion of staff, based on the actions and violations that occurred. Do not expect full essays on every single moderation action, nor for everyone to be given the same punishment for the same reason.\nAppeals are found in <#894032977519054948>`;
	//check if there're old messages and delete them
	const messages = await (message.channel as TextChannel).messages.fetch({
		limit: 10,
	});
	if (messages.size) {
		messages
			.filter(
				(msg) => msg.content === stickymsg && msg.author.id === client.user?.id
			)
			.forEach((msg) => msg.delete());
	}
	// send sticky message
	return await (message.channel as TextChannel).send(stickymsg);
}
*/

// true = do not lock for responses | false = look for responses
async function getCommand(client: DiscordClient, message: Message) {
	// regexp for replacing prefix/mention
	const PrefixRegex = new RegExp(
		`^(${client.prefix}|<@!?${client.user?.id}>)(\s+)?`,
		"i"
	);
	//commands area (if msg starts with prefix or mention)
	if (!PrefixRegex.test(message.content)) return false;
	let [name, ...args] = message.content.replace(PrefixRegex, "").split(/\s+/g);
	if (!name) return false;
	// for case-insesitivity
	name = name.toLowerCase();
	// getting the command
	const command = COMMANDS.find(
		(data) =>
			data.name === name ||
			(data.aliases != undefined ? data.aliases!.includes(name) : false)
	);
	if (!command) return false;
	if (command.requireArgs && !args.length) {
		message.reply({ content: "This command requires extra args" });
		return true;
	}
	// run and run (exit)
	await command.run(client, message, name, args);
	return true;
}

// True = on cd
// False = not on cd
function resp_cd(channel: TextChannel, respId: string) {
	// see if it was used in the last {msgLimit} messages
	const messages = channel.messages.cache.filter(
		(m) => m.createdTimestamp > lastUsed / 1000
	);
	// if messages is less than limit, its on cd
	if (messages.size < msgLimit) return true;
	// last used resp was in less than {RespLimit}
	if (lastUsed + RespLimit >= Date.now()) return true;
	// get map data and if it doesnt exist create it
	const cdmapData = cdMap.get(channel.id)?.find((r) => r.respId === respId);
	if (cdmapData) {
		// if the same resp was last used in less than {sameRespLimit}, its on cd
		if (cdmapData.lastUsed + sameRespLimit >= Date.now()) return true;
	}
	// if {numberUsed} (which resets every {theX}) is greater than {MaxRespInX}, its on cd
	if (numberUsed >= MaxRespInX) return true;
	return false;
}
