import {
	EmbedBuilder,
	CommandInteraction,
	ActionRowBuilder,
	ButtonBuilder,
	Interaction,
	ButtonInteraction,
	Message,
	TextChannel,
	ButtonStyle,
	MessageActionRowComponentBuilder,
	ComponentType,
	PartialMessage,
	Awaitable,
} from "discord.js";
import DiscordClient from "../client/client";

export async function PageButtonInteraction(
	embeds: EmbedBuilder[],
	interaction: CommandInteraction
) {
	const date = Date.now();
	let currentPage = 0;
	const prev = `previous-${interaction.user.id}-${date}`;
	const next = `next-${interaction.user.id}-${date}`;
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
	interaction
		.editReply({
			embeds: [embeds[0]],
			components: [bothButtons],
		})
		.catch(console.error);
	const filter = (m: Interaction) => interaction.user.id === m.user.id;
	const collector = (
		await interaction.fetchReply()
	).createMessageComponentCollector({
		filter,
		time: 2.5 * 60 * 1000,
		componentType: ComponentType.Button,
	});

	collector.on("collect", async (i: ButtonInteraction) => {
		if (i.customId === next) {
			if (currentPage < embeds.length - 1) {
				currentPage++;
				if (currentPage === embeds.length - 1) {
					await i.update({
						embeds: [embeds[currentPage]],
						components: [prevButton],
					});
				} else {
					await i.update({
						embeds: [embeds[currentPage]],
						components: [bothButtons],
					});
				}
			}
		} else if (i.customId === prev) {
			if (currentPage !== 0) {
				--currentPage;
				if (currentPage === 0) {
					await i.update({
						embeds: [embeds[currentPage]],
						components: [forwardButton],
					});
				} else {
					await i.update({
						embeds: [embeds[currentPage]],
						components: [bothButtons],
					});
				}
			}
		}
		return;
	});
	collector.on("end", () => {
		interaction.editReply({
			components: [
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
}

export async function SendStarMessage(
	starChannel: TextChannel,
	starMsg: Message | null,
	reactionCount: number,
	message: Message,
	minStars: number
) {
	if (!starMsg) {
		const TooLargeAttachments: string[] = [];
		const attachments: string[] = [];
		if (message.attachments.size >= 1) {
			for (let i = 0; i <= message.attachments.size - 1; i++) {
				if (message.attachments.at(i)!.size / 1024 ** 2 < 8) {
					attachments.push(message.attachments.at(i)!.url);
				}
			}
		}
		const ImageEmbeds = message.embeds.filter((embed) => !!embed.data.url);
		if (ImageEmbeds.length >= 1) {
			for (let i = 0; i <= ImageEmbeds.length - 1; i++) {
				attachments.push(ImageEmbeds[i]!.url!);
			}
		}
		const embed = new EmbedBuilder()
			.setAuthor({
				name: message.author.username + "#" + message.author.discriminator,
				iconURL: message.author.displayAvatarURL(),
			})
			.setDescription(
				message.content.length <= 2000
					? message.content || null
					: message.content.slice(0, 2000 - message.content.length) + "..."
			)
			.setTitle("Go to source!")
			.setURL(message.url)
			.setColor("Gold")
			.setFooter({
				text: `messageId: ${message.id}`,
			})
			.setTimestamp();

		starChannel
			.send({
				content: `**${SetStar(reactionCount)} ${reactionCount}** | <#${
					message.channel.id
				}>`,
				embeds: [embed],
				files: attachments,
			})
			.catch(() => {});
	} else {
		updateStars(starMsg, reactionCount, minStars);
	}
	return;
}

export function updateStars(
	starMsg: Message | null,
	newCount: number,
	minStars: number
) {
	if (!starMsg) return;
	const channelId = starMsg.content.replace(/(<|>)/g, "").split("#")[1];
	if (newCount < minStars) return starMsg.delete();
	starMsg
		.edit({
			content: `**${SetStar(newCount)} ${newCount}** | <#${channelId}>`,
		})
		.catch(() => {});
}

function SetStar(count: number) {
	if (count >= 20) return "💫";
	if (count >= 15) return "✨";
	if (count >= 10) return "🌟";
	return "⭐";
}

/**
 * get card codes; karuta utils
 * @param msg
 * @param author
 * @returns
 */
export function getCardCodes(client: DiscordClient, msg: Message) {
	if (msg.author.id !== "646937666251915264") return;
	if (msg.embeds[0]?.title?.toLowerCase() !== "card collection") return;
	if (
		!msg.embeds?.at(0)?.description ||
		msg.embeds?.at(0)?.description?.includes("The list is empty")
	)
		// (no description || empty list) == no cards
		return msg.reply(`can't find any cards`);
	const cards_array: string[] = [];
	let msgToEdit: Message<boolean> | null;
	addToCardsArray(msg);

	client.on("messageUpdate", MsgUpdate);

	function MsgUpdate(
		oldMessage: Message<boolean> | PartialMessage,
		newMessage: Message<boolean> | PartialMessage
	): Awaitable<void> {
		if (newMessage.id !== msg.id) return;
		if (newMessage.embeds[0] == oldMessage.embeds[0]) return;
		return addToCardsArray(newMessage);
	}

	async function addToCardsArray(message: Message | PartialMessage) {
		const array = message.embeds?.at(0)?.description?.split(/\n+/g)!;
		array.shift();
		array
			.map((s) => /\`[a-z0-9][^`]*\`/.exec(s)?.[0]!)
			.forEach((card) => {
				if (!cards_array.includes(card) && cards_array.length < 50)
					cards_array.push(card);
				if (cards_array.length >= 50) client.off("messageUpdate", MsgUpdate);
				return;
			});
		if (!msgToEdit) {
			msgToEdit = await msg.reply(cards_array.join(", ").replace(/`/g, ""));
			return;
		}
		msgToEdit.edit(cards_array.join(", ").replace(/`/g, ""));
		return;
	}
	setTimeout(() => client.off("messageUpdate", MsgUpdate), 5 * 60 * 1000);
}

export function IsMenheraServer(guildId: string): boolean {
	// if guild is mini or hub return true ( [miniId, hubId] )
	if (["1071581732807122956", "551888982905192459"].includes(guildId))
		return true;
	return false;
}
