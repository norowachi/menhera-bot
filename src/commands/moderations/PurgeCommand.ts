import BaseCommand from '../../utils/structures/BaseCommand.js';
import DiscordClient from '../../client/client.js';
import { CommandInteraction, TextChannel } from 'discord.js';

export default class PurgeCommand extends BaseCommand {
  constructor() {
    super('purge', 'moderation', true);
  }

  async run(_client: DiscordClient, interaction: CommandInteraction) {
    await interaction.reply({
      content: 'Deleting Messages...',
      ephemeral: true,
    });
    const amount = interaction.options.data[0].value as number;
    const channel = interaction.channel as TextChannel;
    await channel.bulkDelete(amount, true);
  }
}
