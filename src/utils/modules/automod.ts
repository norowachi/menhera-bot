import { Message, TextChannel } from 'discord.js';
import DiscordClient from '../../client/client.js';
import { IsMenheraServer } from '../functions.js';

export async function antiInvite(client: DiscordClient, message: Message) {
  const isMod = message.member?.roles.cache.some(
    // @moderator role
    (role) => role.id === '880737692864888843',
  );
  if (isMod) return;

  // 6 groups, last one is the code
  const invite =
    /(https?:\/\/)?(www\.)?(discord\.gg|discordapp\.com\/invite|discord\.com\/invite|(^|\s)\.gg)\/([a-zA-Z0-9]+)/gi.exec(
      message.content,
    )?.[5];
  if (!invite) return;

  const inviteInfo = await client.fetchInvite(invite);
  const id = inviteInfo?.guild?.id;

  const automodChannel = client.channels.cache.get(
    '1079853758219042980',
  ) as TextChannel;

  // if invite guild id is found and it's not menhera server
  if (id && !IsMenheraServer(id)) {
    message.delete();
    // notify user about rules
    (message.channel as TextChannel)
      .send(
        `<@${message.author.id}>, sharing invites from other servers is not allowed here! 🚫`,
      )
      .then((msg) => {
        setTimeout(() => msg.delete(), 10 * 1000);
      });
    // send log
    automodChannel.send({
      embeds: [
        {
          color: 0xff0000,
          title: 'Automod - Invite Deleted',
          description: message.content,
          author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL(),
          },
          fields: [
            {
              name: 'User',
              value: `<@${message.author.id}> (${message.author.id})`,
              inline: true,
            },
            {
              name: 'Channel',
              value: `<#${message.channel.id}> (${message.channel.id})`,
              inline: true,
            },
            {
              name: 'Invited Server',
              value: `**${
                inviteInfo?.guild?.name || 'Unknown Server'
              }** (${id || 'No Guild ID'}) | `,
              inline: true,
            },
          ],
          footer: {
            text: 'Menhera Automod Yippie :3',
          },
        },
      ],
    });
    return;
  }
}
