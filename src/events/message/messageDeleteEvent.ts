import BaseEvent from '../../utils/structures/BaseEvent.js';
import DiscordClient from '../../client/client.js';
import { Message, TextChannel } from 'discord.js';

export default class messageDeleteEvent extends BaseEvent {
  constructor() {
    super('messageDelete');
  }
  async run(client: DiscordClient, message: Message) {
    // mod logs safety fallback
    if ((message.channel as TextChannel).parentId !== '1122653175581777971')
      return;
    if (message.partial) {
      (client.channels.cache.get('1043698837501509692') as TextChannel).send({
        content: `Message with id ${message.id} was deleted.\n${[
          '```json',
          JSON.stringify(message, null, '\t'),
          '```',
        ].join('\n')}`,
      });
      return;
    }
    (client.channels.cache.get('1043698837501509692') as TextChannel).send({
      content: message.content,
      embeds: message.embeds,
      components: message.components,
      files: message.attachments.map((a) => a),
    });
  }
}
