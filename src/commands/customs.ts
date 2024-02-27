import BaseCommand from "../utils/structures/BaseCommand";
import DiscordClient from "../client/client";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	ComponentType,
	EmbedBuilder,
	Interaction,
	MessageActionRowComponentBuilder,
	ModalBuilder,
	ModalSubmitInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import {
	getResponses,
	EditResponse,
} from "../database/functions/customRespFunctions";
import { CustomResp } from "../utils/GlobalTypes";

const timeout = 10 * 60 * 1000;
export default class CustomCommand extends BaseCommand {
	constructor() {
		super("customs", "utils");
	}
	async run(client: DiscordClient, interaction: CommandInteraction) {
		const edit = `edit-${interaction.user.id}`;
		const select = `select-${interaction.user.id}`;
		// modal stuff
		const ModalEdit = `medit-${interaction.user.id}`;
		const ModalKeyword = `mtkey-${interaction.user.id}`;
		const ModalReaction = `mtrcn-${interaction.user.id}`;
		const ModalMessages = `mtmsgs-${interaction.user.id}`;

		const components = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(edit)
				.setLabel("Edit")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(true)
		);
		const responses_menu =
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder({
					custom_id: select,
					placeholder: "Select the response you want to view",
				})
			);
		const embed = new EmbedBuilder().setTitle(`${interaction.guild!.name}`);
		await List(embed, interaction, {
			row1: components,
			row2: responses_menu,
		});
		const filter = (m: Interaction) => interaction.user.id === m.user.id;
		const collector = (
			await interaction.fetchReply()
		).createMessageComponentCollector({
			filter,
			time: timeout,
		});

		collector.on("collect", async (i: ButtonInteraction) => {
			if (i.customId === edit) {
				const id = (await i.message.fetch()).embeds[0].footer?.text.split(
					": "
				)[1];
				if (!id) return;
				const resp: CustomResp = (
					await getResponses(interaction.guildId!)
				).filter((r) => r.id === id)[0];
				if (!resp) return;
				const modal = new ModalBuilder()
					.setCustomId(ModalEdit)
					.setTitle("Edit response")
					.addComponents([
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId(ModalKeyword)
								.setLabel("Keyword")
								.setStyle(TextInputStyle.Short)
								.setValue(resp.keyword)
								.setMinLength(1)
								.setMaxLength(100)
								.setPlaceholder("Keyword")
								.setRequired(true)
						),
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId(ModalReaction)
								.setLabel("Reaction")
								.setStyle(TextInputStyle.Paragraph)
								.setValue(resp.reaction || "")
								.setMaxLength(100)
								.setPlaceholder("Reaction")
								.setRequired(false)
						),
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId(ModalMessages)
								.setLabel("Messages")
								.setStyle(TextInputStyle.Paragraph)
								.setValue(resp.messages?.join("\n---\n") || "")
								.setMaxLength(4000)
								.setPlaceholder(
									"Messages (put <new line>---<new line> between different messages)"
								)
								.setRequired(false)
						),
					]);

				return await i.showModal(modal);
			}
		});
		client.on("interactionCreate", ModalIntSubmit);
		async function ModalIntSubmit(int: Interaction) {
			if (!int.isModalSubmit()) return;
			if (int.customId !== ModalEdit) return;
			const keyword = int.fields.getTextInputValue(ModalKeyword);
			const reaction = int.fields.getTextInputValue(ModalReaction);
			const messages = int.fields
				.getTextInputValue(ModalMessages)
				?.split(/\n---\n/g);
			int.deferReply({ ephemeral: true });
			const resp = await Edit(
				client,
				int,
				(await int.message?.fetch())?.embeds[0].footer?.text.split(": ")[1],
				keyword,
				reaction,
				messages
			);
			if (resp) return;
		}
		setTimeout(() => client.off("interactionCreate", ModalIntSubmit), timeout);
	}
}

