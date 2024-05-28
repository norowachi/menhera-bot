import BaseCommand from "../utils/structures/BaseCommand";
import DiscordClient from "../client/client";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import {
	addResponse,
	removeResponse,
} from "../database/functions/customRespFunctions";

export default class CustomCommand extends BaseCommand {
	constructor() {
		super("custom", "utils");
	}
	async run(client: DiscordClient, data: CommandInteraction) {
		const subCMD = data.options.data[0].name;
		switch (subCMD) {
			case "add": {
				await Add(client, data);
				return;
			}
			case "remove": {
				await Remove(data);
				return;
			}
			// nothing
			default: {
				return;
			}
		}
	}
}

async function Add(client: DiscordClient, data: CommandInteraction) {
	const keyword = data.options.get("keyword", true).value as string;
	const reaction =
		(data.options.get("reaction", false)?.value as string) || undefined;
	const message =
		(data.options.get("message", false)?.value as string) || undefined;
	if (!reaction && !message) {
		data.reply({
			content: "You have to include either `reaction` or `message`",
		});
		return;
	}
	const emojiRegex =
		/^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])$/i;
	if (
		reaction &&
		!(
			emojiRegex.test(reaction) ||
			client.emojis.cache.filter(
				(emoji) =>
					`<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>` ===
					reaction
			).size > 0
		)
	) {
		data.reply({
			content: `**reaction** is not an emoji that I have access to`,
		});
		return;
	}
	const id = CreateUID();
	if (
		await addResponse(data.guildId!, {
			id: id,
			keyword: keyword,
			reaction: reaction,
			messages: message ? [message] : undefined,
			createdBy: data.user.id,
		})
	) {
		data.reply({
			embeds: [
				new EmbedBuilder().setDescription(
					`**Id:** ${id}\n**Keyword:** ${keyword}\n${
						reaction ? `**Reaction:** ${reaction}\n` : ""
					}${message ? `**Message:** ${message}\n` : ""}**Created By:** <@!${
						data.user.id
					}>`
				),
			],
		});
	} else {
		data.reply({
			content: `There was an error please try again later, if this had happened more than once contact a developer...`,
		});
	}
	return;
}

async function Remove(data: CommandInteraction) {
	const id = data.options.get("id", true).value as string;
	if (await removeResponse(data.guildId!, id)) {
		data.reply({
			content: "Deleted response successfully",
		});
	} else {
		data.reply({
			content:
				"Couldn't delete the response, Check if you've typed the id correctly\nif you're sure that you're correct, then contact a developer if this had happened more than once",
		});
	}
	return;
}

function CreateUID() {
	const uid = (
		num: number,
		b: number,
		numerals = "0123456789abcdefghijklmnopqrstuvwxyz"
	): any => {
		return (
			(num == 0 && numerals[Math.floor(Math.random() * numerals.length)]) ||
			uid(Math.floor(num / b), b, numerals).replace(
				/\.| +/g,
				numerals[Math.floor(Math.random() * numerals.length)]
			) + numerals[num % b]
		);
	};
	/** 36 is {@link uid}'s numerals length*/
	const mangled = (Date.now() * 36 ** 6) % 36 ** 6;
	return uid(mangled, 36);
}
