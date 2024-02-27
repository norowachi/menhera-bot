import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient, { RpTypes } from "../../client/client";
import {
	CommandInteraction,
	User,
	EmbedBuilder,
	GuildMember,
} from "discord.js";

export default class RPCommand extends BaseCommand {
	constructor() {
		super("roleplay", "roleplay");
	}
	async run(client: DiscordClient, int: CommandInteraction) {
		const subCMD = int.options.data[0].name;
		if (
			[
				"bully",
				"bite",
				"cry",
				"cuddle",
				"greet",
				"highfive",
				"kill",
				"kiss",
				"pat",
				"tickle",
				"yeet",
				"smile",
				"punch",
				"lick",
			].includes(subCMD)
		) {
			return await Emotes(client, int, subCMD as RpTypes);
		}
	}
}

function marry(author: User, member: User) {}

//

const RPArray: { type: RpTypes; gifs: string[] }[] = [];

async function Emotes(
	client: DiscordClient,
	interaction: CommandInteraction,
	type: RpTypes
) {
	const gifs = RPArray.find((c) => c.type == type)!.gifs;
	const gif = gifs[Math.floor(Math.random() * gifs.length)];
	const author = interaction.user;
	const member = interaction.options.getMember("user") as GuildMember;

	if (member.user.id == author.id) {
		const embed = new EmbedBuilder()
			.setDescription("You need to provide another user not yourself!")
			.setColor("Red");
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}
	// Defining the embed
	const embed = new EmbedBuilder();
	// Getting the int text
	const text = client.rpText("kiss", author.id, member.id);

	// Getting an img from mongodb
	if (!gif || !text) {
		interaction.reply({
			content: "This interation is not working currently",
			ephemeral: true,
		});
		return;
	}
	embed
		.setImage(gif)
		.setDescription(`**${text}**`)
		.setColor(member.displayColor);

	await interaction.reply({ embeds: [embed] });
}
