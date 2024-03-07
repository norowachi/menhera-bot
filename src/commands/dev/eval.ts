import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { inspect } from "util";
import {
	CommandInteraction,
	Message,
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	EmbedBuilder,
	ButtonStyle,
	MessageActionRowComponentBuilder,
} from "discord.js";

export default class EvalCommand extends BaseCommand {
	constructor() {
		super("eval", "dev");
	}
	async run(client: DiscordClient, interaction: CommandInteraction) {
		if (["534783899331461123"].includes(interaction.user.id)) {
			await evaluate(client, interaction);
		} else return;
	}
}

async function evaluate(
	client: DiscordClient,
	interaction: CommandInteraction
) {
	const code = interaction.options.data[0].value!.toString();
	const XBtn =
		new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("delete-" + interaction.user.id)
				.setStyle(ButtonStyle.Primary)
				.setEmoji("❌")
		);
	try {
		const start = process.hrtime();
		let evaled = code.includes("await")
			? eval(`(async () => { ${code} })()`)
			: eval(code);
		if (evaled instanceof Promise) {
			evaled = await evaled;
		}
		const stop = process.hrtime(start);
		const response = clean(inspect(evaled, { depth: 0 }));
		const evmbed = new EmbedBuilder()
			.setColor("#00FF00")
			.setFooter({
				text: `Time Taken: ${(stop[0] * 1e9 + stop[1]) / 1e6}ms`,
				iconURL: client!.user!.displayAvatarURL(),
			})
			.setTitle("Eval")
			.addFields([
				{ name: `**Output:**`, value: `\`\`\`js\n${response}\n\`\`\`` },
				{ name: `**Type:**`, value: typeof evaled },
			]);

		if (response.length <= 1024) {
			(await interaction.followUp({
				embeds: [evmbed],
				components: [XBtn],
			})) as Message;
		} else if (response.length <= 2048) {
			(await interaction.followUp({
				content: "```js\n" + response + "\n```",
				components: [XBtn],
			})) as Message;
		} else {
			const output = new AttachmentBuilder(Buffer.from(response)).setName(
				"output.txt"
			);
			await interaction.user!.send({ files: [output] });
			(await interaction.followUp({
				content: "Sent Output in DM",
				components: [XBtn],
			})) as Message;
		}
	} catch (err: any) {
		const errevmbed = new EmbedBuilder()
			.setColor("#FF0000")
			.setTitle(`ERROR`)
			.setDescription(`\`\`\`xl\n${clean(err.toString())}\n\`\`\``)
			.setTimestamp()
			.setFooter({
				text: client!.user!.username,
				iconURL: client!.user!.displayAvatarURL(),
			});
		(await interaction.followUp({
			embeds: [errevmbed],
			components: [XBtn],
		})) as Message;
	}
	function clean(text: string) {
		text = text
			.replace(/`/g, `\\\`${String.fromCharCode(8203)}`)
			.replace(/@/g, `@${String.fromCharCode(8203)}`)
			.replace(
				new RegExp(client!.token!, "gi"),
				`NrzaMyOTI4MnU1NT3oDA1rTk4.pPizb1g.hELpb6PAi1Pewp3wAwVseI72Eo`
			)
			.replace(/interaction\.reply/g, "channel.send");
		return stringify(text);
	}
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