async function List(
	embed: EmbedBuilder,
	data: CommandInteraction,
	components: {
		row1: ActionRowBuilder<ButtonBuilder>;
		row2: ActionRowBuilder<StringSelectMenuBuilder>;
	}
) {
	async function updateResps() {
		const resps: CustomResp[] = await getResponses(data.guildId!);
		if (!resps.length) return [];
		const ResData: CustomResp[][] = [];
		let k = 10;
		for (let i = 0; i < resps.length; i += 10) {
			const currentQueue = resps.slice(i, k);
			k += 10;

			ResData.push(currentQueue);
		}
		return ResData;
	}

	let ResData = await updateResps();
	if (ResData?.length <= 0) return data.editReply("No Data");
	let currentPage = 0;
	const prev = `previous-${data.user.id}`;
	const next = `next-${data.user.id}`;
	const back = `back-${data.user.id}`;

	const BackButton =
		new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(back)
				.setLabel("Back to list")
				.setStyle(ButtonStyle.Primary)
		);
	const bothButtons =
		new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(prev)
				.setEmoji("⬅️")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(next)
				.setEmoji("➡️")
				.setStyle(ButtonStyle.Primary)
		);
	const forwardButton =
		new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(prev)
				.setEmoji("⬅️")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(true),
			new ButtonBuilder()
				.setCustomId(next)
				.setEmoji("➡️")
				.setStyle(ButtonStyle.Primary)
		);
	const prevButton =
		new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(prev)
				.setEmoji("⬅️")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(next)
				.setEmoji("➡️")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(true)
		);

	components.row2.components[0].setOptions(
		ResData[currentPage].map((v) => {
			return {
				label: v.keyword,
				value: v.id,
				description: `${v.id} - ${v.createdBy}`,
			};
		})
	);
	data.editReply({
		content:
			"In `EditModal` put **<new line>---<new line>** between every different message",
		embeds: [
			embed
				.setAuthor({
					name: `${ResData.flatMap((v) => v).length} Response(s)`,
				})
				.setDescription(
					ResData[currentPage]
						.map((r) => `ID: ${r.id}\nKeyword: ${r.keyword}`)
						.join("\n\n")
				)
				.setFooter({ text: `Page: ${currentPage + 1}/${ResData.length}` }),
		],
		components: [components.row1, components.row2, forwardButton],
	});

	const filter = (m: Interaction) => data.user.id === m.user.id;
	const ButtonCollector = (
		await data.fetchReply()
	).createMessageComponentCollector({
		filter,
		time: timeout,
		componentType: ComponentType.Button,
	});

	ButtonCollector.on("collect", async (i: ButtonInteraction) => {
		if (i.customId === next) {
			currentPage++;
			components.row2.components[0].setOptions(
				ResData[currentPage].map((v) => {
					return {
						label: v.keyword,
						value: v.id,
						description: `${v.id} - ${v.createdBy}`,
					};
				})
			);
			await i.update({
				embeds: [
					embed
						.setDescription(
							ResData[currentPage]
								.map((r) => `ID: ${r.id}\nKeyword: ${r.keyword}`)
								.join("\n\n")
						)
						.setFooter({
							text: `Page: ${currentPage + 1}/${ResData.length}`,
						}),
				],
				components: [
					components.row1,
					components.row2,
					currentPage === ResData.length - 1 ? prevButton : bothButtons,
				],
			});
		} else if (i.customId === prev) {
			--currentPage;
			components.row2.components[0].setOptions(
				ResData[currentPage].map((v) => {
					return {
						label: v.keyword,
						value: v.id,
						description: `${v.id} - ${v.createdBy}`,
					};
				})
			);
			await i.update({
				embeds: [
					embed
						.setDescription(
							ResData[currentPage]
								.map((r) => `ID: ${r.id}\nKeyword: ${r.keyword}`)
								.join("\n\n")
						)
						.setFooter({
							text: `Page: ${currentPage + 1}/${ResData.length}`,
						}),
				],
				components: [
					components.row1,
					components.row2,
					currentPage === 0 ? forwardButton : bothButtons,
				],
			});
		}
		if (i.customId === back) {
			ResData = await updateResps();
			if (ResData?.length <= 0) return;
			const Current_ResData = ResData.filter((rd) =>
				rd.filter(
					async (r) =>
						r.id ===
						(await i.message.fetch())?.embeds[0].footer?.text.split(": ")[1]
				)
			)[0];
			currentPage = Current_ResData ? ResData.indexOf(Current_ResData) : 0;
			components.row1.components[0].setDisabled(true);
			await i.update({
				embeds: [
					embed
						.setAuthor({
							name: `${ResData.flat(Infinity).length} Response(s)`,
						})
						.setDescription(
							ResData[currentPage]
								.map((r) => `ID: ${r.id}\nKeyword: ${r.keyword}`)
								.join("\n\n")
						)
						.setFooter({
							text: `Page: ${currentPage + 1}/${ResData.length}`,
						}),
				],
				components: [
					components.row1,
					components.row2,
					currentPage === 0
						? forwardButton
						: currentPage === ResData.length - 1
						? prevButton
						: bothButtons,
				],
			});
		}
		return;
	});
	ButtonCollector.on("end", () => {
		data.editReply({
			components: [
				components.row1,
				components.row2,
				new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId(prev)
						.setEmoji("⬅️")
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId(next)
						.setEmoji("➡️")
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true)
				),
			],
		});
		return;
	});
	const MenuCollector = (
		await data.fetchReply()
	).createMessageComponentCollector({
		filter,
		time: timeout,
		componentType: ComponentType.StringSelect,
	});

	MenuCollector.on("collect", async (i: StringSelectMenuInteraction) => {
		if (i.customId === components.row2.components[0].data.custom_id) {
			let resp = (await updateResps())
				.flatMap((v) => v)
				.find((v) => v.id === i.values[0]);
			if (!resp) return;
			components.row1.components[0].setDisabled(false);
			await i.update({
				embeds: [
					embed
						.setDescription(
							`**ID:** ${resp.id}\n**Keyword:** ${resp.keyword}\n${
								resp.reaction ? `**Reaction:** ${resp.reaction}\n` : ""
							}${
								resp.messages && resp.messages.length > 0
									? `**Messages:** ${[
											"```js",
											"[",
											resp.messages
												.map((s: any) => `"${s.replace(/"/g, `\\"`)}"`)
												.join(",\n"),
											"]",
											"```",
									  ].join("\n")}\n`
									: ""
							}**Created By:** <@!${resp.createdBy}>`
						)
						.setFooter({
							text: `ID: ${resp.id}`,
						}),
				],
				components: [components.row1, BackButton],
			});
		}
		return;
	});
}

