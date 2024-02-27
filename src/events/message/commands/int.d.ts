import { Message } from "discord.js";
import DiscordClient from "../../../client/client";

export interface CommandInt {
	name: string;
	description: string;
	aliases?: string[];
	requireArgs?: boolean;
	run(
		bot: DiscordClient,
		message: Message,
		name?: string,
		args?: string[]
	): Promise<Message | void> | Message | void;
}
