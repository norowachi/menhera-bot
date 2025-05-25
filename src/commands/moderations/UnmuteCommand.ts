import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { CommandInteraction, GuildMember, EmbedBuilder } from 'discord.js';
import { removeModeration } from '../../database/functions/moderationFunction';

export default class UnmuteCommand extends BaseCommand {
  constructor() {
    super('unmute', 'moderation');
  }
  async run(client: DiscordClient, interaction: CommandInteraction) {
    const member = interaction.options.data[0].member as GuildMember;
    if (!member.roles.cache.has(client.muteRole.id)) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('❗ This user is not muted');
      await interaction.reply({ embeds: [embed] });
      return;
    }
    await member.timeout(null);
    if (!client.mutes.has(member.id)) return;
    const { timeout, id } = client.mutes.get(member.id)!;
    clearTimeout(timeout);
    await removeModeration(id);
  }
}