async function Edit(
	client: DiscordClient,
	data: ModalSubmitInteraction,
	id: string | undefined,
	keyword: string,
	reaction: string,
	messages: string[]
) {
	if (!id) return false;
	const resp: CustomResp = (await getResponses(data.guildId!)).filter(
		(r) => r.id === id
	)[0];
	if (!resp) return false;
	if (!reaction && !messages.length) {
		data.editReply({
			content: "You have to include either `reaction` or `message`",
		});
		return false;
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
		data.editReply({
			content: `**reaction** is not an emoji that I have access to`,
		});
		return false;
	}
	if (
		await EditResponse(data.guildId!, {
			id: id,
			keyword: keyword,
			reaction: reaction,
			messages: messages,
			createdBy: data.user.id,
		})
	) {
		data.message?.edit({
			embeds: [
				new EmbedBuilder().setDescription(
					`**Id:** ${id}\n**Keyword:** ${keyword}\n${
						reaction ? `**Reaction:** ${reaction}\n` : ""
					}${
						messages.length
							? `**Message:** ${[
									"```js",
									"[",
									messages
										.map((s) => `"${s.replace(/"/g, `\\"`)}"`)
										.join(",\n"),
									"]",
									"```",
							  ].join("\n")}\n`
							: ""
					}\n**Created By:** <@!${data.user.id}>`
				),
			],
		});
		data.editReply({ content: "Done." });
	} else {
		data.editReply({
			content: `There was an error please try again later, if this had happened more than once contact a developer...`,
		});
		return false;
	}
	return true;
}
