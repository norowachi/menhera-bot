import { GuildTextBasedChannel, User } from 'discord.js';
import DiscordClient from '../client/client.js';
import BaseEvent from '../utils/structures/BaseEvent.js';

export default class UserUpdateEvent extends BaseEvent {
  constructor() {
    super('userUpdate');
  }
  async run(client: DiscordClient, oldUser: User, newUser: User) {
    if (oldUser.username === newUser.username) return; // username didn't change
    // get menhera server
    const guild = client.guilds.cache.get('551888982905192459');
    if (!guild) return;
    // rename user's ticket if they have one open
    const activeThreads = await guild.channels.fetchActiveThreads();
    const userTicket = activeThreads.threads.find(
      (t) => t.name === `ticket-${oldUser.username}`,
    );
    if (userTicket) {
      // rename ticket
      userTicket.setName(`ticket-${newUser.username}`).catch(() => {});
      // log
      await (
        guild.channels.cache.get('1122654657915912307') as GuildTextBasedChannel
      ) // mod reports channel
        ?.send({
          embeds: [
            {
              title: 'Ticket renamed',
              description: `Ticket <#${userTicket.id}> was renamed due to user changing their username.`,
              color: 0xeb66ffff,
              timestamp: new Date().toISOString(),
            },
          ],
        })
        .catch(() => {});
    }
  }
}
