import BaseEvent from '../../utils/structures/BaseEvent.js';
import { Message } from 'discord.js';
import DiscordClient from '../../client/client.js';
import { expSystem } from '../../utils/modules/expSystem.js';

export default class MessageEvent extends BaseEvent {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;
    if (!message.guild) return;
    await expSystem(client, message);
  }
}
