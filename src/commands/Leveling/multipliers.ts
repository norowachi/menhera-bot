import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { ChannelType, CommandInteraction } from "discord.js";
import { ModifyMulti } from "../../database/functions/guildSettingsFunctions";

export default class MultipliersCommand extends BaseCommand {
	constructor() {
		super("multipliers", "leveling");
	}
	async run(client: DiscordClient, interaction: CommandInteraction) {
		const group = interaction.options.data[0].name;
		switch (group) {
			case "role": {
				const subcmd = interaction.options.data[0].options![0].name;
				const role = interaction.options.get("role", true).role!;
				const xp = interaction.options.get("xp", false)?.value as
					| number
					| undefined;
				if (xp && xp < 0) {
					interaction.followUp({
						content: "Xp has to be a positive number",
					});
					return;
				}
				if (role.id === interaction.guildId) {
					interaction.followUp({
						content: `You can't change everyone's xp multiplier, try using the \`/modifiers\` command`,
					});
					return;
				}
				switch (subcmd) {
					case "add": {
						if (await ModifyMulti(interaction.guildId!, "add", role.id, xp!)) {
							interaction.followUp({
								content: `Added <@&${
									role.id
								}> with ${xp!} exp to the multipliers list`,
								allowedMentions: { parse: ["users"] },
							});
						} else {
							interaction.followUp({
								content:
									"Couldn't save the data, please try again later or try contacting a developer",
							});
						}
						return;
					}
					case "edit": {
						if (await ModifyMulti(interaction.guildId!, "edit", role.id, xp!)) {
							interaction.followUp({
								content: `Edited the exp multiplier of <@&${
									role.id
								}> to ${xp!}`,
								allowedMentions: { parse: ["users"] },
							});
						} else {
							interaction.followUp({
								content:
									"Couldn't save the data, please try again later or try contacting a developer if this have happened more than once",
							});
						}
						return;
					}
					case "remove": {
						if (
							await ModifyMulti(interaction.guildId!, "remove", role.id, xp!)
						) {
							interaction.followUp({
								content: `Removed <@&${role.id}> from the multipliers list`,
								allowedMentions: { parse: ["users"] },
							});
						} else {
							interaction.followUp({
								content:
									"Couldn't save the data, please try again later or try contacting a developer if you've faced this bug more than once",
							});
						}
						return;
					}
					default:
						return;
				}
			}
			case "channel": {
				const subcmd = interaction.options.data[0].options![0].name;
				const channel = interaction.options.get("channel", true).channel!;
				const xp = interaction.options.get("xp", false)?.value as number|undefined;
				if (xp && xp < 0) {
					interaction.followUp({
						content: "Xp has to be a positive number",
					});
					return;
				}
				if (channel.type != ChannelType.GuildText) {
					interaction.followUp({
						content: `You can change multipliers of normal **\`Guild Text\`** channels only`,
					});
					return;
				}
				switch (subcmd) {
					case "add": {
						if (
							await ModifyMulti(interaction.guildId!, "add", channel.id, xp!)
						) {
							interaction.followUp({
								content: `Added <#${
									channel.id
								}> with ${xp!} exp to the multipliers list`,
							});
						} else {
							interaction.followUp({
								content:
									"Couldn't save the data, please try again later or try contacting a developer",
							});
						}
						return;
					}
					case "edit": {
						if (
							await ModifyMulti(interaction.guildId!, "edit", channel.id, xp!)
						) {
							interaction.followUp({
								content: `Edited the exp multiplier of <#${
									channel.id
								}> to ${xp!}`,
							});
						} else {
							interaction.followUp({
								content:
									"Couldn't save the data, please try again later or try contacting a developer if this have happened more than once",
							});
						}
						return;
					}
					case "remove": {
						if (
							await ModifyMulti(interaction.guildId!, "remove", channel.id, xp!)
						) {
							interaction.followUp({
								content: `Removed <#${channel.id}> from the multipliers list`,
							});
						} else {
							interaction.followUp({
								content:
									"Couldn't save the data, please try again later or try contacting a developer if you've faced this bug more than once",
							});
						}
						return;
					}
					default:
						return;
				}
			}
			default:
				return;
		}
	}
}
