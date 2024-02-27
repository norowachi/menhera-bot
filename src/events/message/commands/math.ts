import { EmbedBuilder, Message } from "discord.js";
import DiscordClient from "../../../client/client";
import mathExp from "math-expression-evaluator";
import { CommandInt } from "./int";

export default {
	name: "math",
	description: "Evaluate math expressions",
	// aliases: ["m"],
	requireArgs: true,
	run: (
		_client: DiscordClient,
		message: Message,
		_name: string,
		args: string[]
	) => {
		const embed = new EmbedBuilder().setFooter({
			text: message.author.tag,
		});
		try {
			const mexp = new mathExp();
			const result = mexp.eval(
				args
					.join(" ")
					.replace(/(\d{0,}\.?\d{0,})e(\d{0,}\.?\d{0,})/g, (substr, _args) => {
						const [a, b] = substr.split("e");
						return `${parseFloat(a) * Math.pow(10, parseFloat(b))}`;
					}),
				mexp.tokens,
				{}
			);
			embed.setDescription(`${result}`);
		} catch (err) {
			embed.setDescription(`${err}`);
		}
		return message.reply({ embeds: [embed] });
	},
} as CommandInt;
