import BaseEvent from '../../utils/structures/BaseEvent.js';
import DiscordClient from '../../client/client.js';
import {
  EmbedBuilder,
  GuildMember,
  GuildTextBasedChannel,
  TextChannel,
} from 'discord.js';
import { IsMenheraServer } from '../../utils/functions.js';
// import { DelUserExp } from "../../database/functions/userexpFunction";

export default class GuildMemberRemoveEvent extends BaseEvent {
  constructor() {
    super('guildMemberRemove');
  }
  async run(client: DiscordClient, member: GuildMember) {
    // close the user's ticket if they have one open
    const activeThreads = await member.guild.channels.fetchActiveThreads();
    const userTicket = activeThreads.threads.find(
      (t) => t.name === `ticket-${member.user.username}`,
    );
    if (userTicket) {
      userTicket.setLocked(true).catch(() => {});
      userTicket.setArchived(true, 'User left the server').catch(() => {});
      await (
        member.guild.channels.cache.get(
          '1122654657915912307',
        ) as GuildTextBasedChannel
      ) // mod reports channel
        ?.send({
          embeds: [
            {
              title: 'Ticket closed',
              description: `Ticket <#${userTicket.id}> closed due to <@${member.user.id}> leaving the server.`,
              color: 0xeb66ffff,
              timestamp: new Date().toISOString(),
            },
          ],
        })
        .catch(() => {});
    }
    if (!IsMenheraServer(member.guild.id)) return;
    //LeaveMSGS(member);
    //! Delete member's exp data
    //DelUserExp(member.user.id);
    const joinLog = (await client.channels.fetch(
      '1122654512193220720',
    )) as TextChannel;
    const embed = new EmbedBuilder()
      .setAuthor({
        name: member.user.tag,
        iconURL: member.displayAvatarURL({ forceStatic: true }),
      })
      .setThumbnail(member.displayAvatarURL())
      .setDescription(
        [
          `**<@${member.id}> left the server.**`,
          `**Joined At**: <t:${Math.floor(
            (member.joinedAt?.getTime() || 0) / 1000,
          )}:f>`,
          `**Roles They Had**: ${member.roles.cache
            .map((r) => `<@&${r.id}>`)
            .join('\n')}`,
        ].join('\n'),
      );
    joinLog.send({ embeds: [embed] });
  }
}

// discontinued ig
// async function LeaveMSGS(member: GuildMember) {
//   const hubchannel = '554449488693952512';

//   const HubLeaveDM = `You don't love me??? <a:MenheraPhoneCry4:1044832211641307137> Please come back, I promise I'll change! Please don't leave me!`;

//   if (member.guild.channels.cache.has(hubchannel)) {
//     await member.send(HubLeaveDM).catch(() => {});
//   }
//   return;
// }
