import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	RoleSelectMenuBuilder,
	TextChannel,
} from "discord.js";
import { initDoc } from "../../database/functions/rolesFunction";

export default class CreateReactRole extends BaseCommand {
	constructor() {
		super("create-self-role", "roles");
	}
	async run(client: DiscordClient, interaction: CommandInteraction) {
		// if (!interaction.replied) interaction.deferReply({ ephemeral: true });
		const channel = interaction.options.get("channel")?.channel as TextChannel;
		if (!channel.isTextBased()) {
			interaction.editReply({ content: "Channel has to be text-based" });
			return;
		}
		let AllowedRoles: string[] | undefined = [];
		let RoleIDs: { name: string; id: string; position: string }[] = [];

		const date = Math.floor(Date.now() / 1000).toString();
		const roleMenu =
			new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(
				new RoleSelectMenuBuilder()
					.setCustomId(`rm-${date}`)
					.setPlaceholder("Choose roles to add to self-roles list")
					.setMinValues(1)
					.setMaxValues(25)
			);
		const ReqMenu = new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(
			new RoleSelectMenuBuilder()
				.setCustomId(`req-${date}`)
				.setPlaceholder("(OPTIONAL) Roles allowed to use the sel-roles list")
				.setMinValues(0)
				.setMaxValues(20)
		);
		const endBtn = new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setCustomId(`send-${date}`)
				.setLabel("Send")
				.setStyle(ButtonStyle.Success)
				.setDisabled(true)
		);
		const embed = new EmbedBuilder()
			.setTitle("Self-Role Builder")
			.setDescription("Nothing selected yet...");
		interaction.editReply({
			embeds: [embed],
			components: [roleMenu, ReqMenu, endBtn],
		});
		const collector = (
			await interaction.fetchReply()
		).createMessageComponentCollector({
			time: 10 * 60 * 1000,
			// filter: (m) => m.id === interaction.user.id,
		});
		collector.on("collect", async (int) => {
			if (int.customId === `rm-${date}` && int.isRoleSelectMenu()) {
				RoleIDs = int.roles.map((r) => {
					return {
						name: r.name,
						id: r.id,
						position: r.position.toString(),
					};
				});
				endBtn.components[0].setDisabled(false);
				await int.update({
					embeds: [
						embed.setDescription(
							"Self-Roles: " + int.roles.map((r) => `<@&${r.id}>`).join(", ")
						),
					],
					components: [roleMenu, ReqMenu, endBtn],
				});
				return;
			}
			if (int.customId === `req-${date}` && int.isRoleSelectMenu()) {
				AllowedRoles = int.roles.map((r) => r.id);
				await int.update({
					embeds: [
						embed.setFields({
							name: "required roles",
							value: AllowedRoles.map((r) => `<@&${r}>`).join(", "),
						}),
					],
				});
				return;
			}
			if (int.customId === `send-${date}`) {
				if (!interaction.replied) interaction.deferReply({ ephemeral: true });
				if (!RoleIDs || RoleIDs.length <= 0) {
					interaction.reply({
						content: "You have to choose at least 1 self-role",
						ephemeral: true,
					});
				}
				const msg = await channel
					.send({
						components: [
							new ActionRowBuilder<ButtonBuilder>().setComponents(
								new ButtonBuilder()
									.setCustomId("show-roles")
									.setLabel("Show Roles")
									.setStyle(ButtonStyle.Primary)
							),
						],
					})
					.catch((err) =>
						interaction.reply({ content: `Error: ${err}`, ephemeral: true })
					);
				await initDoc(msg.id, RoleIDs, AllowedRoles);
				int.reply({ content: "Done", ephemeral: true });
				collector.emit("end");
				return;
			}
		});
		collector.on("end", () => {
			interaction.editReply({ components: [] });
			return;
		});
	}
}
