import BaseEvent from '../../utils/structures/BaseEvent.js';
import { EmbedBuilder, Message } from 'discord.js';
import DiscordClient from '../../client/client.js';
import { expSystem } from '../../utils/modules/expSystem.js';
import { antiInvite } from '../../utils/modules/automod.js';
import { scanAttachments } from '../../utils/modules/imgScan.js';

export default class MessageEvent extends BaseEvent {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;
    if (!message.guild) return;
    Promise.all([
      expSystem(client, message),
      antiInvite(client, message),
      imgScan(client, message),
    ]);
  }
}

async function imgScan(client: DiscordClient, message: Message) {
  const searchValues = ['crypto casino', '/mrbeast'];
  const hit = await scanAttachments(
    message.attachments,
    searchValues,
    client.OCRWorker,
  );
  const user = message.author;
  if (hit) {
    const reason = 'Image Scan - Search value: `' + hit.match + '`';
    const logEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Moderation | Timeout | ${user.tag}`,
        iconURL: user.displayAvatarURL(),
      })
      .addFields([
        { name: 'User', value: `<@${user.id}>`, inline: true },
        {
          name: 'Moderator',
          value: `<@${client.application?.id}>`,
          inline: true,
        },
        { name: 'Reason', value: reason, inline: true },
      ])
      .setImage(hit.attachment.url)
      .setFooter({ text: user.id })
      .setTimestamp()
      .setColor('#7289da');
    await client.logChannel.send({ embeds: [logEmbed] });

    // timeout the member and delete message
    await message.delete();
    await message.member?.timeout(24 * 60 * 60 * 1000, reason);
  }
  return;
}
