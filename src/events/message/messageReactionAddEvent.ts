import BaseEvent from '../../utils/structures/BaseEvent';
import DiscordClient from '../../client/client';
import {
  ChannelType,
  Message,
  MessageReaction,
  PermissionResolvable,
  TextChannel,
  User,
} from 'discord.js';
import { SendStarMessage } from '../../utils/functions';

export default class messageReactionAddEvent extends BaseEvent {
  constructor() {
    super('messageReactionAdd');
  }
  async run(client: DiscordClient, reaction: MessageReaction, user: User) {
    if (reaction.emoji.name !== '⭐') return;
    if (user.bot) return;
    await reaction.fetch().catch(() => {});
    const message = await reaction.message.fetch();
    // if not hub ignore
    if (message.guild?.id !== '551888982905192459') return; //guild id
    const channel = '930612571076186142'; //#starboard
    if (message.channel.type !== ChannelType.GuildText) return;
    const myPerms = message.channel.permissionsFor(client.user!.id);
    const minCount = 5;
    const neededPerms: PermissionResolvable[] = [
      'ManageMessages',
      'AddReactions',
      'ReadMessageHistory',
      'EmbedLinks',
      'AttachFiles',
    ];
    if (!myPerms?.has(neededPerms)) {
      if (myPerms?.has('SendMessages')) {
        //? optional error message, uncomment if needed
        // message.channel.send({
        // 	content: `Make sure i have ${neededPerms
        // 		.slice(0, neededPerms.length - 2)
        // 		.map((perm) => `**\`${perm.toString()}\`**`)
        // 		.join(", ")} and **\`${neededPerms[
        // 		neededPerms.length - 1
        // 	].toString()}\`**`,
        // });
      }
      return;
    }
    // if message is not sent within the last 7 days (too old) ignore
    if (
      Date.now() - 1000 * 60 * 60 * 24 * 7 >
      reaction.message.createdTimestamp
    )
      return;
    // if author is the reactor ignore
    if (message.author.id === user.id) {
      reaction.users.remove(user).catch(() => {});
      return;
    }
    // if reaction count is less than minimum count ignore
    if (message.channelId !== channel && reaction.count < minCount) return;
    let starChannel = await client.channels.fetch(channel);
    // check channel type
    if (
      !starChannel ||
      ![
        ChannelType.GuildText,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread,
        ChannelType.GuildAnnouncement,
      ].includes(starChannel.type)
    )
      return;
    // force channel typings
    starChannel = starChannel as TextChannel;
    // get the message id, if the message is in the starboard channel get the source message id
    // or just get current message id if its not
    const wannabeStarMsgId =
      message.channelId === starChannel.id &&
      message.author.id === client.user?.id
        ? message.embeds[0].footer
          ? message.embeds[0].footer.text.split(':')[1].replace(/ +/g, '')
          : message.id
        : message.id;
    // fetch last 50 messages in starboard channel
    const fetch = await starChannel.messages.fetch({
      limit: 50,
    });
    // the message in the starboard channel
    const starboardMessage = fetch.find(
      (m) =>
        m.author.id === client.user!.id &&
        m.embeds[0] &&
        (m.embeds[0].footer?.text?.includes(wannabeStarMsgId) || false),
    ) as Message | null;
    // if the message is not in the starboard channel
    if (
      message.channelId !== channel &&
      message.author.id !== client.user?.id
    ) {
      return await SendStarMessage(
        starChannel,
        starboardMessage,
        reaction.count,
        message,
        minCount,
      );
    }
    return;
  }
}
