import BaseCommand from '../../utils/structures/BaseCommand.js';
import DiscordClient from '../../client/client.js';
import { CommandInteraction } from 'discord.js';

export default class PingCommand extends BaseCommand {
  constructor() {
    super('ping', 'general');
  }
  async run(_client: DiscordClient, data: CommandInteraction) {
    await data.reply({
      target: data.user,
      content: 'Pong',
      fetchReply: true,
    });
  }
}
