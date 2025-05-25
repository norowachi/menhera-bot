import BaseCommand from '../../utils/structures/BaseCommand.js';
import DiscordClient from '../../client/client.js';
import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageContextMenuCommandInteraction,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

export default class CustomCommand extends BaseCommand {
  constructor() {
    super('Report Message', 'moderation');
  }
  async run(client: DiscordClient, data: MessageContextMenuCommandInteraction) {
    data.showModal(
      new ModalBuilder()
        .setTitle(`Report Message`)
        .setCustomId(`report-${data.targetId}`)
        .setComponents([
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId(`${data.targetId}-msg`)
              .setLabel('Message')
              .setPlaceholder(
                `${
                  data.targetMessage.content.length > 1
                    ? data.targetMessage.content.length > 100
                      ? data.targetMessage.content.slice(0, 100)
                      : data.targetMessage.content
                    : '-'
                }`,
              )
              .setMaxLength(1)
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false),
          ),
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId(`${data.targetId}-reason`)
              .setLabel('Reason')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true),
          ),
        ]),
    );
    const modalSubmit = await data.awaitModalSubmit({
      time: 15 * 60 * 1000,
      filter: (i) =>
        i.user.id === data.user.id && i.customId === `report-${data.targetId}`,
    });
    if (!modalSubmit) {
      data.reply({ ephemeral: true, content: 'Modal timed out.' });
      return;
    }

    (client.channels.cache.get('1122654657915912307') as TextChannel).send({
      content: data.targetMessage.url,
      embeds: [
        new EmbedBuilder()
          .setTitle('New Report!')
          .setDescription(
            `**Reported Message:**\n\n${data.targetMessage.content}\n\n**${data.targetMessage.attachments.size} Attachments**\n\n**Reason:**\n${modalSubmit.components[1].components[0].value}`,
          )
          .setFields([
            {
              name: 'Report By',
              value: `<@${modalSubmit.user.id}> (${modalSubmit.user.username}, ${modalSubmit.user.id})`,
            },
            {
              name: 'Report On',
              value: `<@${data.targetMessage.author.id}> (${data.targetMessage.author.username}, ${data.targetMessage.author.id})`,
            },
          ]),
      ],
    });
    modalSubmit.reply({
      ephemeral: true,
      content: 'Your report has been submitted',
    });
  }
}
